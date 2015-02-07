module.exports = function(Currency) {

    var issuerAccountDetails = {
        "otNymID": "",
        "otAccountID": "",
        "name": "Issuer Account",
        "accountType": "I",
        "balance": "0",
        "balanceDate": "",
        "userID": "",
        "currencyID": ""
    };
    var removedAccountDetails = {
        "otNymID": "",
        "otAccountID": "",
        "name": "[REMOVED]",
        "accountType": "R",
        "balance": "0",
        "balanceDate": "",
        "userID": "",
        "currencyID": ""
    };



    Currency.beforeRemote('create', function(ctx, toBeCreatedCurrency, next) {
        var app = require('../../server/server');
        var lfUser = app.models.lastFlagUser;

        //Get the OT Nym ID for the current user
        var curUser = lfUser.findOne(
            {where:{id:ctx.req.accessToken.userId}},
            function(err, currentUser) {
                if (err) {
                    console.log('ERROR - Could not find the AccessToken for the current session');
                    return;
                }

                //Update the New Issuer Account information that we have so far.
                //We will Issue the Asset and store the Issuer Account details after the Currency record is created
                issuerAccountDetails = {
                    "otNymID": currentUser.otNymID,
                    "otAccountID": "",
                    "name": "Issuer Account",
                    "accountType": "I",
                    "balance": "0",
                    "balanceDate": (new Date()).toString(),
                    "userID": currentUser.id,
                    "currencyID": ""
                };
                removedAccountDetails = {
                    "otNymID": currentUser.otNymID,
                    "otAccountID": "",
                    "name": "[REMOVED]",
                    "accountType": "R",
                    "balance": "0",
                    "balanceDate": (new Date()).toString(),
                    "userID": currentUser.id,
                    "currencyID": ""
                };

                next();
            }
        );
    });
    Currency.beforeCreate = function(next, toBeCreatedCurrency){
        var app = require('../../server/server');
        var otapi = require('../../node_modules/otapi/build/Release/otapi');
        var xmldom = require('xmldom');
        var fs = require('fs');
        var path = require('path');

        //Load an XML contract template
        var DOMParser = xmldom.DOMParser;
        var DOMSerializer = xmldom.XMLSerializer;

        var fileData = fs.readFileSync(path.resolve(__dirname, '../templates/currencyTemplate.xml'), 'ascii');
        var doc = new DOMParser().parseFromString(fileData.substring(0, fileData.length),'text/xml');

        //Change the name, tla, and fraction values in the currency element of the contract
        var currencyNode = doc.documentElement.getElementsByTagName('currency')[0];
        currencyNode.setAttribute('name', toBeCreatedCurrency.name);
        currencyNode.setAttribute('tla', toBeCreatedCurrency.tla);
        currencyNode.setAttribute('fraction', 'm'+toBeCreatedCurrency.tla);
        var assetContract = new DOMSerializer().serializeToString(doc);

        //Create the asset from the XML
        var assetID = otapi.createNewAsset(issuerAccountDetails.otNymID, assetContract);
        toBeCreatedCurrency.otAssetID = assetID;
        console.log('ASSET ID : ' + assetID);

        //Cleanup
        doc = null;
        fileData = null;
        fs = null;
        xmldom = null;
        DOMParser = null;
        DOMSerializer = null;

        next();
    };


    Currency.afterCreate = function(next) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/otapi/build/Release/otapi');
        var account = app.models.Account;

        //Issue the signed asset contract
        var issuerAccountID = otapi.issueAsset(issuerAccountDetails.otNymID, this.otAssetID);
        console.log('ISSUER ACCOUNT ID : ' + issuerAccountID);

        //Update the New Issuer Account information and save it
        issuerAccountDetails.otAccountID = issuerAccountID;
        issuerAccountDetails.currencyID = this.id;
        issuerAccountDetails.name = this.name + ' - Issuer Account';

        account.create(issuerAccountDetails,
            function(err, newAccount){

                if(err) {
                    console.log('ERROR - Issuer Account Creation Failure?');
                    console.log(err);
                    return;
                }

                console.log('SUCCESS - Issuer Account Created for new Currency');
                console.log('SUCCESS - NymID: ' + newAccount.otNymID);
                console.log('SUCCESS - AccountID:' + newAccount.otAccountID);

            });

        //Update the [REMOVED] Account information and save it
        removedAccountDetails.currencyID = this.id;
        account.create(removedAccountDetails,
            function(err, newAccount){

                if(err) {
                    console.log('ERROR - [REMOVED] Account Creation Failure?');
                    console.log(err);
                    return;
                }

                console.log('SUCCESS - [REMOVED] Account Created for new Currency');
                console.log('SUCCESS - NymID: ' + newAccount.otNymID);
            });

        next();
    };


};
