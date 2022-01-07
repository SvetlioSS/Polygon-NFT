const functions = require('firebase-functions');
const admin = require('firebase-admin');
const ethers = require('ethers');
const FxLimeGameItem = require('./abis/FxLimeGameItem.json');

admin.initializeApp();

exports.mint = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 300,
  })
  .https.onRequest(async (request, response) => {
    const securityKey = functions.config().security.key;
    const key = request.query.key;
    const address = request.query.address;

    if (key !== securityKey) {
      response.status(403).json({ error: 'Missing or incorrect security key!' });
      return;
    } else if (!address) {
      response.status(400).json({ error: 'Missing or incorrect address!' });
      return;
    }

    const privateKey = functions.config().security.privatekey;
    const publicKey = functions.config().security.publickey;
    const providerUrl = functions.config().security.providerurl;
    const nftAddress = functions.config().nft.address;
    const nft1 = functions.config().nft.meta1;
    const nft2 = functions.config().nft.meta2;
    const nft3 = functions.config().nft.meta3;

    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(nftAddress, FxLimeGameItem.abi, wallet);

    // 1 NFT
    const transaction1 = await contract['mint(address,string)'](address, nft1);
    await transaction1.wait();

    // 2 NFT
    const transaction2 = await contract['mint(address,string)'](address, nft2);
    await transaction2.wait();

    // 3 NFT
    const transaction3 = await contract['mint(address,string)'](address, nft3);
    await transaction3.wait();

    response.status(200).json({ success: 'Success' });
  });
