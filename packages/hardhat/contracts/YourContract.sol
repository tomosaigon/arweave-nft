pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract YourContract is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {

    using Strings for uint256;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping (uint256 => string) private _tokenURIs;

    constructor() public ERC721("Weavable", "WABLE") {
    }

    function mint(string calldata _tokenURI)
        public
        returns (uint256)
    {
        _tokenIds.increment();
        uint256 id = _tokenIds.current();
        _mint(msg.sender, id);
        _setTokenURI(id, _tokenURI);

        return id;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
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
