# Overview
public URL https://polygon-nft.web.app/

Latest deployed contract addresses:
1. (Child) Polygon Mumbai NFT - 0x62da2F5132B4e3CBE5afD3905F3D4888b975f8f9
2. (Child) Polygon Mumbai Tunnel - 0x24d1cdf9a1e5C589A2981E07CE06e7E0E9Edce75
3. (Root) Ethereum Goerli NFT - 0x610CE1cf222a50d9000BD05Da14f93475011C094
4. (Root) Ethereum Goerli Tunnel - 0xc09f72Fa66CC411069220a86B1f8Db418098fab8

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
