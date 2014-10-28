


module.exports = function(lastFlagUser) {


    lastFlagUser.defaultAssetID ='dky86RGUPSAhdjcf6AyDtNtiFLvzfMdMa83b53WLXbI'; //hacker coins
    lastFlagUser.defaultCurrencyID = 1; //hacker coins

    lastFlagUser.afterRemote('create', function(ctx, newlyCreatedLastFlagUser, next) {
       var app = require('../../server/server');
       var otapi = require('../../node_modules/node-otapi/node_otapi');
       var account = app.models.Account;

       //Create a new Nym in Open Transactions to match the new User
       var newNymID = otapi.createNym(newlyCreatedLastFlagUser.username);

       //Create a new Account in Open Transactions based on the new User
       var newAccountName = newlyCreatedLastFlagUser.username + " - Main Account";
       var newAccountID = otapi.createAccount(newAccountName, newNymID, lastFlagUser.defaultAssetID)
       var newAccountSettings = { "otNymID": newNymID,
                                  "otAccountID": newAccountID,
                                  "name": newAccountName,
                                  "accountType": "D",
                                  "balance": "0",
                                  "balanceDate": (new Date()).toString(),
                                  "userID": newlyCreatedLastFlagUser.id,
                                  "currencyID": lastFlagUser.defaultCurrencyID};

       //Create a new Account in MySQL and store the OT identifiers
       account.create(newAccountSettings,
            function(err, newAccount){

                if(err != null) {
                    console.log('ERROR - Account Creation Failure?');
                    console.log(err);
                    return;
                }

                console.log('SUCCESS - Account Created for new LastFlagUser');
                console.log('SUCCESS - NymID: ' + newNymID);
                console.log('SUCCESS - AccountID:' + newAccountID);

            });

       console.log('SUCCESS - Finished creating a new LastFlagUser');

       next();
    });

};



