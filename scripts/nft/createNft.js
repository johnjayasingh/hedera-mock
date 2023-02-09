const { CustomRoyaltyFee, TokenCreateTransaction, CustomFixedFee, TokenSupplyType, TokenType, Wallet, Hbar, PrivateKey } = require("@hashgraph/sdk");
const { accountsPath } = require('../../constants');
const { createClient } = require('../../lib/client')

const [_1, _2, admin, treasury, supply] = require(accountsPath);

// Create a new Hedera client
const client = createClient(admin.accountId, admin.privateKey);


// Create a nft with royalty fee 
async function main() {
    // Create hedera wallet instances with private keys of the users 
    const adminUser = new Wallet(admin.accountId, admin.privateKey);
    const supplyUser = new Wallet(supply.accountId, supply.privateKey);
    const adminPrivateKey = PrivateKey.fromString(admin.privateKey);
    const treasuryPrivateKey = PrivateKey.fromString(treasury.privateKey);

    let nftCustomFee = new CustomRoyaltyFee()
        .setNumerator(5)
        .setDenominator(10)
        .setFeeCollectorAccountId(treasury.accountId)
        //the fallback fee is set to 1 hbar.
        .setFallbackFee(new CustomFixedFee().setHbarAmount(new Hbar(1)));

    // CREATE NFT WITH CUSTOM FEE
    let nftCreate = await new TokenCreateTransaction()
        .setTokenName("Accubits Royalty Token")
        .setTokenSymbol("ACCUBIT")
        .setTokenType(TokenType.NonFungibleUnique)
        .setDecimals(0)
        .setInitialSupply(0)
        .setTreasuryAccountId(treasury.accountId)
        .setSupplyType(TokenSupplyType.Finite)
        .setMaxSupply(5)
        .setCustomFees([nftCustomFee])
        .setAdminKey(adminUser.publicKey)
        .setSupplyKey(supplyUser.publicKey)
        .freezeWith(client)
        .sign(treasuryPrivateKey);

    let nftCreateTxSign = await nftCreate.sign(adminPrivateKey);
    let nftCreateSubmit = await nftCreateTxSign.execute(client);
    let nftCreateRx = await nftCreateSubmit.getReceipt(client);
    let tokenId = nftCreateRx.tokenId;
    console.log(`Created NFT with Token ID: ${tokenId}`);
}

main();