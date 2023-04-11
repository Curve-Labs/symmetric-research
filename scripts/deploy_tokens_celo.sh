echo "Deploying 2 Test Tokens";

echo "Confirm you have added necessary enviornment variables to ./apps/contracts/.env file";
read ENV_CONFIRMATION

echo "Installing dependencies"
yarn install

cd apps/contracts

echo "Deploying 2 Test Tokens"
yarn hardhat deploy --network celo -- tags TestTokens

cd ../..