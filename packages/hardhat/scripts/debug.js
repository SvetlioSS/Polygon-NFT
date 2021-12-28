const hre = require('hardhat');

const RootTunnel = require('../artifacts/contracts/RootTunnel.sol/RootTunnel.json');
// const ChildTunnel = require('../artifacts/contracts/ChildTunnel.sol/ChildTunnel.json');
// const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.GOERLI_ALCHEMY_URL);
// const provider = new hre.ethers.providers.JsonRpcProvider(process.env.MUMBAI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async () => {
  console.log('Debugging...');

  // const maticPOSClient = new require("@maticnetwork/maticjs").MaticPOSClient({
  //   network: "testnet", // when using mainnet, replace to "mainnet" 
  //   version: "mumbai",  // when using mainnet, replace to "v1"
  //   maticProvider: 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4',
  //   parentProvider: 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb'
  // });

  // const proof = await maticPOSClient.posRootChainManager
  //   .customPayload(
  //     "0x70dd87fc8d1ac04e7f486b2fd37d5bc6289239e0cb7c9a57a1d31d3cfa7c1505", // replace with txn hash of sendMessageToRoot
  //     "0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036" // SEND_MESSAGE_EVENT_SIG, do not change
  //   );

  const rootTunnel = new hre.ethers.Contract(
    '0x8344e70315420adC6D2f932653cE6572d4b6B2D8',
    RootTunnel.abi,
    wallet
  );

  // console.log(await rootTunnel.ownerOf(1));


  // const Matic = require("@maticnetwork/maticjs").default;
  // const matic = new Matic({
  //   network: "testnet", // when using mainnet, replace to "mainnet" 
  //   version: "mumbai",  // when using mainnet, replace to "v1"
  //   maticProvider: 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4',
  //   parentProvider: 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb'
  // });
  // const exit_manager = matic.withdrawManager.exitManager;
  // const BURN_HASH = '0x70dd87fc8d1ac04e7f486b2fd37d5bc6289239e0cb7c9a57a1d31d3cfa7c1505';
  // const SIG = '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036';
  // const proof = await exit_manager.buildPayloadForExitHermoine(BURN_HASH, SIG);
  // console.log("Burn proof:", proof);

  // await rootTunnel.receiveMessage(proof);

  console.log(await rootTunnel.number());

  // TxHash: 0x70dd87fc8d1ac04e7f486b2fd37d5bc6289239e0cb7c9a57a1d31d3cfa7c1505
  
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
