// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol';
import '@openzeppelin/contracts/token/ERC721/ERC721.sol';
import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

contract FxLimeGameItem is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    address internal _fxManager;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    event TokenMinted(address indexed to, string indexed uri, uint256 indexed tokenId);

    constructor() ERC721('LimeGameItem', 'LGI') {
        _fxManager = _msgSender();
    }

    function fxManager() public view returns (address) {
        return _fxManager;
    }

    function setFxManager(address fxManager_) public onlyOwner {
        _fxManager = fxManager_;
    }

    function mint(address to, string memory uri) public {
        require(msg.sender == _fxManager, "Invalid sender");

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

    function burn(uint256 tokenId) public {
        require(msg.sender == _fxManager, "Invalid sender");
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
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
