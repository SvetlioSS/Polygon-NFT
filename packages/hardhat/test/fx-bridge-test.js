const { expect } = require('chai');
const { ethers } = require('hardhat');

const randomAddress = '0x34E67C845168131800e6790f8B7b7c7f3acB15A9';

describe('FxLimeGameItem Bridging', function () {
  let fxLimeGameItemChildTunnelFactory;
  let fxLimeGameItemChildTunnel;
  let owner;
  let addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();

    const fxLimeGameItemFactory = await ethers.getContractFactory(
      'FxLimeGameItem'
    );
    const fxLimeGameItem = await fxLimeGameItemFactory.deploy();
    const fxLimeGameItemContract = await fxLimeGameItem.deployed();

    fxLimeGameItemChildTunnelFactory = await ethers.getContractFactory(
      'FxLimeGameItemChildTunnelMock'
    );
    fxLimeGameItemChildTunnel = await fxLimeGameItemChildTunnelFactory.deploy(
      randomAddress,
      fxLimeGameItemContract.address
    );
    await fxLimeGameItemChildTunnel.deployed();
    await fxLimeGameItemChildTunnel.setFxRootTunnel(owner.address);
  });

  it('Dummy test', async function () {
    expect(await fxLimeGameItemChildTunnel.PREFIX_SYMBOL()).to.equal('fx');
  });

  it('processMessageFromRootMock', async function () {
    // function processMessageFromRootMock(
    //     uint256 stateId, /* stateId */
    //     address sender,
    //     bytes memory data
    // ) public {
    //     _processMessageFromRoot(stateId, sender, data);
    // }

    const data = await fxLimeGameItemChildTunnel.getTestMessage();
    await fxLimeGameItemChildTunnel.processMessageFromRootMock(123, owner.address, data);
    // expect().to.equal('fx');
  });
});
