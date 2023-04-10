# Create Stable Pool

## Setup

### Enviornment Variables

Create a file `.env` and add following enviornment variables.
```sh
INFURA_KEY=YOUR_INFURA_KEY
PRIVATE_KEY=YOUR_PRIVATE_KEY
NOT_CI=false
```

### Inputs Setup

Edit `./inputs/STABLE_POOL.ts` file with your inputs for stable pool
```typescript
const name // name of Liquidity provider token
const symbol // symbol of Liquidity provider token
const token1 // address of token 1 to be added to pool
const amount1 // amount of token 1 to be added to pool as liquidity
const amount2 // amount of token 2 to be added to pool as liquidity
const token2 // address of token 2 to be added to pool
const amplificationNumber // amplification coeficient | plain number
const swapFeePercentage // swap fee percentage || 10^18 = 1%
const ownerAddress // address that will be the owner of pool and receive the liquidity pool tokens
```

## Getting Test Tokens

Ensure you are on root directory of this monorepo
```sh
>symmetric-research/ $
```

Run a command
```sh
yarn deploy:test:tokens
```

## Deploy stable Pool

Ensure you are on root directory of this monorepo
```sh
>symmetric-research/ $
```

Run a command
```sh
yarn create:stable:pool
```
