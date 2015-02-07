


module.exports = function(lastFlagUser) {


    lastFlagUser.defaultAssetID ='dky86RGUPSAhdjcf6AyDtNtiFLvzfMdMa83b53WLXbI'; //hacker coins
    lastFlagUser.defaultCurrencyID = 1; //hacker coins


    lastFlagUser.getCurrentUser = function(){
        var app = require('../../server/server');
        var accessToken = app.models.AccessToken;

        var currentUserToken = accessToken.findOne(
            {where:{id:app.headers['Authorization']}},
            function(err, currentAccessToken) {
                if (err) {
                    console.log('ERROR - Could not find the AccessToken for the current session');
                    return;
                }

                lastFlagUser.findOne(
                    {where:{id:currentAccessToken.userId}},
                    function(err, currentUser) {
                        if (err) {
                            console.log('ERROR - Could not find the AccessToken for the current session');
                            return;
                        }

                        return currentUser;
                    }
                );
            }
        );

        return currentUserToken;
    };


    lastFlagUser.beforeCreate = function(next, toBeCreatedLastFlagUser) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/otapi/build/Release/otapi');

        //Create a new Nym in Open Transactions to match the new User
        var newNymID = otapi.createNym(toBeCreatedLastFlagUser.username);
        toBeCreatedLastFlagUser.otNymID = newNymID;

        console.log('SUCCESS - Finished creating a new LastFlagUser');

        next();
    };

    lastFlagUser.afterCreate = function(next) {
        var app = require('../../server/server');
        var account = app.models.Account;

        //Define parameters for a new Account
       var newAccountName = this.username + " - Main Account";
       var newAccountSettings = { "otNymID": this.otNymID,
                                  "otAccountID": "",
                                  "name": newAccountName,
                                  "accountType": "D",
                                  "balance": "",
                                  "balanceDate": "",
                                  "userID": this.id,
                                  "currencyID": lastFlagUser.defaultCurrencyID};

       //Create a new Account for the new User
       account.create(newAccountSettings,
            function(err, newAccount){

                if(err != null) {
                    console.log('ERROR - Account Creation Failure?');
                    console.log(err);
                    return;
                }

                console.log('SUCCESS - Account Created for new LastFlagUser');
                console.log('SUCCESS - NymID: ' + newAccount.otNymID);
                console.log('SUCCESS - AccountID:' + newAccount.otAccountID);

            });

        next();
    };

};



