// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "hardhat/console.sol";

import '@openzeppelin/contracts/interfaces/IERC20.sol';

contract LiquidityPool {
    address public owner;
    IERC20 public  tokenA;
    IERC20 public  tokenB;

    uint256 private _totalSupply;

    bool public initialized;


    constructor (IERC20 _tokenA, IERC20 _tokenB)  {
        owner = msg.sender;

        require(address(_tokenA) != address(0) && address(_tokenB) != address(0));
        require(_tokenA != _tokenB);

        tokenA = _tokenA;
        tokenB = _tokenB;

        initialized = false;
    }

    function initialize(uint256 _tokenSupplyA, uint256 _tokenSupplyB) public {
        require(tokenA.allowance(msg.sender, address(this)) >= _tokenSupplyA);
        require(tokenB.allowance(msg.sender, address(this)) >= _tokenSupplyB);

        tokenA.transferFrom(msg.sender, address(this), _tokenSupplyA);
        tokenB.transferFrom(msg.sender, address(this), _tokenSupplyB);

        _totalSupply = _tokenSupplyA * _tokenSupplyB;
        initialized = true;
    }

    function getBalanceA() public view returns (uint256) {
        return tokenA.balanceOf(address(this));
    }

    function getBalanceB() public view returns (uint256) {
        return tokenB.balanceOf(address(this));
    }

    function exactInTransfer(bool depositA, uint256 amount) public {

        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));

        if (depositA) {
            require(tokenA.allowance(msg.sender, address(this)) >= amount);
            uint256 transfer = _totalSupply/(balanceA-amount) - balanceB;
            tokenB.transfer(msg.sender, transfer);
            tokenA.transferFrom(msg.sender, address(this), amount);
        } else {
            require(tokenB.allowance(msg.sender, address(this)) >= amount);
            uint256 transfer = _totalSupply/(balanceB-amount) - balanceA;
            tokenB.transferFrom(msg.sender,address(this), transfer);
            tokenA.transfer(msg.sender, amount);
        }
    }

    function exactOutTransfer(bool receiveA, uint256 amount) public {
        uint256 balanceA = tokenA.balanceOf(address(this));
        uint256 balanceB = tokenB.balanceOf(address(this));

        if (receiveA) {
            require(tokenA.allowance(msg.sender, address(this)) >= amount*2);
            uint256 transfer = _totalSupply/(balanceA-amount) - balanceB;
            tokenB.transferFrom(msg.sender, address(this), transfer);
            tokenA.transfer(msg.sender, amount);
        } else {
            require(tokenB.allowance(msg.sender, address(this)) >= amount*2);
            uint256 transfer = _totalSupply/(balanceB-amount) - balanceA;
            tokenA.transferFrom(msg.sender, address(this), transfer);
            tokenB.transfer(msg.sender, amount);
        }
    }

}