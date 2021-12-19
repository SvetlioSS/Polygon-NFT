const hre = require('hardhat');

module.exports = async () => {
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contracts with the account: ' + deployer.address);
  console.log('Account balance: ' + (await deployer.getBalance()).toString());

  const LimeGameItem = await ethers.getContractFactory('LimeGameItem');
  const LimeGameItemContract = await LimeGameItem.deploy();

  console.log('Waiting for LimeGameItem deployment...');

  await LimeGameItemContract.deployed();

  console.log('LimeGameItem Contract address: ' + LimeGameItemContract.address);
  console.log('Done!');
};
