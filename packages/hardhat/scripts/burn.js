const hre = require('hardhat');

const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.MUMBAI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async address => {
  console.log('Burning...')

  const fxLimeGameItem = new hre.ethers.Contract(
    address,
    FxLimeGameItem.abi,
    wallet
  );

  await fxLimeGameItem.burn(0);
  console.log('Token 1 burned...')

  await fxLimeGameItem.burn(1);
  console.log('Token 2 burned...')

  await fxLimeGameItem.burn(2);
  console.log('Token 3 burned...')

  console.log('DONE...')
};
