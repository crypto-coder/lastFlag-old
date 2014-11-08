module.exports = function(Transaction) {


    Transaction.afterRemote('create', function(ctx, newlyCreatedTransaction, next) {
        var app = require('../../server/server');
        var otapi = require('../../node_modules/node-otapi/node_otapi');
        var account = app.models.Transaction;

        console.log('SUCCESS - Finished creating a new Transaction');

        next();
    });




};
