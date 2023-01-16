const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")

!developmentChains.include(network.name) 
    ? describe.skip
    : describe ("FundMe", function() {
        let FundMe
        let deployer
        let mockV3Aggregator
        const sendValue = ethers.utils.parseEther("1") //con esta linea podemos manipular numeros del ethereum sin necesitar las grandes filas de ceros

        beforeEach(async function () {
            //fuera hemos definido un objeto llamado deployer que no tiene ningun valor
            //en esta linea, al objeto deployer le damos el valor de una clave privada, 
            //por medio de la propiedad que tiene el objeto deployer llamada getnamedaccounnts
            deployer = (await getNamedAccounts()).deployer
            //con esta linea esperamos que todos los contratos con el o los tags indicados sean desplegados
            await deployments.fixture(["all"])
            //en esta linea al objeto fundme creado fuera le damos el valor del utlimo
            //fundme desplegado, y lo conectamos a la cuenta del deployer
            FundMe = await ethers.getContract("FundMe", deployer)
            //en esta linea al objeto en cuestion le damos el valor del aggregador de precios
            //con el nombre indicado
            mockV3Aggregator = await ethers.getContract(
                "MockV3Aggregator",
                deployer
            )
            //basicamente estamos preparando los elementos que necesitamos para un test individual 
            //que nos diga si hemos hecho bien el constructor
        })

        //este es el test propiamente dicho. creo que lo de antes era para preparar todos los elementos
        //que tienen lugar en el funcionamiento del elemento que queremos probar
        describe("constructor", function () {
            it("sets the aggregator addresses correctly", async function() {
                const response = await FundMe.priceFeed()
                //basicamente queremos saber si la direccion del contrato
                //que hemos indicado en la linea de arrriba es la misma que la del contrato mock
                assert.equal(response, mockV3Aggregator.address)
            })
        })


        describe("fund", function() {
            it("Fails if you dont send enough eth", async function () {
                await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH!")
            })
            
            it("updates the ammount funded data structure", async function () {
                await FundMe.fund({ value: sendValue })
                //en el objeto response guardamos el mapeo de la cuenta que ha contribuido a fundar el contrato
                const response = await FundMe.addressToAmountFunded(deployer)
                assert.equal(response.toString(), sendValue.toString())    
            })

            it("adds funders correctly", async function () {
                await FundMe.fund({ value: sendValue })//llamamos a la funcion y fundamos el contrato
                const response = await FundMe.funders(-1)
                assert.equal(response, deployer.address) 
            })
        })

        describe("withdraw", async function () {
            beforeEach(async function () {
                await FundMe.fund({ value: sendValue})
            })

            it("withdraws eht from a single founder", async function () {
                //arrange
                const startingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
                const startingDeployerBalance = await FundMe.provider.getBalance(deployer)
                //act 
                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
                const endingDeployerBalance = await FundMe.provider.getBalance(deployer)
                //assert 
                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )
            })

            it("allows us to withdrae with multiple funders", async function () {
                
                //arrange
                const accounts = await ethers.getSigners()
                //the cero index will be the deployer
                for(let i=1; i < 6; i++) {
                    const fundMeConnectedContract = await FundMe.connect(accounts[i])
                    await fundMeConnectedContract.fund({ value:  sendValue })
                }

                //act
                const startingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
                const startingDeployerBalance = await FundMe.provider.getBalance(deployer)

                const transactionResponse = await FundMe.withdraw()
                const transactionReceipt = await transactionResponse.wait(1)
                const { gasUsed, effectiveGasPrice } = transactionReceipt
                const gasCost = gasUsed.mul(effectiveGasPrice)

                //assert
                const endingFundMeBalance = await FundMe.provider.getBalance(FundMe.address)
                const endingDeployerBalance = await FundMe.provider.getBalance(deployer) 

                assert.equal(endingFundMeBalance, 0)
                assert.equal(
                    startingFundMeBalance.add(startingDeployerBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString()
                )

                //si hemos reseteado correctamente el array, al pedir el elemento situado en el 
                //indice cero, deberia dar error y ser revertida
                await expect(FundMe.funders(0)).to.be.reverted


                for(let i=1; i < 6; i++) {
                    assert.equal(
                    await FundMe.addressToAmountFunded(accounts[i].address), 0
                    )
                }
            })


            it("only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await FundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.reverted 
            })
        })
    })
