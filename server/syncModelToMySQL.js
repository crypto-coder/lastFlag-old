var server = require('./server');
var ds = server.dataSources.localMYSQL;

var accountJSONLoaded = require('../common/models/account');
console.log("accountJSONLoaded = " + accountJSONLoaded);

console.log("going to get the existing Account Model /n");
var Account = ds.getModel("Account", false);
console.log(Account);
//ds.createModel(Account.name, Account.properties, Account.options);

ds.automigrate(function () {
  ds.discoverModelProperties('Account', function (err, props) {
    console.log(props);
  });
});


