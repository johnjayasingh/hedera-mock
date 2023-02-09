
const { PrngTransaction } = require('@hashgraph/sdk')
const { join } = require('path');
const { accountsPath } = require('../../constants');
const { createClient } = require('../../lib/client')

// Load script specifc environment variables
const envPath = join(__dirname, '.env');
require('dotenv').config({
    path: envPath
});
console.log(`loaded environment variables from ${envPath}`);

// range of the random number to be generated from
const range = process.env.RANDOM_RANGE;

if (!range) {
    throw new Error(
        'A range must be provided to generate random number in RANDOM_RANGE environment variable '
    );
}

const [account1] = require(accountsPath);

// Create a new Hedera client
const client = createClient(account1.accountId, account1.privateKey);

async function main() {
    // Define the range of random number to be generated and execute
    const randomNumTx = await new PrngTransaction().setRange(range).execute(client);
    // Get the execution result record 
    const randomNumRec = await randomNumTx.getRecord(client);
    console.log(`Generated a random ${randomNumRec.prngNumber} using Hedera SDK`)
    return randomNumRec.prngNumber;
}

module.exports = main;