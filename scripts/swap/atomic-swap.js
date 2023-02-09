

const { TokenCreateTransaction, Wallet, PrivateKey, TransferTransaction, TokenAssociateTransaction } = require('@hashgraph/sdk');
const { accountsPath } = require('../../constants');
const { createClient } = require('../../lib/client')

const [_1, _2, _3, account1, account2] = require(accountsPath);

// Create a new Hedera client
const client = createClient(account1.accountId, account1.privateKey);

async function main() {
    // Create hedera wallet instances with private keys of the users 
    const account1User = new Wallet(account1.accountId, account1.privateKey);
    const account2User = new Wallet(account2.accountId, account2.privateKey);

    const account1PrivateKey = PrivateKey.fromString(account1.privateKey);
    const account2PrivateKey = PrivateKey.fromString(account2.privateKey);


    // Create the transaction and freeze for manual signing
    const transaction1 = await new TokenCreateTransaction()
        .setTokenName('Token #1')
        .setTokenSymbol('T1')
        .setInitialSupply(5000)
        .setAdminKey(account1User.publicKey)
        .setTreasuryAccountId(account1.accountId)
        .freezeWith(client);

    // Sign the transaction with the token adminKey which is also tresurry key
    const signTx1 = await transaction1.sign(account1PrivateKey);

    // Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse1 = await signTx1.execute(client);

    // Get the receipt of the transaction
    const receipt1 = await txResponse1.getReceipt(client);

    // Get the token ID from the receipt
    const tokenId1 = receipt1.tokenId;

    console.log("The new token ID #1 is " + tokenId1);



    // Create the transaction and freeze for manual signing
    const transaction2 = await new TokenCreateTransaction()
        .setTokenName('Token #2')
        .setTokenSymbol('T2')
        .setInitialSupply(5000)
        .setAdminKey(account2User.publicKey)
        .setTreasuryAccountId(account2.accountId)
        .freezeWith(client);

    // Sign the transaction with the token adminKey which is also tresurry key
    const signTx2 = await transaction2.sign(account2PrivateKey);

    // Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse2 = await signTx2.execute(client);

    // Get the receipt of the transaction
    const receipt2 = await txResponse2.getReceipt(client);

    // Get the token ID from the receipt
    const tokenId2 = receipt2.tokenId;

    console.log("The new token ID #2 is " + tokenId2);

    
    // In order to receive other token we will do association
    console.log(`Associating user ${account1.accountId} to token ${tokenId2}`)
    const associateOtherWalletTx1 = await new TokenAssociateTransaction()
        .setAccountId(account1.accountId)
        .setTokenIds([tokenId2])
        .freezeWith(client)
        .sign(account1PrivateKey)

    //SUBMIT THE TRANSACTION
    const associateOtherWalletTxSubmit1 = await associateOtherWalletTx1.execute(client);

    // GET THE RECEIPT OF THE TRANSACTION
    const associateOtherWalletRx1 = await associateOtherWalletTxSubmit1.getReceipt(client);
    console.log(`Token ${tokenId2} association with the user ${account1.accountId} was ${associateOtherWalletRx1.status}`);

    console.log(`Associating user ${account2.accountId} to token ${tokenId1}`)
    const associateOtherWalletTx2 = await new TokenAssociateTransaction()
        .setAccountId(account2.accountId)
        .setTokenIds([tokenId1])
        .freezeWith(client)
        .sign(account2PrivateKey)

    //SUBMIT THE TRANSACTION
    const associateOtherWalletTxSubmit2 = await associateOtherWalletTx2.execute(client);

    // GET THE RECEIPT OF THE TRANSACTION
    const associateOtherWalletRx2 = await associateOtherWalletTxSubmit2.getReceipt(client);
    console.log(`Token ${tokenId1} association with the user ${account2.accountId} was ${associateOtherWalletRx2.status}`);

    // Atomic swap between two hedera Token Service created tokens
    const atomicSwap = await new TransferTransaction()
        .addTokenTransfer(tokenId1, account1.accountId, -1)
        .addTokenTransfer(tokenId1, account2.accountId, 1)
        .addTokenTransfer(tokenId2, account2.accountId, -1)
        .addTokenTransfer(tokenId2, account1.accountId, 1)
        .freezeWith(client);

    // Sign the transaction with accountId1 and accountId2 private keys, submit the transaction to a Hedera network
    const txResponse = await (await (await atomicSwap.sign(account1PrivateKey)).sign(account2PrivateKey)).execute(client);


    //Request the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    //Get the transaction consensus status
    const transactionStatus = receipt.status;

    console.log(`The atomic swap has been ${transactionStatus}`);

}
main();