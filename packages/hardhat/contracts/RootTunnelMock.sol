// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { FxBaseRootTunnel } from 'fx-portal-contracts/contracts/tunnel/FxBaseRootTunnel.sol';
import './FxLimeGameItem.sol';

/**
 * @title RootTunnel
 */
contract RootTunnelMock is FxBaseRootTunnel, IERC721Receiver {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");

    bytes public latestData;

    string public mockCommand;
    address public mockRootToken;
    address public mockSender;
    address public mockUser;
    uint256 public mockTokenId;
    string public mockUri;

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
        _sendMessageToChildMock(message);
        emit FxDepositERC721(rootToken, msg.sender, user, tokenId, uri);
    }
    
    function _processMessageFromChild(bytes memory data) internal override {
        latestData = data;
    }

    function _sendMessageToChildMock(bytes memory message) internal {
        (bytes32 syncType, bytes memory syncData) = abi.decode(message, (bytes32, bytes));
        (address rootToken, address depositor, address to, uint256 tokenId, string memory uri) = abi.decode(
            syncData,
            (address, address, address, uint256, string)
        );

        if (syncType == DEPOSIT) {
          mockCommand = 'DEPOSIT';
          mockRootToken = rootToken;
          mockSender = depositor;
          mockUser = to;
          mockTokenId = tokenId;
          mockUri = uri;
        } else {
          mockCommand = 'ERROR';
        }
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