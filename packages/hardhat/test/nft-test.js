const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FxLimeGameItem', function () {
  let fxLimeGameItemFactory;
  let fxLimeGameItem;
  let owner;
  let addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    fxLimeGameItemFactory = await ethers.getContractFactory('FxLimeGameItem');
    fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    await fxLimeGameItem.deployed();
  });

  it('Should have no tokens', async function () {
    expect(await fxLimeGameItem.totalSupply()).to.equal(0);
  });

  it('Should successfully mint a token when called by owner', async function () {
    const mintResultsTx = await fxLimeGameItem.mint(
      addr1.address,
      'some.dummy.url'
    );
    await mintResultsTx.wait();
    expect(await fxLimeGameItem.totalSupply()).to.equal(1);
  });

  it('Should throw an error when trying to mint a token when called by non-owners', async function () {
    expect(
      fxLimeGameItem.connect(addr1).mint(addr1.address, 'some.dummy.url')
    ).to.be.revertedWith('Ownable: caller is not the owner');
  });
});
