# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Deploying:

Matic: 
	NFT: 0x3D7d8c1A930A45d328ddAa535f8aD92A802D27a5
	Tunnel: 0xD05043122243E774d0246632c3Be65a06D57bfD4
Goerli: 
	NFT: 0x856AA9cF080a489c9D0dC8570EaA3d153a2F9a0f
	Tunnel: 0x544EF44C9dd252447cD259718c80b648cf454D20


```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0x544EF44C9dd252447cD259718c80b648cf454D20" --child "0xD05043122243E774d0246632c3Be65a06D57bfD4" --child-token "0x3D7d8c1A930A45d328ddAa535f8aD92A802D27a5"
yarn hardhat:mint --address "0x856AA9cF080a489c9D0dC8570EaA3d153a2F9a0f"

yarn hardhat:verify:goerli "0xE4581cD344903DbA6a5D6304A3b9c0db927cAe49"
yarn hardhat:verify:mumbai "0xF8fa292dB6D978F7b74B905f12976B6a93E84fC1"
```

Deployment steps:
1. Run commands
```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0x772598929bc0e9aE53D86d8d5c344717c2a1ff0a" --child "0xd86b39f1A04Df33dA66153873Fb28DD7230c121C" --child-token "setsdgsdg"
yarn hardhat:mint --address "0x02068BDa212854621893c6F4756b0EA93F401Aa4"
yarn hardhat:verify:mumbai "0x7C16a38B774c697524871e2B94e58d16D517D515"
yarn hardhat:verify:goerli "0x4703eB1793BFa49C57433c7cE6AA793bB4Ab21a4"
```

2. Update matamask tokens
3. Copy and Replace abis in react-app
4. Set the new contract addresses in contracts.ts
