// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/access/Ownable.sol';
import './fx-portal/tunnel/FxBaseChildTunnel.sol';
import './FxLimeGameItem.sol';
import "hardhat/console.sol";

/**
 * @title __ChildTunnel
 */
contract __ChildTunnel is FxBaseChildTunnel, Ownable {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    address private _childTokenAddress;
    uint256 withdrawFee = 0.001 ether;

    constructor(address _fxChild, address childTokenAddress_) FxBaseChildTunnel(_fxChild) {
        _childTokenAddress = childTokenAddress_;
    }

    function withdrawEther() external onlyOwner {
        address payable _owner = payable(owner());
        _owner.transfer(address(this).balance);
    }

    function processMessageFromRootMock(
        uint256 stateId,
        address sender,
        bytes memory data
    ) public { 
        _processMessageFromRoot(stateId, sender, data);
    }

    function withdraw(
        address childToken,
        uint256 tokenId
    ) external payable {
        require(msg.value == withdrawFee, 'Please provide the correct amount of ether');

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
        require(msg.sender == childTokenContract.ownerOf(tokenId), "Invalid sender");

        // withdraw tokens
        childTokenContract.burn(tokenId);

        // send message to root regarding token burn
        _sendMessageToRoot(abi.encode(childToken, tokenId));
    }
}