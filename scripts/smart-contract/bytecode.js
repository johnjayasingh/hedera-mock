
const path = require('path');
const fs = require('fs');
const solc = require('solc');

const contractPath = path.resolve(__dirname, 'contracts', 'LookupContract.sol');
const source = fs.readFileSync(contractPath, 'utf-8');

const input = {
    language: 'Solidity',
    sources: {
        'LookupContract.sol': {
            content: source
        }
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*']
            }
        }
    }
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));

const interface = output.contracts['LookupContract.sol'].LookupContract.abi;
const bytecode = output.contracts['LookupContract.sol'].LookupContract.evm.bytecode.object;

module.exports = {
    interface,
    bytecode,
};