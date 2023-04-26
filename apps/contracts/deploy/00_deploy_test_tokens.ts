import { DeployFunction } from "hardhat-deploy/dist/types";

const deployFunction: DeployFunction = async (hre) =>  {
    const {ethers, deployments} = hre;
    const {deploy} = deployments;
    const [signer] = await ethers.getSigners();
    const name = "Kolektivo Guilder";
    const symbol = "kGuilder";

    const {address: token1Address} = await deploy("TestToken", {
        from: signer.address,
        args: [name+1, symbol+1],
        log: true
    });

    const {address: token2Address} = await deploy("TestToken", {
        from: signer.address,
        args: [name+2, symbol+2],
        log: true
    });

    console.log({token1Address, token2Address});
}

deployFunction.tags = ["TestTokens"];
export default deployFunction;