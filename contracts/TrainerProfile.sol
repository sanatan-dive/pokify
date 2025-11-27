// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title TrainerProfile
 * @dev ERC721 NFT contract for AI Trainer Companion profiles
 */
contract TrainerProfile is ERC721, Ownable {
    using Strings for uint256;

    uint256 private _tokenIdCounter;
    uint256 public constant MINT_FEE = 0.001 ether;
    string private _baseTokenURI;
    
    // Mapping from token ID to metadata URI
    mapping(uint256 => string) private _tokenMetadata;
    
    // Mapping from wallet address to token ID (one profile per wallet)
    mapping(address => uint256) public walletToTokenId;
    
    event ProfileMinted(address indexed owner, uint256 indexed tokenId, string metadataURI);
    
    constructor(string memory baseURI) ERC721("AI Trainer Profile", "TRAINER") Ownable(msg.sender) {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Mint a new trainer profile NFT
     * @param metadataURI The metadata URI for this profile
     * @return tokenId The ID of the minted token
     */
    function mint(string memory metadataURI) public payable returns (uint256) {
        require(msg.value >= MINT_FEE, "Insufficient mint fee");
        require(walletToTokenId[msg.sender] == 0, "Profile already minted for this wallet");
        
        _tokenIdCounter++;
        uint256 tokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, tokenId);
        _tokenMetadata[tokenId] = metadataURI;
        walletToTokenId[msg.sender] = tokenId;
        
        emit ProfileMinted(msg.sender, tokenId, metadataURI);
        
        return tokenId;
    }
    
    /**
     * @dev Returns the metadata URI for a given token ID
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, _tokenMetadata[tokenId]));
    }
    
    /**
     * @dev Update the base URI (only owner)
     */
    function setBaseURI(string memory baseURI) public onlyOwner {
        _baseTokenURI = baseURI;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
    
    /**
     * @dev Get total number of minted profiles
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIdCounter;
    }
}
