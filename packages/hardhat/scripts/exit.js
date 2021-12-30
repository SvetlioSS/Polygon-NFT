const hre = require('hardhat');
const { POSClient, use, setProofApi } = require("@maticnetwork/maticjs");
const { Web3ClientPlugin } = require('@maticnetwork/maticjs-web3');
use(Web3ClientPlugin);
const client = new POSClient();

setProofApi('https://apis.matic.network/');

const RootTunnel = require('../artifacts/contracts/RootTunnel.sol/RootTunnel.json');

const provider = new hre.ethers.providers.JsonRpcProvider(process.env.GOERLI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

module.exports = async () => {
  await client.init({
    network: "testnet",
    version: "mumbai",
    parent: {
      provider: 'https://eth-goerli.alchemyapi.io/v2/kbgkxIOiGn6EE2p5JKCDUQ6XIuZ0S3Gb',
      defaultConfig: {
        from: process.env.NFT_OWNER_PUBLIC_KEY
      }
    },
    child: {
      provider: 'https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4',
      defaultConfig: {
        from: process.env.NFT_OWNER_PUBLIC_KEY
      }
    }
  });

  console.log('Burning...')

  const rootTunnel = new hre.ethers.Contract(
    '0x7c0a941A23D89798996E1e2cD4c467C9D1A5A74d',
    RootTunnel.abi,
    wallet
  );

  const txHash = '0xfd7d6cb24384d45d79a245fbd264f78c7bdf612ab7a65325b1374648791ed1e2';
                    
  const isCheckpointed = await client.isCheckPointed(txHash);
  if (!isCheckpointed) {
    console.log('NOT CHECKPOINTED');
    return;
  }

  console.log('Preparing proof...');

  const proof = await client.exitUtil.buildPayloadForExit(
    txHash,
    '0x8c5261668696ce22758910d05bab8f186d6eb247ceac2af2e82c7dc17669b036',
    true
  );

  // const message = ethers.utils.defaultAbiCoder.encode(['string'], ['TEST']);

  console.log('Claiming...');
  await rootTunnel.receiveMessage(proof, { 
    gasLimit: 15e6,
    maxPriorityFeePerGas: 15e6,
    maxFeePerGas: 15e6,
  });
  console.log('Claimed.');
};
