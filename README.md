# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Deploying:

Matic: 
	NFT: 0x84e1106170366244cE1DEFd03Eb8caA5b6C5D02D
	Tunnel: 0x0188EdC7dD2d0cD60aC1fA878765e660200B656b
Goerli: 
	NFT: 0x49002dAd19975AB01007274E460717A7D3a68A8A
	Tunnel: 0xc541a969Dfb626C1B806E336Ca85256Cc7EdcB5F


```shell
yarn hardhat:deploy:mumbai
yarn hardhat:deploy:goerli
yarn hardhat:connect --root "0xc541a969Dfb626C1B806E336Ca85256Cc7EdcB5F" --child "0x0188EdC7dD2d0cD60aC1fA878765e660200B656b" --child-token "0x84e1106170366244cE1DEFd03Eb8caA5b6C5D02D"
yarn hardhat:mint --address "0x49002dAd19975AB01007274E460717A7D3a68A8A"

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
yarn hardhat:verify:mumbai "0x2eEDFCC40a3a3A3fefe929b32Ac14Ab540F3D551"
yarn hardhat:verify:goerli "0x4703eB1793BFa49C57433c7cE6AA793bB4Ab21a4"
```

2. Update matamask tokens
3. Copy and Replace abis in react-app
4. Set the new contract addresses in contracts.ts
