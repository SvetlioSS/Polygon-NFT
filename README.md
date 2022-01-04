# Overview
public URL https://polygon-nft.web.app/

# Deployment Steps

Matic: 
	NFT: 0x856AA9cF080a489c9D0dC8570EaA3d153a2F9a0f
	Tunnel: 0x544EF44C9dd252447cD259718c80b648cf454D20
Goerli: 
	NFT: 0xA1fff972D804FEe7AfdF1ADB50977D6aDd09d227
	Tunnel: 0x196abE4F3a1466ed65Ce25EC537Ad8dE51b9355f

Deployment steps:
1. Run commands
```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0x196abE4F3a1466ed65Ce25EC537Ad8dE51b9355f" --child "0x544EF44C9dd252447cD259718c80b648cf454D20" --child-token "0x856AA9cF080a489c9D0dC8570EaA3d153a2F9a0f"
yarn hardhat:mint --address "0xA1fff972D804FEe7AfdF1ADB50977D6aDd09d227"
```

2. Copy and Replace abis in react-app
3. Set the new contract addresses in contracts.ts
