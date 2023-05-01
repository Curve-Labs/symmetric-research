import { task } from "hardhat/config";
import { ActionType, HardhatRuntimeEnvironment } from "hardhat/types";
import { IVault, IWeightedPoolFactory } from "../typechain-types";
import {
  name,
  symbol,
  token1,
  token2,
  amount1,
  amount2,
  weight1,
  weight2,
  swapFeePercentage,
  ownerAddress,
} from "../inputs/WEIGHTED_POOL";
import { LogDescription } from "ethers/lib/utils";
import promptSync from "prompt-sync";
import {
  AssetHelpers,
  JoinPoolRequest,
  WeightedPoolEncoder,
} from "@balancer-labs/balancer-js";
import { BigNumberish } from "ethers";
import { Address } from "hardhat-deploy/dist/types";
import getAllowance from "../utils/getAllowance";
import updateAllowance from "../utils/updateAllowance";

const weightedPoolFactoryAddress = "0x47B7bdA16AB8B617E976c83A2c3c8664944d8Ed2";
const vaultAddress = "0xD25E02047E76b688445ab154785F2642c6fe3f73";
const wethAddress = "0x122013fd7dF1C6F636a5bb8f03108E876548b455";

const assetHelpers = new AssetHelpers(wethAddress);
const prompt = promptSync();

