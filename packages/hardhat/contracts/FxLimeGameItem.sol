// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import { ERC721 } from '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import './IFxLimeGameItem.sol';

contract FxLimeGameItem is IFxLimeGameItem, ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    address internal _fxManager;
    address internal _connectedToken;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    event TokenMinted(address indexed to, string indexed uri, uint256 indexed tokenId);

    constructor() ERC721('LimeGameItem', 'LGI') {}

    function fxManager() public view override returns (address) {
        return _fxManager;
    }

    function connectedToken() public view override returns (address) {
        return _connectedToken;
    }

    function initialize(
        address fxManager_,
        address connectedToken_
    ) public override {
        require(_fxManager == address(0x0) && _connectedToken == address(0x0), "Token is already initialized");
        _fxManager = fxManager_;
        _connectedToken = connectedToken_;
    }

    function mint(address to, string memory uri) public override {
        require(msg.sender == _fxManager || msg.sender == owner(), "Invalid sender");
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        emit TokenMinted(to, uri, tokenId);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function burn(uint256 tokenId) public override {
        require(msg.sender == _fxManager || msg.sender == owner(), "Invalid sender");
        _burn(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, IERC165)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
