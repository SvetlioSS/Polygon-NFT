const hre = require('hardhat');
const ChildTunnel = require('../artifacts/contracts/ChildTunnel.sol/ChildTunnel.json');
const RootTunnel = require('../artifacts/contracts/RootTunnel.sol/RootTunnel.json');
const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

const mumbaiProvider = new hre.ethers.providers.JsonRpcProvider(
  process.env.MUMBAI_ALCHEMY_URL
);
const goerliProvider = new hre.ethers.providers.JsonRpcProvider(
  process.env.GOERLI_ALCHEMY_URL
);

const walletMumbai = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  mumbaiProvider
);
const walletGoerli = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  goerliProvider
);

module.exports = async (root, child, childToken) => {
  console.log('Setting tunnels...');

  const childTunnel = new hre.ethers.Contract(
    child,
    ChildTunnel.abi,
    walletMumbai
  );
  await childTunnel.setFxRootTunnel(root);

  const rootTunnel = new hre.ethers.Contract(
    root,
    RootTunnel.abi,
    walletGoerli
  );
  await rootTunnel.setFxChildTunnel(child);

  const fxLimeGameItem = new hre.ethers.Contract(
    childToken,
    FxLimeGameItem.abi,
    walletMumbai
  );
  await fxLimeGameItem.setFxManager(childTunnel.address);
  
  console.log('Tunnels ready...');
};
