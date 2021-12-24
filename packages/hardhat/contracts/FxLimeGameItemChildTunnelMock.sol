// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { Create2 } from 'fx-portal-contracts/contracts/lib/Create2.sol';
import { IERC721Receiver } from 'fx-portal-contracts/contracts/lib/IERC721Receiver.sol';
import { FxBaseChildTunnel } from 'fx-portal-contracts/contracts/tunnel/FxBaseChildTunnel.sol';
import '../contracts/IFxLimeGameItem.sol';
import "hardhat/console.sol";

/**
 * @title FxLimeGameItemChildTunnel
 */
contract FxLimeGameItemChildTunnelMock is FxBaseChildTunnel, Create2, IERC721Receiver {
    bytes32 public constant DEPOSIT = keccak256("DEPOSIT");
    bytes32 public constant MAP_TOKEN = keccak256("MAP_TOKEN");
    string public constant SUFFIX_NAME = " (FXERC721)";
    string public constant PREFIX_SYMBOL = "fx";

    // event for token maping
    event TokenMapped(address indexed rootToken, address indexed childToken);
    event SyncDeposit(address indexed to, string indexed uri);
    // root to child token
    mapping(address => address) public rootToChildToken;
    // token template
    address public tokenTemplate;

    constructor(address _fxChild, address _tokenTemplate) FxBaseChildTunnel(_fxChild) {
        tokenTemplate = _tokenTemplate;
        require(_isContract(_tokenTemplate), "Token template is not contract");
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

    function processMessageFromRootMock(
        uint256 stateId, /* stateId */
        address sender,
        bytes memory data
    ) public {
            console.log('Sync Data123');
        _processMessageFromRoot(stateId, sender, data);
    }

    function getTestMessage() public view returns(bytes memory) {
        bytes memory message = abi.encode(DEPOSIT, abi.encode(msg.sender, msg.sender, msg.sender, 1));
        return message;
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
            console.log('Sync Data1');
        (bytes32 syncType, bytes memory syncData) = abi.decode(data, (bytes32, bytes));

        if (syncType == DEPOSIT) {
            console.log('Sync Data');
            _syncDeposit(syncData);
        } else if (syncType == MAP_TOKEN) {
            console.log('Mapping Token');
            _mapToken(syncData);
        } else {
            revert("FxLimeGameItemChildTunnel: INVALID_SYNC_TYPE");
        }
    }

    function _mapToken(bytes memory syncData) internal returns (address) {
        (address rootToken) = abi.decode(syncData, (address));

        // get root to child token
        address childToken = rootToChildToken[rootToken];

        // check if it's already mapped
        require(childToken == address(0x0), "FxLimeGameItemChildTunnel: ALREADY_MAPPED");

        // deploy new child token
        bytes32 salt = keccak256(abi.encodePacked(rootToken));
        childToken = createClone(salt, tokenTemplate);
        IFxLimeGameItem(childToken).initialize(
            address(this),
            rootToken
        );

        // map the token
        rootToChildToken[rootToken] = childToken;
        emit TokenMapped(rootToken, childToken);

        // return new child token
        return childToken;
    }

    function _syncDeposit(bytes memory syncData) internal {
        console.log('HERE 1');
        (address rootToken, address depositor, address to, uint256 tokenId) = abi.decode(
            syncData,
            (address, address, address, uint256)
        );
        console.log('HERE 12');
        address childToken = rootToChildToken[rootToken];

        console.log('HERE 123');
        // deposit tokens
        IFxLimeGameItem childTokenContract = IFxLimeGameItem(childToken);

        console.log('HERE 4');
        childTokenContract.mint(to, 'test');

        console.log('HERE 5');
        emit SyncDeposit(to, 'test');
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
        require(
            childToken != address(0x0) && rootToken != address(0x0) && childToken == rootToChildToken[rootToken],
            "FxLimeGameItemChildTunnel: NO_MAPPED_TOKEN"
        );

        require(msg.sender == childTokenContract.ownerOf(tokenId));

        // withdraw tokens
        childTokenContract.burn(tokenId);

        // send message to root regarding token burn
        _sendMessageToRoot(abi.encode(rootToken, childToken, receiver, tokenId));
    }

    // check if address is contract
    function _isContract(address _addr) private view returns (bool) {
        uint32 size;
        assembly {
            size := extcodesize(_addr)
        }
        return (size > 0);
    }
}