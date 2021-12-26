const hre = require('hardhat');
const MaticPOSClient = require('@maticnetwork/maticjs').MaticPOSClient

const maticPOSClient = new MaticPOSClient({
  network: "testnet",
  version: "mumbai",
  parentProvider: process.env.GOERLI_ALCHEMY_URL,
  maticProvider: process.env.MUMBAI_ALCHEMY_URL
});

const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');
const FxLimeGameItemRootTunnel = require('../artifacts/contracts/FxLimeGameItemRootTunnel.sol/FxLimeGameItemRootTunnel.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.GOERLI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async () => {
  console.log('Depositing...')

  const rootTokenAddress = '0x9f1fc793B4Aba99d0D55b89Eb9558b498d08e677';
  const rootTunnelAddress = '0x34E67C845168131800e6790f8B7b7c7f3acB15A9';

  const fxLimeGameItem = new hre.ethers.Contract(
    rootTokenAddress,
    FxLimeGameItem.abi
  );

  const fxRootTunnel = new hre.ethers.Contract(
    rootTunnelAddress,
    FxLimeGameItemRootTunnel.abi
  );

  // await fxLimeGameItem.methods
  //   .approve(erc721Predicate, tokenId)
  //   .send({ from: "0x4A8C755C8715D813E9d8580411D44Ea23882BCCE" })

  const tokenId = 1;
  const tokenURI = await fxLimeGameItem.tokenURI(tokenId);
  console.log('Awaiting approval...');
  await fxLimeGameItem.approve(rootTunnelAddress, tokenId);
  console.log('Awaiting deposit...');
  await fxRootTunnel.deposit(rootTokenAddress, '0x4A8C755C8715D813E9d8580411D44Ea23882BCCE', tokenId, tokenURI);
  console.log('DONE...')
};
