# Overview
public URL https://polygon-nft.web.app/

Latest deployed contract addresses:
1. (Child) Polygon Mumbai NFT - 0x856AA9cF080a489c9D0dC8570EaA3d153a2F9a0f
2. (Child) Polygon Mumbai Tunnel - 0x544EF44C9dd252447cD259718c80b648cf454D20
3. (Root) Ethereum Goerli NFT - 0xA1fff972D804FEe7AfdF1ADB50977D6aDd09d227
4. (Root) Ethereum Goerli Tunnel - 0x196abE4F3a1466ed65Ce25EC537Ad8dE51b9355f

# Starting the project
1. Create a .env file using the .env.example and provide all required keys.
2. run yarn install at the root of the project.
```shell
yarn install
```
3. to start the react app run:
```shell
yarn react-app:start
```

# Deployment Steps
1. Run commands
```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "<root tunnel address>" --child "<child tunnel address>" --child-token "<child nft address>"
yarn hardhat:mint --address "<root nft address>"
```
2. Copy and Replace abis in react-app
3. Set the new contract addresses in contracts.ts
4. Build react app
```shell 
yarn react-app:build
```
5. Deploy react app to firebase hosting
```shell 
yarn react-app:deploy
```
