require('dotenv').config({ path: '../../.env' });
require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-etherscan');

const isPolygon = process.argv.some(n => ['polygon', 'mumbai'].indexOf(n) >= 0);

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  console.log(JSON.stringify(taskArgs, null, 2));
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('deploy-testnets', 'Deploys contract on a provided network').setAction(
  async () => {
    const deploy = require('./scripts/deploy');
    if (isPolygon) {
      const address = await deploy('FxLimeGameItem');
      await deploy(
        'ChildTunnel',
        process.env.MUMBAI_FXCHILD_ADDRESS,
        address
      );
    } else {
      await deploy('FxLimeGameItem');
      await deploy(
        'RootTunnel',
        process.env.GOERLI_CHECKPOINT_MANAGER_ADDRESS,
        process.env.GOERLI_FXROOT_ADDRESS
      );
    }
  }
);

task('mint', 'Mints some NFTs on a provided network')
  .addParam(
    'address',
    'The contract address that will get the newly minted tokens'
  )
  .setAction(async taskArgs => {
    const mint = require('./scripts/mint');
    await mint(taskArgs.address);
  });

task('burn', 'Burns the minted tokens')
  .addParam(
    'address',
    'The contract address which tokens will be burned'
  )
  .setAction(async taskArgs => {
    const burn = require('./scripts/burn');
    await burn(taskArgs.address);
  });

task('deposit', 'Deposits a token from Goerli to Mumbai')
  .setAction(async () => {
    const deposit = require('./scripts/deposit');
    await deposit();
  });

task('debug', 'Debug task that change')
  .setAction(async () => {
    const debug = require('./scripts/debug');
    await debug();
  });

task('connect', 'Connects an Ethereum contract with a Polygon one')
  .addParam('root', 'The Root Contract address')
  .addParam('child', 'The Child Contract address')
  .addParam('childToken', 'The Child Token address')
  .setAction(async taskArgs => {
    const connect = require('./scripts/connect');
    await connect(taskArgs.root, taskArgs.child, taskArgs.childToken);
  });

// Workaround until @nomiclabs/hardhat-etherscan provide support for multiple api keys.
const getApiKey = () => {
  if (isPolygon) {
    return process.env.POLYGONSCAN_API_KEY;
  } else {
    return process.env.ETHERSCAN_API_KEY;
  }
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'mumbai',
  networks: {
    hardhat: {},
    mumbai: {
      url: process.env.MUMBAI_ALCHEMY_URL,
      accounts: [process.env.NFT_OWNER_PRIVATE_KEY],
    },
    goerli: {
      url: process.env.GOERLI_ALCHEMY_URL,
      accounts: [process.env.NFT_OWNER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: getApiKey(),
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
