const hre = require('hardhat');
const FxLimeGameItemChildTunnel = require('../artifacts/contracts/FxLimeGameItemChildTunnel.sol/FxLimeGameItemChildTunnel.json');
const FxLimeGameItemRootTunnel = require('../artifacts/contracts/FxLimeGameItemRootTunnel.sol/FxLimeGameItemRootTunnel.json');

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

module.exports = async (root, child) => {
  console.log('Setting tunnels...');

  const fxLimeGameItemChildTunnel = new hre.ethers.Contract(
    child,
    FxLimeGameItemChildTunnel.abi,
    walletMumbai
  );
  await fxLimeGameItemChildTunnel.setFxRootTunnel(root);

  const fxLimeGameItemRootTunnel = new hre.ethers.Contract(
    root,
    FxLimeGameItemRootTunnel.abi,
    walletGoerli
  );
  await fxLimeGameItemRootTunnel.setFxChildTunnel(child);
  
  console.log('Tunnels ready...');
};
