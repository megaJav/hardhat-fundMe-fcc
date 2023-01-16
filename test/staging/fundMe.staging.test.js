const { getNamedAccounts, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
const { isCallTrace } = require("hardhat/internal/hardhat-network/stack-traces/message-trace")

// let variable = false
// let somevar = variable ? "yes" : "no"
developmentChains.include(network.name) 
    ? describe.skip
    : describe("FundMe", async function () {
        let FundMe
        let deployer
        const sendValue = ethers.utils.parseEther("1")

        beforeEach(async function() {
            deployer = (await getNamedAccounts()).deployer
            FundMe = await ethers.getContract("FundMe", deployer)
        })

        it("allows people to fund and withdraw", async function () {
            await FundMe.fund({ value: sendValue })
            await FundMe.withdraw()
            
            const endingBalance = await FundMe.provide.getBalance(
                FundMe.address
            )
            assert.equal(endingBalance.toString(), "0")
        })
    })