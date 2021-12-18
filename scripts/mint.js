const hre = require("hardhat");
const { NFTStorage, File } = require("nft.storage");
const fs = require("fs");
const storage = new NFTStorage({ token: process.env.NFT_STORAGE_API_KEY });
const LimeGameItem = require("../artifacts/contracts/LimeGameItem.sol/LimeGameItem.json");

const provider = new hre.ethers.providers.JsonRpcProvider(
  "https://polygon-mumbai.g.alchemy.com/v2/W6txy-iufqn51fzpLTwAw3fzd2l5J6i4"
);

const wallet = new hre.ethers.Wallet(
  process.env.NFT_OWNER_PRIVATE_KEY,
  provider
);

const limeGameItemContract = new hre.ethers.Contract(
  "0x079F3474b0EEadf866C40566b45B41A31139519F",
  LimeGameItem.abi,
  wallet
);

const mint = async (name, description, filePath, fileName, type) => {
  console.log('Minting "%d"', name);

  const metadata = await storage.store({
    name,
    description,
    image: new File([await fs.promises.readFile(filePath)], fileName, { type }),
  });

  console.log("IPFS URL for the metadata:", metadata.url);
  console.log("metadata.json contents:\n", metadata.data);
  console.log(
    "metadata.json contents with IPFS gateway URLs:\n",
    metadata.embed()
  );

  await limeGameItemContract.safeMint(
    process.env.NFT_OWNER_PUBLIC_KEY,
    metadata.url
  );

  console.log('Minting "%d" finished', name);
};

module.exports = async () => {
  await mint(
    "The Dwarf Killer",
    "To kill a dwarf or not to kill a dwarf? This is the question.",
    "./assets/the-dwarf-killer.jpg",
    "the-dwarf-killer.jpg",
    "image/jpg"
  );

  await mint(
    "Shield of Vengeance",
    "For vengeance!",
    "./assets/shield-of-vengeance.jpg",
    "shield-of-vengeance.jpg",
    "image/jpg"
  );

  await mint(
    "Swords of Justice",
    "Kill the unworthy ones!",
    "./assets/swords-of-justice.jpg",
    "swords-of-justice.jpg",
    "image/jpg"
  );
};
