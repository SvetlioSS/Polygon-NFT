const { expect } = require('chai');
const { ethers, waffle } = require('hardhat');

const randomAddress = '0x34E67C845168131800e6790f8B7b7c7f3acB15A9';

describe('Root Tunnel', function () {
  let fxLimeGameItemContract;
  let rootTunnelContract;
  let owner;
  let addr1;
  let provider = waffle.provider;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();

    const fxLimeGameItemFactory = await ethers.getContractFactory('FxLimeGameItem');
    const fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    fxLimeGameItemContract = await fxLimeGameItem.deployed();

    const rootTunnelFactory = await ethers.getContractFactory('__RootTunnel');
    const rootTunnel = await rootTunnelFactory.deploy(randomAddress, randomAddress, fxLimeGameItem.address);
    rootTunnelContract = await rootTunnel.deployed();
    await rootTunnelContract.setFxChildTunnel(owner.address);
  });

  it('Should have no tokens', async function () {
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(0);
  });

  it('Should successfully mint a token when called by owner', async function () {
    const mintResultsTx = await fxLimeGameItemContract['mint(address,string)'](addr1.address, 'some.dummy.url');
    await mintResultsTx.wait();
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(1);
  });

  it('Should have correct URL', async function () {
    expect(await fxLimeGameItemContract.tokenURI(0)).to.equal('some.dummy.url');
  });

  it('Should have 0 ETH balance before deposit', async function () {
    const currentBalance = await rootTunnelContract.provider.getBalance(rootTunnelContract.address);
    expect(currentBalance).to.equal(ethers.utils.parseEther('0'));
  });

  if('Should have correct token owner', async function () {
    const tokenId = 0;
    expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(addr1.address);
  });

  it('Should successfully deposit', async function () {
    const tokenId = 0;
    const tokenURI = await fxLimeGameItemContract.tokenURI(tokenId);

    const transaction = await fxLimeGameItemContract.connect(addr1).approve(rootTunnelContract.address, tokenId);
    await transaction.wait();
    await rootTunnelContract
      .connect(addr1)
      .deposit(fxLimeGameItemContract.address, addr1.address, tokenId, tokenURI, {
        value: ethers.utils.parseEther('0.001'),
      });

    expect(await fxLimeGameItemContract.totalSupply()).to.equal(1);
    expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(rootTunnelContract.address);
    expect(await rootTunnelContract.mockCommand()).to.equal('DEPOSIT');
    expect(await rootTunnelContract.mockRootToken()).to.equal(fxLimeGameItemContract.address);
    expect(await rootTunnelContract.mockSender()).to.equal(addr1.address);
    expect(await rootTunnelContract.mockUser()).to.equal(addr1.address);
    expect(await rootTunnelContract.mockTokenId()).to.equal(tokenId);
    expect(await rootTunnelContract.mockUri()).to.equal(tokenURI);
  });

  it('Should have 0.001 ETH balance after deposit', async function () {
    const newBalance = await rootTunnelContract.provider.getBalance(rootTunnelContract.address);
    expect(newBalance).to.equal(ethers.utils.parseEther('0.001'));
  });

  it('Should successfully withdraw ether from contract as owner', async function () {
    const balanceBeforeWithdraw = await provider.getBalance(owner.address);
    await rootTunnelContract.connect(owner).withdrawEther();
    const balanceAfterWithdraw = await provider.getBalance(owner.address);
    expect(balanceAfterWithdraw).to.be.gt(balanceBeforeWithdraw);
  });

  it('Should have 0 ETH after owner withdraws', async function () {
    const newBalance = await rootTunnelContract.provider.getBalance(rootTunnelContract.address);
    expect(newBalance).to.equal(ethers.utils.parseEther('0'));
  });

  it('Should successfully complete withdrawal', async function () {
    const tokenId = 0;
    const message = ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [addr1.address, tokenId]);

    await rootTunnelContract.processMessageFromChildMock(message);
    expect(await fxLimeGameItemContract.ownerOf(tokenId)).to.equal(addr1.address);
  });
});
