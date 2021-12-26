const { expect } = require('chai');
const { ethers } = require('hardhat');

const randomAddress = '0x34E67C845168131800e6790f8B7b7c7f3acB15A9';

describe('Child Tunnel', function () {
  let fxLimeGameItemContract;
  let childTunnelContract;
  let owner;
  let addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();

    const fxLimeGameItemFactory = await ethers.getContractFactory(
      'FxLimeGameItem'
    );
    const fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    fxLimeGameItemContract = await fxLimeGameItem.deployed();

    const childTunnelFactory = await ethers.getContractFactory(
      'ChildTunnelMock'
    );
    const childTunnel = await childTunnelFactory.deploy(
      randomAddress,
      fxLimeGameItemContract.address
    );
    childTunnelContract = await childTunnel.deployed();

    await childTunnelContract.setFxRootTunnel(owner.address);
    await fxLimeGameItem.setFxManager(childTunnelContract.address);
  });

  it('Should have no tokens', async () => {
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(0);
  });

  it('Should successfully mint NFT after DEPOSIT command', async () => {
    const tokenURI = '';
    const tokenId = 0;

    const data = ethers.utils.defaultAbiCoder.encode(
      ['address', 'address', 'address', 'uint256', 'string'],
      [
        fxLimeGameItemContract.address,
        owner.address,
        addr1.address,
        tokenId,
        tokenURI,
      ]
    );

    const message = ethers.utils.defaultAbiCoder.encode(
      ['bytes32', 'bytes'],
      [ethers.utils.id('DEPOSIT'), data]
    );
    
    await childTunnelContract.processMessageFromRootMock(
      1,
      owner.address,
      message
    );

    expect(await fxLimeGameItemContract.totalSupply()).to.equal(1);
    expect(await fxLimeGameItemContract.tokenURI(tokenId)).to.equal(tokenURI);
    expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(addr1.address);
  });

  // it('Should successfully deposit NFT', async function () {
  //   const tokenId = 0;
  //   const tokenURI = await fxLimeGameItemContract.tokenURI(tokenId);

  //   expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(addr1.address);

  //   const transaction = await fxLimeGameItemContract.connect(addr1).approve(childTunnelContract.address, tokenId);
  //   await transaction.wait();
  //   await childTunnelContract.connect(addr1).deposit(fxLimeGameItemContract.address, addr1.address, tokenId, tokenURI);

  //   expect(await fxLimeGameItemContract.totalSupply()).to.equal(1);
  //   expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(childTunnelContract.address);
  //   expect(await childTunnelContract.mockCommand()).to.equal('DEPOSIT');
  //   expect(await childTunnelContract.mockRootToken()).to.equal(fxLimeGameItemContract.address);
  //   expect(await childTunnelContract.mockSender()).to.equal(addr1.address);
  //   expect(await childTunnelContract.mockUser()).to.equal(addr1.address);
  //   expect(await childTunnelContract.mockTokenId()).to.equal(tokenId);
  //   expect(await childTunnelContract.mockUri()).to.equal(tokenURI);
  // });
});
