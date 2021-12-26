// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { FxBaseChildTunnel } from 'fx-portal-contracts/contracts/tunnel/FxBaseChildTunnel.sol';
import './FxLimeGameItem.sol';
import "hardhat/console.sol";

/**
 * @title ChildTunnelMock
 */
contract ChildTunnelMock is FxBaseChildTunnel {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");

    address private _childTokenAddress;

    constructor(address _fxChild, address childTokenAddress_) FxBaseChildTunnel(_fxChild) {
        _childTokenAddress = childTokenAddress_;
    }

    function processMessageFromRootMock(
        uint256 stateId,
        address sender,
        bytes memory data
    ) public { 
        _processMessageFromRoot(stateId, sender, data);
    }

    function _processMessageFromRoot(
        uint256, /* stateId */
        address sender,
        bytes memory data
    ) internal override validateSender(sender) {
        (bytes32 syncType, bytes memory syncData) = abi.decode(data, (bytes32, bytes));
        if (syncType == DEPOSIT) {
            _syncDeposit(syncData);
        } else {
            revert("FxLimeGameItemChildTunnel: INVALID_SYNC_TYPE");
        }
    }

    function _syncDeposit(bytes memory syncData) internal {
        (address rootToken, address depositor, address to, uint256 tokenId, string memory uri) = abi.decode(
            syncData,
            (address, address, address, uint256, string)
        );

        FxLimeGameItem childTokenContract = FxLimeGameItem(_childTokenAddress);
        childTokenContract.mint(to, uri);
    }
}