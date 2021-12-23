const hre = require('hardhat');

const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.MUMBAI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async () => {
  console.log('Debugging...');

  const fxLimeGameItem = new hre.ethers.Contract(
    '0x0fc56Fc7bAd638047D857e11D6acF086EA4A27c3',
    FxLimeGameItem.abi,
    wallet
  );

  // console.log(await fxLimeGameItem.ownerOf(0));
  console.log(await fxLimeGameItem.tokenURI(0));
  console.log('Debugging finished...');
};
