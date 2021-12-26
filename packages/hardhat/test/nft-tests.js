const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('FxLimeGameItem', function () {
  let fxLimeGameItemContract;
  let owner;
  let addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    const fxLimeGameItemFactory = await ethers.getContractFactory('FxLimeGameItem');
    const fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    fxLimeGameItemContract =await fxLimeGameItem.deployed();
  });

  it('Should have no tokens', async function () {
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(0);
  });

  it('Should successfully mint a token when called by owner', async function () {
    const mintResultsTx = await fxLimeGameItemContract.connect(owner).mint(
      addr1.address,
      'some.dummy.url'
    );
    await mintResultsTx.wait();
    expect(await fxLimeGameItemContract.totalSupply()).to.equal(1);
  });

  it('Should throw an error when trying to mint a token when called by non-owners', async function () {
    expect(
      fxLimeGameItemContract.connect(addr1).mint(addr1.address, 'some.dummy.url')
    ).to.be.revertedWith('Invalid sender');
  });
});
