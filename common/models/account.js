module.exports = function(Account) {

    Account.defaultAssetID ='dky86RGUPSAhdjcf6AyDtNtiFLvzfMdMa83b53WLXbI'; //hacker coins
    Account.defaultCurrencyID = 1; //hacker coins


    Account.beforeCreate = function(next, toBeCreatedAccount) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/node-otapi/node_otapi');

        if(toBeCreatedAccount.otAccountID == ""){
            var newAccountID = otapi.createAccount(toBeCreatedAccount.name, toBeCreatedAccount.otNymID, Account.defaultAssetID);
            toBeCreatedAccount.otAccountID = newAccountID;
        }

        if(toBeCreatedAccount.accountType == ""){
            toBeCreatedAccount.accountType = "D"; //Deposit account
        }

        if(toBeCreatedAccount.balanceDate == "" || toBeCreatedAccount.balance == ""){
            toBeCreatedAccount.balanceDate = (new Date()).toString();
            toBeCreatedAccount.balance = "0";
        }

        console.log('SUCCESS - Finished creating a new Account');

        next();
    };



};
