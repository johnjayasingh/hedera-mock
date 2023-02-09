const { PrivateKey, Client } = require('@hashgraph/sdk');

exports.createClient = (accountId, privateKey) => {
    // Check if the required accounts are present
    if (accountId == null || privateKey == null) {
        throw new Error(
            'Both MASTER_ACCOUNT_ID and MASTER_PRIVATE_KEY must be present'
        );
    }
    const client = Client.forTestnet();

    client.setOperator(accountId, PrivateKey.fromString(privateKey));
    console.log('Hedera client created')
    return client;
}