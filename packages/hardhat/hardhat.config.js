require('dotenv').config({ path: '../../.env' });
require('@nomiclabs/hardhat-waffle');

task('accounts', 'Prints the list of accounts', async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task('deploy-testnets', 'Deploys contract on a provided network').setAction(
  async () => {
    const deploy = require('./scripts/deploy');
    await deploy();
  }
);

task('mint', 'Mints some NFTs on a provided network').setAction(async () => {
  const mint = require('./scripts/mint');
  await mint();
});

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  defaultNetwork: 'matic',
  networks: {
    hardhat: {},
    matic: {
      url: 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4',
      accounts: [process.env.NFT_OWNER_PRIVATE_KEY],
    },
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
