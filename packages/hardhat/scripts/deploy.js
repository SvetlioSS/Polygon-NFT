const hre = require('hardhat');

module.exports = async (contractName, ...args) => {
  await hre.run('compile');
  const [deployer] = await ethers.getSigners();

  console.log('Deploying contract with the account: ' + deployer.address);
  console.log('Account balance: ' + (await deployer.getBalance()).toString());

  const contractFactory = await ethers.getContractFactory(contractName);
  const contract = await contractFactory.deploy(...args);
  
  console.log(`Waiting for ${contractName} deployment...`);

  await contract.deployed();

  console.log(`${contractName} Contract address: ${contract.address}`);
  console.log('Done!');
  return contract.address;
};
