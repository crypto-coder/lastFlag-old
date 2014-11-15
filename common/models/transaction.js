module.exports = function(Transaction) {



    Transaction.beforeCreate = function(next, toBeCreatedTransaction) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/node-otapi/node_otapi');
        var account = app.models.Account;


        account.findByIds(  [   toBeCreatedTransaction.sourceAccountID,
                                toBeCreatedTransaction.destinationAccountID],
                            function(err, accounts){
                                console.log('Create Transaction - Found some accounts');
                                if(accounts.length < 2){
                                    console.log('Create Transaction - Could not find all accounts in the database');
                                    return;
                                }

                                var fromAccount = (accounts[0].id == toBeCreatedTransaction.sourceAccountID) ? accounts[0] : accounts[1];
                                var toAccount = (accounts[0].id == toBeCreatedTransaction.destinationAccountID) ? accounts[0] : accounts[1];

                                //Create a transaction in OT
                                otapi.transferAssets(fromAccount.otNymID,
                                                     fromAccount.otAccountID,
                                                     toAccount.otAccountID,
                                                     toBeCreatedTransaction.amount,
                                                     toBeCreatedTransaction.memo);

                                console.log('SUCCESS - Finished creating a new Transaction in OT');



                                //Update the Source and Destination Account balance
                                fromAccount.updateAttributes({
                                      balance: otapi.getAccountBalance(fromAccount.otAccountID),
                                      balanceDate: (new Date()).toDateString()},
                                      function(err, updatedAccount){
                                          if(err){
                                              console.log('ERROR - Failed to update the From Account for the new Transactions');
                                              return;
                                          }
                                          console.log('SUCCESS - Updated the From Account for the new Transaction');
                                      });

                                toAccount.updateAttributes({
                                        balance: otapi.getAccountBalance(toAccount.otAccountID),
                                        balanceDate: (new Date()).toDateString()},
                                    function(err, updatedAccount){
                                        if(err){
                                            console.log('ERROR - Failed to update the To Account for the new Transactions');
                                            return;
                                        }
                                        console.log('SUCCESS - Updated the To Account for the new Transaction');
                                    });





                                next();
                            });
    };



};
