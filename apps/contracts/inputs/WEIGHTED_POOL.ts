import { parseEther } from "ethers/lib/utils";

export const name = "Kolektivo Weighted Pool";
export const symbol = "kCur <> cUSD";
export const token1 = "0xE858F83EB705F84aC7997839625D0Efd87cf60b5"; // kCur-T
export const amount1 = "25543300000000000000";
export const amount2 = "50000000000000000000";
export const token2 = "0xeB22fD1Dc0F480faA0D5cce673364b31E5f1e772"; // cUSD-M
export const weight1 = parseEther("0.4");
export const weight2 = parseEther("0.6");
export const swapFeePercentage = "10000000000000000"; // 0.01 % || 10^18 = 1%
export const ownerAddress = "0x562F16423C724fE47ee27aABaD43C519F4fCbed0";
