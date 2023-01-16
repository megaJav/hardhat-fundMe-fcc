const { getNamedAccounts, ethers } = require("hardhat")


async function main() {
    const { deployer } = getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    console.log("Funding contract....")

    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("1"),
    })
    await transactionResponse.wait(1)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
