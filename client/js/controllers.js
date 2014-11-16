'use strict';

/* Controllers */
function HomeController($scope){}

function LoginController($scope, $state, LastFlagUser, AppAuth){
    $scope.credentials = {};

    $scope.login = function(){
            LastFlagUser.login($scope.credentials,
                function(accessToken){
                    console.log('SUCCESS - Login - Access Token = ' + accessToken.id);
                    AppAuth.accessToken = accessToken.id;
                    AppAuth.currenUserID = accessToken.userId;

                    AppAuth.currentUser = LastFlagUser.findOne(
                        {filter: {
                                where: {id: AppAuth.currenUserID},
                            include: {"accounts": ["currency", {"sendTransactions": "toAccount"}, {"receiveTransactions": "fromAccount"}]}
                        }},
                        function(retrievedUser) {
                            console.log('Success retrieving the accounts');
                            $state.go('accounts');
                        },
                        function(err) {
                            console.log('Failed to retrieve the accounts');
                        });
                },
                function(err){
                    console.log('ERROR - Login Failure');
                    $scope.loginError = err.data.error;
                    for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
                });
    }
}

function RegistrationController($scope, $state, AppAuth, CurrencyService, Currency, LastFlagUser, Account){
    $scope.registration = {};
    $scope.timeout = 1000 * 60 * 60 * 24; //24 hours
    //$scope.assets = [{name:'test', id:1, issued:100}, {name:'test2', id:2, issued:1000}];

    //TODO: Refactor to not require a Currency parameter...
    $scope.currencies = CurrencyService.getAllCurrencies(Currency);


    $scope.register = function(){

        var registrationDetails = {username: $scope.registration.username,
                              email: $scope.registration.username + '@test.com',
                              password: $scope.registration.password};

        LastFlagUser.create(registrationDetails,
                                function(user){
                                    console.log('SUCCESS - Created a new User - User ID = ' + user.id);
                                    $scope.user = user;

                                    var credentials = {"username": $scope.registration.username,
                                                        "password": $scope.registration.password,
                                                        "ttl": $scope.timeout};

                                    LastFlagUser.login(credentials,
                                        function(accessToken){
                                            console.log('SUCCESS - Login - Access Token = ' + accessToken.id);
                                            AppAuth.accessToken = accessToken.id;
                                            AppAuth.currentUserID = accessToken.userId;

                                            AppAuth.currentUser = LastFlagUser.findOne(
                                                {filter: {
                                                    where: { id: AppAuth.currenUserID },
                                                    include: "accounts"
                                                }},
                                                function(retrievedUser) {
                                                    console.log('Success retrieving the accounts');
                                                    $state.go('accounts');
                                                },
                                                function(err) {
                                                    console.log('Failed to retrieve the accounts');
                                                });

                                        },
                                        function(err){
                                            console.log('ERROR - Login Failure');
                                            $scope.registerError = err.data.error;
                                            for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
                                    });
                                },
                                function(err){
                                    console.log('ERROR - User Creation Failure');
                                    $scope.registerError = err.data.error;
                                    for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
                                });

    }
}


