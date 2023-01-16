const { getUsedIdentifiers } = require("typechain");
require('dotenv').config();
require("@nomicfoundation/hardhat-toolbox");
require("hardhat-deploy");



/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
  // solidity: "0.8.8",
  solidity: {
    compilers: [{version:"0.8.8" }, {version: "0.6.6"}]
  },
  defaultNetwork: "hardhat",
  networks: {
    goerli: {
      url: process.env.GOERLI_URL,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 5,
      blockConfirmations: 6,
    },
  },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS !== undefined,
  //   currency: USD
  // },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  }
};
