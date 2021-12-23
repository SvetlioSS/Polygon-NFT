// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';

interface IFxLimeGameItem is IERC721 {
    function fxManager() external returns(address);
    function connectedToken() external returns(address);
    function burn(uint256 tokenId) external;
    function mint(address to, string memory uri) external;
    function initialize(address _fxManager, address _connectedToken) external;
}
