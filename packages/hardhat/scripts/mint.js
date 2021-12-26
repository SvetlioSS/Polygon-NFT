const hre = require('hardhat');
const { NFTStorage, File } = require('nft.storage');
const fs = require('fs');
const storage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });

const FxLimeGameItem = require('../artifacts/contracts/FxLimeGameItem.sol/FxLimeGameItem.json');

// const provider = new hre.ethers.providers.JsonRpcProvider(process.env.MUMBAI_ALCHEMY_URL);
const provider = new hre.ethers.providers.JsonRpcProvider(process.env.GOERLI_ALCHEMY_URL);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

const mint = async (contract, name, description, filePath, fileName, type) => {
  console.log('Minting "%s"', name);

  const metadata = await storage.store({
    name,
    description,
    image: new File([await fs.promises.readFile(filePath)], fileName, { type }),
  });

  console.log('IPFS URL for the metadata:', metadata.url);
  console.log('metadata.json contents:\n', metadata.data);
  console.log(
    'metadata.json contents with IPFS gateway URLs:\n',
    metadata.embed()
  );

  const transaction = await contract.mint(
    process.env.NFT_OWNER_PUBLIC_KEY,
    metadata.url
  );
  await transaction.wait();

  console.log('Minting "%s" finished', name);
};

module.exports = async contract => {
  const fxLimeGameItem = new hre.ethers.Contract(
    contract,
    FxLimeGameItem.abi,
    wallet
  );

  await mint(
    fxLimeGameItem,
    'The Dwarf Killer',
    'To kill a dwarf or not to kill a dwarf? This is the question.',
    './assets/the-dwarf-killer.jpg',
    'the-dwarf-killer.jpg',
    'image/jpg'
  );

  await mint(
    fxLimeGameItem,
    'Shield of Vengeance',
    'For vengeance!',
    './assets/shield-of-vengeance.jpg',
    'shield-of-vengeance.jpg',
    'image/jpg'
  );

  await mint(
    fxLimeGameItem,
    'Swords of Justice',
    'Kill the unworthy ones!',
    './assets/swords-of-justice.jpg',
    'swords-of-justice.jpg',
    'image/jpg'
  );
};
