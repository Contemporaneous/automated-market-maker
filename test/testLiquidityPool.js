const { expect } = require("chai");
const { resolveProperties } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

let lp;
let tokenA;
let tokenB;
let accounts;

const getBalances = async () =>  {
  let userBalA = await tokenA.balanceOf(accounts[0].address);
  let userBalB = await tokenB.balanceOf(accounts[0].address);
  let contractBalA = await lp.getBalanceA();
  let contractBalB = await lp.getBalanceB();

  return {userBalA, userBalB, contractBalA, contractBalB};    
};

beforeEach(async () => {
    accounts = await ethers.getSigners();

    const tokenAFactory = await hre.ethers.getContractFactory('LiquidityTokenA');
    tokenA = await tokenAFactory.connect(accounts[0]).deploy(1000000);
    await tokenA.deployed();

    const tokenBFactory = await hre.ethers.getContractFactory('LiquidityTokenB');
    tokenB = await tokenBFactory.connect(accounts[0]).deploy(1000000);
    await tokenB.deployed();

    accounts = await ethers.getSigners();
    const lpFactory = await ethers.getContractFactory("LiquidityPool");
    lp = await lpFactory.connect(accounts[0]).deploy(tokenA.address, tokenB.address);
    await lp.deployed();

    let inputA = await tokenA.approve(lp.address, 1000000);
    inputA.wait()
    let inputB = await tokenB.approve(lp.address, 1000000);
    inputB.wait()

    let input = await lp.initialize(1000, 1000);
    input.wait()
});

describe("Deployment", function () {
  it("Should be Initialized", async function () {
    expect(await lp.initialized()).to.be.true;
  });

  it("Should Deploy with the correct Contracts", async function () {
    expect(tokenA.address).to.equal(await lp.tokenA());
    expect(tokenB.address).to.equal(await lp.tokenB());
  });

  it("Should Deploy with the correct Values", async function () {
    expect(await lp.getBalanceA()).to.equal(1000);
    expect(await lp.getBalanceB()).to.equal(1000);
  });

});

describe("Logic", function () {
  it("Should transfer out correct balance for ExactIn for Token A", async function () {

    let pre = await getBalances();

    let tfer = 10;
    let exactIn = await lp.exactInTransfer(true, tfer);
    exactIn.wait();

    let post = await getBalances();

    let expectedChange = (pre.contractBalA*pre.contractBalB)/(pre.contractBalA-tfer) - pre.contractBalB;

    expect(post.contractBalA.toNumber()).to.equal(pre.contractBalA.toNumber() + tfer);
    expect(post.userBalA.toNumber()).to.equal(pre.userBalA.toNumber() - tfer);
    expect(post.contractBalB.toNumber()).to.approximately(pre.contractBalB.toNumber() - expectedChange,1);
    expect(post.userBalB.toNumber()).to.approximately(pre.userBalB.toNumber() + expectedChange,1);
  });

  it("Should transfer out correct balance for ExactIn for Token B", async function () {
    let pre = await getBalances();

    let tfer = 10;
    let exactIn = await lp.exactInTransfer(false, tfer);
    exactIn.wait();

    let post = await getBalances();

    let expectedChange = (pre.contractBalA*pre.contractBalB)/(pre.contractBalB-tfer) - pre.contractBalA;

    expect(post.contractBalA.toNumber()).to.approximately(pre.contractBalA.toNumber() - expectedChange, 1);
    expect(post.userBalA.toNumber()).to.approximately(pre.userBalA.toNumber() + expectedChange, 1);
    expect(post.contractBalB.toNumber()).to.equal(pre.contractBalB.toNumber() + tfer);
    expect(post.userBalB.toNumber()).to.equal(pre.userBalB.toNumber() - tfer);
  });

  it("Should transfer out correct balance for ExactOut for Token A", async function () {

    let pre = await getBalances();

    let tfer = 10;
    let exactIn = await lp.exactOutTransfer(true, tfer);
    exactIn.wait();

    let post = await getBalances();

    let expectedChange = (pre.contractBalA*pre.contractBalB)/(pre.contractBalA-tfer) - pre.contractBalB;

    expect(post.contractBalA.toNumber()).to.equal(pre.contractBalA.toNumber() - tfer);
    expect(post.userBalA.toNumber()).to.equal(pre.userBalA.toNumber() + tfer);
    expect(post.contractBalB.toNumber()).to.approximately(pre.contractBalB.toNumber() + expectedChange,1);
    expect(post.userBalB.toNumber()).to.approximately(pre.userBalB.toNumber() - expectedChange,1);
  });

  it("Should transfer out correct balance for ExactOut for Token B", async function () {

    let pre = await getBalances();

    let tfer = 10;
    let exactIn = await lp.exactOutTransfer(false, tfer);
    exactIn.wait();

    let post = await getBalances();

    let expectedChange = (pre.contractBalA*pre.contractBalB)/(pre.contractBalB-tfer) - pre.contractBalA;

    expect(post.contractBalB.toNumber()).to.equal(pre.contractBalB.toNumber() - tfer);
    expect(post.userBalB.toNumber()).to.equal(pre.userBalB.toNumber() + tfer);
    expect(post.contractBalA.toNumber()).to.approximately(pre.contractBalA.toNumber() + expectedChange,1);
    expect(post.userBalA.toNumber()).to.approximately(pre.userBalA.toNumber() - expectedChange,1);
  });
});

