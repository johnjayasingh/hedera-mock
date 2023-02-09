
const { ContractCreateFlow, ContractExecuteTransaction, ContractFunctionParameters } = require('@hashgraph/sdk')
const { hethers } = require('@hashgraph/hethers');

const { accountsPath } = require('../../constants');
const { createClient } = require('../../lib/client')
const { bytecode } = require('./bytecode')
const randomNumber = require('./randomNumber')

const [account1] = require(accountsPath);

// Create a new Hedera client
const client = createClient(account1.accountId, account1.privateKey);


// Generate a random number and deploy a contract with the generated number as constructor parameter
async function main() {

    // Create a random number 
    const generatedNumber = await randomNumber();
    // User to attach random number to
    const userKey = 'Alice'

    // Create contract with the bytecode created for the solidity smart contract
    const contractCreation = new ContractCreateFlow()
        .setGas(100000)
        .setBytecode(`${bytecode}`)
        .setConstructorParameters(
            new ContractFunctionParameters()
                .addString(userKey)
                .addUint256(generatedNumber)
        );

    // Sign the transaction with the client operator key and submit to a Hedera network
    const txResponse = await contractCreation.execute(client);

    // Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    // Get the new contract ID
    const contractId = receipt.contractId;

    console.log(`The contract ID is ${contractId}`);

    console.log(`Successfully set the user ${userKey} with value ${generatedNumber}`)
}

main();