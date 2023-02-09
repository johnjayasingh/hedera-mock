
const { AccountAllowanceApproveTransaction, Hbar, PrivateKey, TransferTransaction, AccountBalanceQuery } = require('@hashgraph/sdk');
const { accountsPath } = require('../../constants');
const { createClient, createSimpleClient } = require('../../lib/client')

const [_1, _2, owner, spender, receiver] = require(accountsPath);


/**
 * Check account balance
 */
async function balance(accountId) {
    const client = createSimpleClient();
    //Create the account balance query
    const query = new AccountBalanceQuery()
        .setAccountId(accountId);

    //Submit the query to a Hedera network
    const accountBalance = await query.execute(client);

    //Print the balance of hbars
    console.log(`Account ${accountId} balance is ${accountBalance.hbars}`);
}


/**
 * Give 10 hbar allowance to the spender
 */
async function allowance() {

    // Create a new Hedera client with owner account
    const client = createClient(owner.accountId, owner.privateKey);

    // Create private key instance for owner keys
    const ownerAccountKey = PrivateKey.fromString(owner.privateKey)

    //Create the transaction
    const transaction = new AccountAllowanceApproveTransaction()
        .approveHbarAllowance(owner.accountId, spender.accountId, Hbar.from(10)).freezeWith(client);

    //Sign the transaction with the owner account key
    const signTx = await transaction.sign(ownerAccountKey);

    //Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`The approval transaction has been completed ${transactionStatus}`);

}

/**
 * Spend hbar from owner account with spender account to receiver account
 */
async function transferFrom() {
    // Create a new Hedera client with spender account
    const client = createClient(spender.accountId, spender.privateKey);

    // Create a transaction to transfer 1 hbars from owner behalf
    const transaction = new TransferTransaction()
        .addApprovedHbarTransfer(owner.accountId, new Hbar(-1))
        .addHbarTransfer(receiver.accountId, new Hbar(1));

    //Submit the transaction to a Hedera network
    const txResponse = await transaction.execute(client);

    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`Allowance has been spent by ${spender.accountId} ${transactionStatus}`);
}

/**
 * Test simple approve allowance and transfer with allowance in Hedera
 */
async function main() {
    console.log('Balance before transfer')
    await allowance()
    await balance(owner.accountId);
    await balance(spender.accountId);
    await balance(receiver.accountId);
    await transferFrom();
    console.log('Balance post transfer')
    await balance(owner.accountId);
    await balance(spender.accountId);
    await balance(receiver.accountId);
}

main();