async function createWeightedPool({}, hre: HardhatRuntimeEnvironment) {
  const { ethers, network } = hre;
  const [signer] = await ethers.getSigners();

  // prepare token parameters
  const tokens: Array<Address> = [token1, token2];
  const amounts: Array<BigNumberish> = [amount1, amount2];

  console.log(
    `Deploying weighted pool on ${network.name} using deployer address ${signer.address}`
  );

  console.log(`Using parameters:
  ${JSON.stringify({
    name: name,
    symbol: symbol,
    token1: token1,
    amount1: amount1,
    weight1: weight1,
    token2: token2,
    amount2: amount2,
    weight2: weight2,
    ownerAddress: ownerAddress,
    swapFeePercentage: swapFeePercentage,
  }, undefined, 4)}
  `);
  const input = prompt("Enter Y to confirm parameters:  ");
  if (input.toLowerCase() !== "y") {
    throw Error("You need to confirm Parameters before moving ahead.");
  }
  console.log("Process Started ...");
  console.log(
    `Creating instance of Weighted Pool Factory deployed on ${network.name} at ${weightedPoolFactoryAddress}`
  );

  const weightedPoolFactory = (await ethers.getContractAt(
    "IWeightedPoolFactory",
    weightedPoolFactoryAddress,
    signer
  )) as IWeightedPoolFactory;

  const PoolRegisteredAbi = [
    "event PoolRegistered(bytes32 indexed poolId, address indexed poolAddress, uint8 specialization)",
  ];

  const PoolRegisteredInterface = new ethers.utils.Interface(PoolRegisteredAbi);

  console.log("Deploying Weighted Pool now...");
  const transaction = await weightedPoolFactory.create(
    name,
    symbol,
    [token1, token2],
    [weight1, weight2],
    swapFeePercentage,
    ownerAddress
  );

  console.log(
    `Transaction submitted on ${network.name} with transaction hash: ${transaction.hash}`
  );

  console.log("Waiting for transaction to be confirmed...");
  const receipt = await transaction.wait();
  console.log("Transaction Confirmed");
  console.log("Finding Pool Details...");
  if (receipt.events === undefined) {
    console.error("Failed");
    throw Error("Transaction Failed");
  }
  let poolRegisteredEvent: LogDescription;
  receipt.events.filter((event) => {
    try {
      poolRegisteredEvent = PoolRegisteredInterface.parseLog(event);
      return true;
    } catch (e) {
      return false;
    }
  });
  console.log("Found Pool details.");
  // @ts-ignore
  const poolDetails = {
    // @ts-ignore
    address: poolRegisteredEvent.args.poolAddress,
    // @ts-ignore
    poolId: poolRegisteredEvent.args.poolId,
  };
  console.log("Pool Details:", poolDetails);

  // add liquidity and initialise
  console.log(
    "Note: If you don't add liquidity now, you will have to add later manually"
  );
  const joinPoolInput = prompt(
    "Do you want to add liquidity to the pool now? Enter Y to add liquidity now:"
  );
  if (joinPoolInput.toLowerCase() !== "y") {
    throw Error("Please add liquidity to Pool manually now.");
  }

  console.log(
    `Adding liquidity to Pool with Pool Id ${poolDetails.poolId} now...`
  );
  console.log("Getting Vault instance");
  // get Vault instance
  const vaultInstance = (await ethers.getContractAt(
    "IVault",
    vaultAddress
  )) as IVault;

  console.log("Building parameters for Join Pool Request");
  // generate JoinPoolRequest
  // sort tokens
  const [sortedTokens, sortedAmounts] = assetHelpers.sortTokens(
    tokens,
    amounts
  );

  const joinPoolRequestParams: JoinPoolRequest = {
    maxAmountsIn: sortedAmounts as Array<BigNumberish>,
    userData: WeightedPoolEncoder.joinInit(
      sortedAmounts as Array<BigNumberish>
    ),
    fromInternalBalance: false,
    assets: sortedTokens,
  };

  // add allowance for vault
  console.log(
    "Before adding liqudity we need to ensure enough token approval is given"
  );
  const allowances = await Promise.all(
    sortedTokens.map((token) =>
      getAllowance(vaultAddress, token, signer.address, ethers)
    )
  );

  // update allowance if needed
  if (allowances[0].lt(ethers.BigNumber.from(sortedAmounts[0]))) {
    await updateAllowance(
      vaultAddress,
      tokens[0],
      ethers.BigNumber.from(sortedAmounts[0]),
      signer,
      ethers
    );
  }
  if (allowances[1].lt(ethers.BigNumber.from(sortedAmounts[1]))) {
    await updateAllowance(
      vaultAddress,
      tokens[1],
      ethers.BigNumber.from(sortedAmounts[1]),
      signer,
      ethers
    );
  }

  // join pool
  console.log("Adding liqudity to Pool");
  console.log("Note: Pool tokens will be sent to Owner address");
  const joinPoolTransaction = await vaultInstance.joinPool(
    poolDetails.poolId,
    signer.address,
    ownerAddress,
    joinPoolRequestParams
  );
  console.log(
    `Submitted Join Pool Transaction on ${network.name} with hash ${joinPoolTransaction.hash}`
  );
  console.log("waiting for receipt...");
  const joinPoolReceipt = await joinPoolTransaction.wait();
  console.log("Successfully added liqudity to the pool");

  // log final details and save them somewhere
  const PoolBalanceChangedAbi = [
    "event PoolBalanceChanged(bytes32 indexed poolId,address indexed liquidityProvider,address[] tokens,int256[] deltas,uint256[] protocolFeeAmounts);",
  ];
  const PoolBalanceChangedInterface = new ethers.utils.Interface(
    PoolBalanceChangedAbi
  );
  let poolBalanceChangedEvent: LogDescription;
  if (joinPoolReceipt.events === undefined) {
    console.error("Failed");
    throw Error("Transaction Failed");
  }
  joinPoolReceipt.events.filter((event) => {
    try {
      poolBalanceChangedEvent = PoolBalanceChangedInterface.parseLog(event);
      return true;
    } catch (e) {
      return false;
    }
  });
  console.log("Liquidity added to the pool Successfully");
  console.log("Liqudity Addition details:", {
    // @ts-ignore
    poolId: poolBalanceChangedEvent.args.poolId,
    // @ts-ignore
    liquidityProvider: poolBalanceChangedEvent.args.liquidityProvider,
    // @ts-ignore
    tokens: poolBalanceChangedEvent.args.tokens,
    // @ts-ignore
    deltas: poolBalanceChangedEvent.args.deltas.map((delta) =>
      delta.toString()
    ),
    // @ts-ignore
    protocolFeeAmounts: poolBalanceChangedEvent.args.protocolFeeAmounts.map(
      (feeAmount: any) => feeAmount.toString()
    ),
  });
}

task("createWeightedPool", "Create Weighted Pool").setAction(createWeightedPool);
