const { PrivateKey, Client } = require('@hashgraph/sdk');

/**
 * Create client for signing purpose
 * @param {*} accountId 
 * @param {*} privateKey 
 * @returns 
 */
exports.createClient = (accountId, privateKey) => {
    // Check if the required accounts are present
    if (accountId == null || privateKey == null) {
        throw new Error(
            'Both MASTER_ACCOUNT_ID and MASTER_PRIVATE_KEY must be present'
        );
    }
    const client = Client.forTestnet();
    client.setOperator(accountId, PrivateKey.fromString(privateKey));
    return client;
}

/**
 * Create client for data fetch purpose
 * @returns 
 */
exports.createSimpleClient = () => {
    const client = Client.forTestnet();
    return client;
}