function AccountsSummaryController($scope, $state, $ionicPopup, LastFlagUser, Account, Currency, AppAuth, CurrencyService){
    AppAuth.ensureHasCurrentUser(LastFlagUser, function(){
        AppAuth.reloadCurrentUser(LastFlagUser, $scope.loadAssetAccounts);
    });

    $scope.createdAssets = [];
    $scope.receivedAssets = [];

    //TODO: Refactor to not require a Currency parameter...
    $scope.currencies = CurrencyService.getAllCurrencies(Currency);

    $scope.mainNavRightButtons = [
        {   content: '',
            type:"icon ion-log-out",
            tap: function(evt){
                LastFlagUser.logout(null, function(err){console.log('Logged out');});
                AppAuth.clearCredentials();
                $state.go('home');
            }
        }];


    $scope.resetNewAccountDetails = function() {
        $scope.newAccountDetails = { "otNymID": AppAuth.currentUser.otNymID,
                                    "otAccountID": "",
                                    "name": "",
                                    "accountType": "D",
                                    "balance": "",
                                    "balanceDate": "",
                                    "userID": AppAuth.currentUserID,
                                    "currencyID": "" };
    };

    $scope.createNewAssetType = function(){
        $ionicPopup.show({
            templateUrl: 'partials/createCurrency.html',
            title: 'Create Currency',
            scope: $scope,
            buttons: [
                { text: 'Cancel', onTap: function(e) { return true; } },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        return true;
                    }
                }
            ]
        }).then(function(res) {
            console.log('Tapped!', res);
        }, function(err) {
            console.log('Err:', err);
        }, function(msg) {
            console.log('message:', msg);
        });
    };




    $scope.loadAssetAccounts = function(){
        $scope.createdAssets = [];
        $scope.receivedAssets = [];
        for(var i = 0; i < AppAuth.currentUser.accounts.length; i++){
            if(AppAuth.currentUser.accounts[i].accountType == 'I'){
                $scope.createdAssets[$scope.createdAssets.length] = AppAuth.currentUser.accounts[i];
            }else if(AppAuth.currentUser.accounts[i].accountType == 'D'){
                $scope.receivedAssets[$scope.receivedAssets.length] = AppAuth.currentUser.accounts[i];
            }
        }
    };
    $scope.createAssetAccount = function(){
        $scope.resetNewAccountDetails();

        $ionicPopup.show({
            templateUrl: 'partials/createAccount.html',
            title: 'Create Account',
            scope: $scope,
            buttons: [
                { text: 'Cancel', onTap: function(e) { return true; } },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.saveAssetAccount();
                        return true;
                    }
                }
            ]
        }).then(function(res) {
            console.log('Tapped!', res);
        }, function(err) {
            console.log('Err:', err);
        }, function(msg) {
            console.log('message:', msg);
        });
    };
    $scope.saveAssetAccount = function(){
        Account.create($scope.newAccountDetails,
            function(account){
                console.log('SUCCESS - Created an Account - AccountID = ' + account.id);
                AppAuth.reloadCurrentUser(LastFlagUser, $scope.loadAssetAccounts);
            },
            function(err){
                console.log('ERROR - Create Account Failure');
                for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
            });
    };




    if(AppAuth.currentUser.accounts){
        $scope.loadAssetAccounts();
    }


}

