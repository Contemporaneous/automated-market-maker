// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract LiquidityTokenA is ERC20 {
    constructor(uint256 totalSupply) ERC20("TokenA", "TA") {
        _mint(msg.sender, totalSupply);
    }
}

contract LiquidityTokenB is ERC20 {
    constructor(uint256 totalSupply) ERC20("TokenB", "TB") {
        _mint(msg.sender, totalSupply);
    }
}

contract LiquidityHolderToken is ERC20 {
    constructor(uint256 totalSupply) ERC20("LiquidityHolderToken", "LHT") {
        _mint(msg.sender, totalSupply);
    }
}