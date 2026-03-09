// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DigitalDeed is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    uint256 private _nextTokenId;

    // Mapping from serial number hash to bool to ensure uniqueness
    mapping(bytes32 => bool) private _usedSerialNumbers;
    // Mapping from tokenId to its physical serial number
    mapping(uint256 => string) private _deedSerialNumbers;
    // Mapping from tokenId to its name
    mapping(uint256 => string) private _deedNames;

    error SerialNumberAlreadyUsed(string serialNumber);

    constructor() ERC721("DigitalDeed", "DEED") Ownable(msg.sender) {}

    /**
     * @dev Mint a new digital deed.
     * @param to The address of the recipient who will own the deed.
     * @param uri The IPFS metadata link (image, description, etc).
     * @param name The name of the physical asset.
     * @param serialNumber The unique physical serial number of the asset.
     */
    function safeMint(address to, string memory uri, string memory name, string memory serialNumber) public {
        bytes32 serialHash = keccak256(abi.encodePacked(serialNumber));
        if (_usedSerialNumbers[serialHash]) {
            revert SerialNumberAlreadyUsed(serialNumber);
        }

        uint256 tokenId = _nextTokenId++;
        _usedSerialNumbers[serialHash] = true;
        _deedSerialNumbers[tokenId] = serialNumber;
        _deedNames[tokenId] = name;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    /**
     * @dev Get the name associated with a deed.
     */
    function getName(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        return _deedNames[tokenId];
    }

    /**
     * @dev Get the physical serial number associated with a deed.
     */
    function getSerialNumber(uint256 tokenId) public view returns (string memory) {
        _requireOwned(tokenId);
        return _deedSerialNumbers[tokenId];
    }

    // Overrides required by Solidity.

    function _update(address to, uint256 tokenId, address auth)
        internal
        override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
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
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
