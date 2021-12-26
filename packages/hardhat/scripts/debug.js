const hre = require('hardhat');

const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.MUMBAI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async () => {
  console.log('Debugging...');

  const token = new hre.ethers.Contract(
    '0x84e1106170366244cE1DEFd03Eb8caA5b6C5D02D',
    FxLimeGameItem.abi,
    wallet
  );

  console.log(await token.ownerOf(0));
  console.log(await token.tokenURI(0));
  
  // const mockCommand = await childTunnel.mockCommand();
  // const mockRootToken = await childTunnel.mockRootToken();
  // const mockSender = await childTunnel.mockSender();
  // const mockUser = await childTunnel.mockUser();
  // const mockTokenId = await childTunnel.mockTokenId();
  // const mockUri = await childTunnel.mockUri();

  // console.log('mockCommand ', mockCommand);
  // console.log('mockRootToken ', mockRootToken);
  // console.log('mockSender ', mockSender);
  // console.log('mockUser ', mockUser);
  // console.log('mockTokenId ', mockTokenId);
  // console.log('mockUri ', mockUri);
  // console.log(JSON.stringify(childTunnel, null, 2));
  console.log('Debugging finished...');
};
