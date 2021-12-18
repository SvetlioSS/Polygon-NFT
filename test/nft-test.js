const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LimeGameItem", function () {
  let limeGameItemFactory;
  let limeGameItem;
  let owner;
  let addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    limeGameItemFactory = await ethers.getContractFactory("LimeGameItem");
    limeGameItem = await limeGameItemFactory.deploy();
    await limeGameItem.deployed();
  });

  it("Should have no tokens", async function () {
    expect(await limeGameItem.totalSupply()).to.equal(0);
  });

  it("Should successfully mint a token when called by owner", async function () {
    const safeMintResultsTx = await limeGameItem.safeMint(
      addr1.address,
      "some.dummy.url"
    );
    await safeMintResultsTx.wait();
    expect(await limeGameItem.totalSupply()).to.equal(1);
  });

  it("Should throw an error when trying to mint a token when called by non-owners", async function () {
    expect(
      limeGameItem.connect(addr1).safeMint(addr1.address, "some.dummy.url")
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });
});
