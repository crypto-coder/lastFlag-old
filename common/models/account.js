module.exports = function(Account) {

    Account.defaultAssetID ='dky86RGUPSAhdjcf6AyDtNtiFLvzfMdMa83b53WLXbI'; //hacker coins
    Account.defaultCurrencyID = 1; //hacker coins


    Account.beforeCreate = function(next, toBeCreatedAccount) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/otapi/build/Release/otapi');
        var currency = app.models.Currency;


        if(toBeCreatedAccount.accountType == ""){
            toBeCreatedAccount.accountType = "D"; //Deposit account
        }

        if(toBeCreatedAccount.balanceDate == "" || toBeCreatedAccount.balance == ""){
            toBeCreatedAccount.balanceDate = (new Date()).toString();
            toBeCreatedAccount.balance = "0";
        }

        if(toBeCreatedAccount.otAccountID == "" && toBeCreatedAccount.currencyID > 0){
            currency.findOne(
                {where: {id: toBeCreatedAccount.currencyID}},
                function(err, selectedCurrency) {
                    if (err) {
                        console.log('ERROR - Could not find Currency [REMOVED] Account while attempting to delete an Account');
                        return;
                    }

                    var newAccountID = otapi.createAccount(toBeCreatedAccount.name, toBeCreatedAccount.otNymID, selectedCurrency.otAssetID);
                    toBeCreatedAccount.otAccountID = newAccountID;
                    console.log('SUCCESS - Finished creating a new Account');

                    next();
                });
        }else{
            next();
        }
    };


    Account.beforeDestroy = function(next, toBeDeletedAccount) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/otapi/build/Release/otapi');
        var transaction = app.models.Transaction;

        if(toBeDeletedAccount.otAccountID == ""){
            console.log('ERROR - Account.otAccountID required for Delete operation');
            return;
        }

        if(toBeDeletedAccount.accountType != "D"){
            console.log('ERROR - Only Deposit account can be Deleted');
            return;
        }

        //Make sure the balance is 0
        var currentBalance = otapi.getAccountBalance(toBeDeletedAccount.otAccountID);
        if(currentBalance != 0){
            console.log('ERROR - Only Deposit accounts with a zero balance can be Deleted');
            return;
        }

        //Find the [REMOVED] Account for this Currency
        Account.findOne(
            {where: {and: [{accountType:'R'}, {currencyID:toBeDeletedAccount.currencyID}]}},
            function(err, specialRemovedAccount){
                if(err){
                    console.log('ERROR - Could not find Currency [REMOVED] Account while attempting to delete an Account');
                    return;
                }

                //Reassign all Transactions with this Account to the Removed Account
                transaction.updateAll(
                    {sourceAccountID:toBeDeletedAccount.id},
                    {sourceAccountID:specialRemovedAccount.id},
                    function(err, count){
                        if(err){
                            console.log('ERROR - Could not move all Send Transactions for this Account to the [REMOVED] Account, while attempting to delete the Account');
                            return;
                        }
                        console.log('SUCCESS -  Moved ' + count.affectedRows + ' Send Transactions to the [REMOVED] Account');
                    }
                );

                transaction.updateAll(
                    {destinationAccountID:toBeDeletedAccount.id},
                    {destinationAccountID:specialRemovedAccount.id},
                    function(err, count){
                        if(err){
                            console.log('ERROR - Could not move all Receive Transactions for this Account to the [REMOVED] Account, while attempting to delete the Account');
                            return;
                        }
                        console.log('SUCCESS - Moved ' + count.affectedRows + ' Receive Transactions to the [REMOVED] Account');
                    }
                );

                //Delete the Account in OT
                otapi.deleteAccount(toBeDeletedAccount.otAccountID);
                console.log('SUCCESS - Finished deleting the Account in OT');

                next();
            });
    };





};
