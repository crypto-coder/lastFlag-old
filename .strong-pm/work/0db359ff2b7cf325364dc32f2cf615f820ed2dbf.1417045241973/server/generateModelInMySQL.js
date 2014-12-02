var server = require('./server');
var ds = server.dataSources.localMYSQL;
var loopback = require('loopback');
var User = loopback.User;


//console.log("going to get the existing Account Model /n");
//var Account = ds.getModel("Account", false);

ds.automigrate(function () {
  //ds.discoverModelProperties('Account', function (err, props) {
  //  console.log(props);
  //});
});




//MOVE THIS TO A SCRIPT FOR CREATING TEST DATA
//User.create({email:'test@user.com', password:'password', firstName:'Test', lastName:'User'}, createAccount);

//function createAccount(err, newUser){
//  Account.create({otNymID:'', otAccountID:'', name:'', balance:100, balanceDate:'09-17-2014'}, function(err, newAccount){
//    newUser.accountID = newAccount.id;
//    newUser.save(function(){});
//  });
//}



