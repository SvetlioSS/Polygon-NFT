# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Deploying:

Matic: 
	NFT: 0x0fc56Fc7bAd638047D857e11D6acF086EA4A27c3
	Tunnel: 0xCa54471E56Fb95491ac6A7Ac8D3d2B6459d3dd73
Goerli: 
	NFT: 0x4364bbCa36f110ca3297a3527Bd71290D1197ff4
	Tunnel: 0x33C7F1E13e61fFdBEd34F2b5bD0361F77748df6F

```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0x33C7F1E13e61fFdBEd34F2b5bD0361F77748df6F" --child "0xCa54471E56Fb95491ac6A7Ac8D3d2B6459d3dd73"
yarn hardhat:mint --address "0x4364bbCa36f110ca3297a3527Bd71290D1197ff4"

yarn hardhat:verify:goerli "0x4364bbCa36f110ca3297a3527Bd71290D1197ff4"
yarn hardhat:verify:goerli "0x33C7F1E13e61fFdBEd34F2b5bD0361F77748df6F"
yarn hardhat:verify:mumbai "0x0fc56Fc7bAd638047D857e11D6acF086EA4A27c3"
yarn hardhat:verify:mumbai "0xCa54471E56Fb95491ac6A7Ac8D3d2B6459d3dd73"
```

Deployment steps:
1. Run commands
```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0x772598929bc0e9aE53D86d8d5c344717c2a1ff0a" --child "0xd86b39f1A04Df33dA66153873Fb28DD7230c121C"
yarn hardhat:mint --address "0x634ef21F048f48e992dB3f41EBe9573f19a7AA0D"
yarn hardhat:verify:mumbai "0x9f1fc793B4Aba99d0D55b89Eb9558b498d08e677"
yarn hardhat:verify:goerli "0x9f1fc793B4Aba99d0D55b89Eb9558b498d08e677"
```

2. Update matamask tokens
3. Copy and Replace abis in react-app
4. Set the new contract addresses in contracts.ts
