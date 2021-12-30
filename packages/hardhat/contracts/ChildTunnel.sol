// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import './fx-portal/tunnel/FxBaseChildTunnel.sol';
import './FxLimeGameItem.sol';

/**
 * @title ChildTunnel
 */
contract ChildTunnel is FxBaseChildTunnel {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");

    address private _childTokenAddress;

    constructor(address _fxChild, address childTokenAddress_) FxBaseChildTunnel(_fxChild) {
        _childTokenAddress = childTokenAddress_;
    }

    function withdraw(
        address childToken,
        uint256 tokenId
    ) external {
        _withdraw(childToken, tokenId);
    }

    function _processMessageFromRoot(
        uint256, /* stateId */
        address sender,
        bytes memory data
    ) internal override validateSender(sender) {
        (bytes32 syncType, bytes memory syncData) = abi.decode(data, (bytes32, bytes));
        if (syncType == DEPOSIT) {
            (, , address to, , string memory uri) = abi.decode(
                syncData,
                (address, address, address, uint256, string)
            );

            FxLimeGameItem childTokenContract = FxLimeGameItem(_childTokenAddress);
            childTokenContract.mint(to, uri);
        } else {
            revert("FxLimeGameItemChildTunnel: INVALID_SYNC_TYPE");
        }
    }

    function _withdraw(
        address childToken,
        uint256 tokenId
    ) internal {
        FxLimeGameItem childTokenContract = FxLimeGameItem(childToken);
        require(msg.sender == childTokenContract.ownerOf(tokenId));

        // withdraw tokens
        childTokenContract.burn(tokenId);

        // send message to root regarding token burn
        _sendMessageToRoot(abi.encode(childToken, tokenId));
    }
}