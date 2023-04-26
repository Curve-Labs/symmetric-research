echo "Deploying 2 Test Tokens";

echo "Confirm you have added necessary enviornment variables to ./apps/contracts/.env file";
read ENV_CONFIRMATION

echo "Installing dependencies"
yarn install

echo "Deploying 2 Test Tokens"
yarn contracts hardhat deploy --network celo --tags TestTokens
