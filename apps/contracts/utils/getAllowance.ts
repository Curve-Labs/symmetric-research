import { Address } from "hardhat-deploy/dist/types";
import { IERC20 } from "../typechain-types";

async function getAllowance (vaultAddress: Address, tokenAddress: Address, ownerAddress: Address, ethers: any) {
    const tokenInstance = await ethers.getContractAt("IERC20", tokenAddress) as IERC20;
    const allowance = await tokenInstance.allowance(ownerAddress, vaultAddress);
    return allowance;
}

export default getAllowance;