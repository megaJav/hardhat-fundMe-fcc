// apuntes random: contract factory: una abstraccion del bytecode para hacer mas facil el despliegue del contrato


//import 
//main function
//calling of main function

// const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers")
// const { config } = require("chai")
const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { networkConfig } = require("../helper-hardhat-config.js")
require("dotenv").config()


module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts() 
    const chainId = network.config.chainId

    // const ethUSDPriceFeedAddress = networkConfig[ChainId]["ethUSDPriceFeed"]
    let ethUSDPriceFeedAddress

    //distinguimos entre un cadena real y una de desarrollo local
    
    if(developmentChains.includes(network.name)) {
        const ethUSDAggregator = await deployments.get("MockV3Aggregator")
        ethUSDPriceFeedAddress = ethUSDAggregator.address
    }else {
        ethUSDPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUSDPriceFeedAddress], // price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    log("_______________________________________________________")
}
module.exports.tags = ["all", "fundme"]