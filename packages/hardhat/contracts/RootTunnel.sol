// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { FxBaseRootTunnel } from 'fx-portal-contracts/contracts/tunnel/FxBaseRootTunnel.sol';
import './FxLimeGameItem.sol';

/**
 * @title RootTunnel
 */
contract RootTunnel is FxBaseRootTunnel, IERC721Receiver {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    bytes public latestData;

    event FxDepositERC721(
        address indexed rootToken,
        address indexed depositor,
        address indexed userAddress,
        uint256 id,
        string uri
    );

    constructor(address _checkpointManager, address _fxRoot) FxBaseRootTunnel(_checkpointManager, _fxRoot) {}

    function deposit(
        address rootToken,
        address user,
        uint256 tokenId,
        string memory uri
    ) public {
        FxLimeGameItem(rootToken).safeTransferFrom(
            msg.sender, // depositor
            address(this), // manager contract
            tokenId
        );

        bytes memory message = abi.encode(DEPOSIT, abi.encode(rootToken, msg.sender, user, tokenId, uri));
        _sendMessageToChild(message);
        emit FxDepositERC721(rootToken, msg.sender, user, tokenId, uri);
    }
    
    function _processMessageFromChild(bytes memory data) internal override {
        latestData = data;
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