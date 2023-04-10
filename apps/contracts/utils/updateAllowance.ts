import { Address } from "hardhat-deploy/dist/types";
import { IERC20 } from "../typechain-types";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

async function updateAllowance(
  vaultAddress: Address,
  tokenAddress: Address,
  amount: BigNumber,
  signer: SignerWithAddress,
  ethers: any
) {

  console.log(
    `Approving allowance for ${vaultAddress} to spend ${amount.toString()} from owner account ${
      signer.address
    }`
  );
  const tokenInstance = (await ethers.getContractAt(
    "IERC20",
    tokenAddress,
    signer
  )) as IERC20;
  const transaction = await tokenInstance.approve(vaultAddress, amount);
  console.log(`Approval transaction submitted with hash ${transaction.hash}`);
  await transaction.wait();
  console.log("Approval successfull!");
}

export default updateAllowance;
