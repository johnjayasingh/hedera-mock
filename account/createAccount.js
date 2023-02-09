const { PrivateKey, AccountCreateTransaction, Hbar, AccountBalanceQuery } = require('@hashgraph/sdk');
const { writeFile } = require('fs/promises');
const { join } = require('path');
const { accountsPath } = require('../constants');
const { createClient } = require('../lib/client');

// Load environment variables
const envPath = join(__dirname, '../.env');
require('dotenv').config({
    path: envPath
});
console.log(`loaded environment variables from ${envPath}`);

// new accounts to created using provided master account
const masterAccountId = process.env.MASTER_ACCOUNT_ID;
const masterPrivateKey = process.env.MASTER_PRIVATE_KEY;

// no of accounts to be created and amount of hbar to transfer as initial balance
const seedCount = process.env.SEED_COUNT || 5;
const seedAmount = process.env.SEED_AMOUNT || '1000';

// Create a new Hedera client
const client = createClient(masterAccountId, masterPrivateKey);


/**
 * Check account balance
 */
async function balance(accountId) {
    //Create the account balance query
    const query = new AccountBalanceQuery()
        .setAccountId(accountId);

    //Submit the query to a Hedera network
    const accountBalance = await query.execute(client);

    //Print the balance of hbars
    console.log(`Account ${accountId} created with balance ${accountBalance.hbars}`);
}


/**
 * Creates new hbar funded hedera account
 */
async function createAccount() {
    const _privateKey = PrivateKey.generateED25519();
    const account = await new AccountCreateTransaction()
        .setKey(_privateKey.publicKey)
        .setInitialBalance(Hbar.fromString(seedAmount))
        .execute(client);

    // Get the new account ID
    const getReceipt = await account.getReceipt(client);
    const accountId = getReceipt.accountId;

    return { accountId: `${accountId}`, privateKey: `${_privateKey}` };
};

async function main() {
    let accounts = [];
    // Repeat the account creation as per the seed count
    for (let index = 0; index < seedCount; index++) {
        const account = await createAccount();
        await balance(account.accountId)
        accounts.push(account);
    }
    // Write the seed accounts to a JSON file and reuse it 
    await writeFile(accountsPath, JSON.stringify(accounts, null, 3))
    process.exit();
}

main();