// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './fx-portal/tunnel/FxBaseRootTunnel.sol';
import './FxLimeGameItem.sol';

/**
 * @title RootTunnel
 */
contract RootTunnel is FxBaseRootTunnel, IERC721Receiver, Ownable {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    address private _rootTokenAddress;
    uint256 depositFee = 0.001 ether;

    event FxDepositERC721(
        address indexed rootToken,
        address indexed depositor,
        address indexed userAddress,
        uint256 id,
        string uri
    );

    constructor(address _checkpointManager, address _fxRoot, address rootTokenAddress_) FxBaseRootTunnel(_checkpointManager, _fxRoot) {
        _rootTokenAddress = rootTokenAddress_;
    }

    function withdrawEther() external onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function deposit(
        address rootToken,
        address user,
        uint256 tokenId,
        string memory uri
    ) external payable {
        require(msg.value == depositFee, 'Please provide the correct amount of ether');

        FxLimeGameItem(rootToken).safeTransferFrom(
            msg.sender, // depositor
            address(this), // manager contract
            tokenId
        );

        bytes memory message = abi.encode(DEPOSIT, abi.encode(rootToken, msg.sender, user, tokenId, uri));
        _sendMessageToChild(message);
        emit FxDepositERC721(rootToken, msg.sender, user, tokenId, uri);
    }
    
    function _processMessageFromChild(bytes memory message) internal override {
        (address to, uint256 tokenId) = abi.decode(message, (address, uint256));
        FxLimeGameItem(_rootTokenAddress).safeTransferFrom(address(this), to, tokenId);
    }

    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}