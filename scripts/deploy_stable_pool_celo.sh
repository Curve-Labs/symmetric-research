echo "Deploying stable pool";
echo "Confirm that you have verified parameters at ./apps/contracts/inputs/contants.ts file";
read CONFIRMATION
echo "Thanks for confirming!"

echo "Confirm you have added necessary enviornment variables to ./apps/contracts/.env file";
read ENV_CONFIRMATION

echo "Installing dependencies"
yarn install

echo "Deploying Stable pool"
yarn contracts hardhat createStablePool --network celo