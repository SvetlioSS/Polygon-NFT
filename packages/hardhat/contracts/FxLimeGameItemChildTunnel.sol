// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import { Create2 } from 'fx-portal-contracts/contracts/lib/Create2.sol';
import { IERC721Receiver } from 'fx-portal-contracts/contracts/lib/IERC721Receiver.sol';
import { FxBaseChildTunnel } from 'fx-portal-contracts/contracts/tunnel/FxBaseChildTunnel.sol';
import './IFxLimeGameItem.sol';

/**
 * @title FxLimeGameItemChildTunnel
 */
contract FxLimeGameItemChildTunnel is FxBaseChildTunnel, IERC721Receiver {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    bytes32 public constant MAP_TOKEN = keccak256("MAP_TOKEN");
    string public constant SUFFIX_NAME = " (FXERC721)";
    string public constant PREFIX_SYMBOL = "fx";

    // event for token maping
    event TokenMapped(address indexed rootToken, address indexed childToken);
    event TestMessage(string indexed message);
    // root to child token
    // mapping(address => address) public rootToChildToken;
    // token template
    address public childTokenAddress;

    constructor(address _fxChild, address _childToken) FxBaseChildTunnel(_fxChild) {
        childTokenAddress = _childToken;
    }

    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    function withdraw(
        address childToken,
        uint256 tokenId
    ) external {
        _withdraw(childToken, msg.sender, tokenId);
    }

    function withdrawTo(
        address childToken,
        address receiver,
        uint256 tokenId
    ) external {
        _withdraw(childToken, receiver, tokenId);
    }

    //
    // Internal methods
    //

    function _processMessageFromRoot(
        uint256, /* stateId */
        address sender,
        bytes memory data
    ) internal override validateSender(sender) {
        // decode incoming data
        emit TestMessage('_processMessageFromRoot');
        (bytes32 syncType, bytes memory syncData) = abi.decode(data, (bytes32, bytes));
        emit TestMessage('_processMessageFromRoot decode');

        if (syncType == DEPOSIT) {
            _syncDeposit(syncData);
        } else {
            revert("FxLimeGameItemChildTunnel: INVALID_SYNC_TYPE");
        }
    }

    // function _mapToken(bytes memory syncData) internal returns (address) {
    //     (address rootToken) = abi.decode(syncData, (address));

    //     // get root to child token
    //     address childToken = rootToChildToken[rootToken];

    //     // check if it's already mapped
    //     require(childToken == address(0x0), "FxLimeGameItemChildTunnel: ALREADY_MAPPED");

    //     // deploy new child token
    //     bytes32 salt = keccak256(abi.encodePacked(rootToken));
    //     childToken = createClone(salt, tokenTemplate);
    //     IFxLimeGameItem(childToken).initialize(
    //         address(this),
    //         rootToken
    //     );

    //     // map the token
    //     rootToChildToken[rootToken] = childToken;
    //     emit TokenMapped(rootToken, childToken);

    //     // return new child token
    //     return childToken;
    // }

    function _syncDeposit(bytes memory syncData) internal {
        emit TestMessage('_syncDeposit');
        (address rootToken, address depositor, address to, uint256 tokenId, string memory uri) = abi.decode(
            syncData,
            (address, address, address, uint256, string)
        );
        emit TestMessage('_syncDeposit after decode');
        // address childToken = rootToChildToken[rootToken];

        // deposit tokens
        IFxLimeGameItem childTokenContract = IFxLimeGameItem(childTokenAddress);
        emit TestMessage('childTokenContract after instantiation');
        childTokenContract.mint(to, uri);
        emit TestMessage('childTokenContract after mint');
    }

    function _withdraw(
        address childToken,
        address receiver,
        uint256 tokenId
    ) internal {
        IFxLimeGameItem childTokenContract = IFxLimeGameItem(childToken);
        // child token contract will have root token
        address rootToken = childTokenContract.connectedToken();

        // validate root and child token mapping
        // require(
        //     childToken != address(0x0) && rootToken != address(0x0) && childToken == rootToChildToken[rootToken],
        //     "FxLimeGameItemChildTunnel: NO_MAPPED_TOKEN"
        // );

        require(msg.sender == childTokenContract.ownerOf(tokenId));

        // withdraw tokens
        childTokenContract.burn(tokenId);

        // send message to root regarding token burn
        _sendMessageToRoot(abi.encode(rootToken, childToken, receiver, tokenId));
    }
}