function AccountDetailController($scope, $state, $ionicPopup, LastFlagUser, Account, Transaction, AppAuth){
    AppAuth.ensureHasCurrentUser(LastFlagUser, function(){
        AppAuth.reloadCurrentUser(LastFlagUser, $scope.loadCurrentAccount);
    });

    $scope.allSendToAccounts = null;
    $scope.currentAccount = null;
    $scope.allTransactions = null;

    $scope.mainNavRightButtons = [
        {   content: '',
            type:"icon ion-log-out",
            tap: function(evt){
                LastFlagUser.logout(null, function(err){console.log('Logged out');});
                AppAuth.clearCredentials();
                $state.go('home');
            }
        }];

    $scope.loadCurrentAccount = function() {
        for (var i = 0; i < AppAuth.currentUser.accounts.length; i++) {
            if (AppAuth.currentUser.accounts[i].id == $state.params.id) {
                $scope.currentAccount = AppAuth.currentUser.accounts[i];
                break;
            }
        }

        if($scope.currentAccount == null){
            console.log('ERROR - Could not find the Current Account based on the requested id:' + $state.params.id);
            return;
        }

        $scope.loadAllTransactions();
        $scope.loadAllSendToAccounts();
    };

    $scope.loadAllTransactions = function(){
        $scope.allTransactions = [];

        for(var i in $scope.currentAccount.sendTransactions){
            $scope.allTransactions[$scope.allTransactions.length] = $scope.currentAccount.sendTransactions[i];
        }

        for(var j in $scope.currentAccount.receiveTransactions){
            $scope.allTransactions[$scope.allTransactions.length] = $scope.currentAccount.receiveTransactions[j];
        }
    };

    $scope.loadAllSendToAccounts = function(){
        var filter = null;
        if($scope.currentAccount.accountType == 'I') {
            filter = {filter: {
                where: {
                    currencyID: $scope.currentAccount.currencyID,
                    id: { neq: $scope.currentAccount.id },
                    accountType: 'D'
                }
            }};
        }else{
            filter = {filter:{
                where: {
                    currencyID: $scope.currentAccount.currencyID,
                    id: { neq: $scope.currentAccount.id },
                    accountType: { neq: 'R' }
                }
            }};
        }
        $scope.allSendToAccounts = Account.find(filter,
            function(err, accounts){
                console.log('Got the accounts');
            }
        );
    };

    $scope.resetNewTransactionDetails = function() {
        $scope.newTransactionDetails = { "amount": "",
                                        "creationDate": "",
                                        "memo": "",
                                        "sourceAccountID": $scope.currentAccount.id,
                                        "destinationAccountID": "" };
    };

    $scope.showSendCurrency = function(){
        $scope.resetNewTransactionDetails();

        $ionicPopup.show({
            templateUrl: 'partials/sendCurrency.html',
            title: 'Send ' + $scope.currentAccount.currency.name,
            scope: $scope,
            buttons: [
                { text: 'Cancel', onTap: function(e) { return true; } },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function(e) {
                        $scope.sendCurrency();
                        return true;
                    }
                }
            ]
        }).then(function(res) {
            console.log('Tapped!', res);
        }, function(err) {
            console.log('Err:', err);
        }, function(msg) {
            console.log('message:', msg);
        });
    };
    $scope.sendCurrency = function(){
        $scope.newTransactionDetails.creationDate = (new Date()).toString();
        Transaction.create($scope.newTransactionDetails,
            function(transaction){
                console.log('SUCCESS - Created a Transaction - TransactionID = ' + transaction.id);
                AppAuth.reloadCurrentUser(LastFlagUser, $scope.loadCurrentAccount);
            },
            function(err){
                console.log('ERROR - Create Transaction Failure');
                for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
            });
    };

    $scope.showDeleteAccount = function(){
        var confirmPopup = $ionicPopup.confirm({
            title: 'Delete ' + $scope.currentAccount.name,
            scope: $scope,
            template: 'Are you sure you want to delete this account?'
        });
        confirmPopup.then(function(res){
            if(res) {
                $scope.deleteAccount();
            }
        });
    };
    $scope.deleteAccount = function(){
        Account.deleteById({id: $scope.currentAccount.id},
            function(success, headers){
                console.log('SUCCESS - Deleted the account');
                AppAuth.reloadCurrentUser(LastFlagUser, function(){$state.go('accounts');});
            },
            function(err) {
                console.log('ERROR - Failed to delete the account');
            });
    };

    if(AppAuth.currentUser.accounts){
        $scope.loadCurrentAccount();
    }
}






angular.module('lastFlagApp.controllers', ['lbServices', 'lastFlagApp.services'])
  .controller('HomeController', ['$scope', HomeController])
  .controller('LoginController', ['$scope', '$state', 'LastFlagUser', 'AppAuth', LoginController])
  .controller('RegistrationController', ['$scope', '$state', 'CurrencyService', 'Currency', 'LastFlagUser', RegistrationController])
  .controller('AccountsSummaryController', ['$scope', '$state', '$ionicPopover', 'LastFlagUser', 'Account', 'Currency', 'AppAuth', 'CurrencyService', AccountsSummaryController])
  .controller('AccountDetailController', ['$scope', '$state', '$ionicPopup', 'LastFlagUser', 'Account', 'Transaction', 'AppAuth', AccountDetailController]);
