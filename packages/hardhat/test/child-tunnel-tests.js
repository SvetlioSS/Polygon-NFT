const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');

const randomAddress = '0x34E67C845168131800e6790f8B7b7c7f3acB15A9';

describe('Child Tunnel', function () {
  let fxLimeGameItemContract;
  let childTunnelContract;
  let owner;
  let addr1;
  let provider = waffle.provider;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();

    const fxLimeGameItemFactory = await ethers.getContractFactory(
      'FxLimeGameItem'
    );
    const fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    fxLimeGameItemContract = await fxLimeGameItem.deployed();

    const childTunnelFactory = await ethers.getContractFactory(
      '__ChildTunnel'
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

  it('Should have 0 ETH balance before withdraw', async function () {
    const currentBalance = await childTunnelContract.provider.getBalance(childTunnelContract.address);
    expect(currentBalance).to.equal(ethers.utils.parseEther('0'));
  });

  it('Should successfully burn NFT after WITHDRAW', async () => {
    const tokenId = 0;
    await childTunnelContract.connect(addr1).withdraw(fxLimeGameItemContract.address, tokenId, {
      value: ethers.utils.parseEther('0.001'),
    });
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(0);
  });

  it('Should have 0.001 ETH balance after withdrawal', async function () {
    const newBalance = await childTunnelContract.provider.getBalance(childTunnelContract.address);
    expect(newBalance).to.equal(ethers.utils.parseEther('0.001'));
  });

  it('Should successfully withdraw ether from contract as owner', async function () {
    const balanceBeforeWithdraw = await provider.getBalance(owner.address);
    await childTunnelContract.connect(owner).withdrawEther();
    const balanceAfterWithdraw = await provider.getBalance(owner.address);
    expect(balanceAfterWithdraw).to.be.gt(balanceBeforeWithdraw);
  });

  it('Should have 0 ETH after owner withdraws', async function () {
    const newBalance = await childTunnelContract.provider.getBalance(childTunnelContract.address);
    expect(newBalance).to.equal(ethers.utils.parseEther('0'));
  });
});
