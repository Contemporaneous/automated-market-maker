// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "hardhat/console.sol";

import '@oppenzepelin/contracts/token/ERC20/ERC20.sol';

contract LiquidityPool {
    address public owner;
    ERC20 public  tokenA;
    ERC20 public  tokenB;

    uint256 private _totalSupply;


    constructor (ERC20 _tokenA, uint256 _balanceA, ERC20 _tokenB, uint256 _balanceB) payable {
        owner = msg.sender;

        require(_tokenA != address(0) && _tokenB != address(0));
        require(_tokenA != _tokenB);

        _tokenA.transferFrom(msg.sender, address(this), _balanceA);
        _tokenB.transferFrom(msg.sender, address(this), _balanceB);

        tokenA = _tokenA;
        tokenB = _tokenB;

        _totalSupply = _balanceA * _balanceB;

    }
}