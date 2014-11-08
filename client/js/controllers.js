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
                                include: {"accounts": ["currency", {"transactions": ["fromAccount", "toAccount"]}]}
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

function RegistrationController($scope, $state, AppAuth, AssetService, Currency, LastFlagUser, Account){
    $scope.registration = {};
    $scope.timeout = 1000 * 60 * 60 * 24; //24 hours
    //$scope.assets = [{name:'test', id:1, issued:100}, {name:'test2', id:2, issued:1000}];

    //TODO: Refactor to not require a Currency parameter...
    $scope.assets = AssetService.getCurrentAssetList(Currency);


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


function AccountsSummaryController($scope, $state, $ionicModal, LastFlagUser, Account, Currency, AppAuth, AssetService){
    AppAuth.ensureHasCurrentUser(LastFlagUser);
    $scope.hasAccessToken = (AppAuth.accessToken != null);

    $scope.createdAssets = [];
    $scope.receivedAssets = [];
    $scope.newAccountDetails = { "otNymID": AppAuth.currentUser.otNymID,
                                "otAccountID": "",
                                "name": "",
                                "accountType": "D",
                                "balance": "",
                                "balanceDate": "",
                                "userID": AppAuth.currentUserID,
                                "currencyID": "" };

    //TODO: Refactor to not require a Currency parameter...
    $scope.currencies = AssetService.getCurrentAssetList(Currency);




    $scope.logout = function(){
        LastFlagUser.logout(null, function(err){console.log('Logged out');});
        AppAuth.clearCredentials();
        $state.go('home');
    };

    $scope.createNewAssetType = function(){
        $scope.createCurrencyModal.show();
    };




    $scope.loadAssetAccounts = function(){
        $scope.createdAssets = [];
        $scope.receivedAssets = [];
        for(var i = 0; i < AppAuth.currentUser.accounts.length; i++){
            if(AppAuth.currentUser.accounts[i].accountType == 'I'){
                $scope.createdAssets[$scope.createdAssets.length] = AppAuth.currentUser.accounts[i];
            }else{
                $scope.receivedAssets[$scope.receivedAssets.length] = AppAuth.currentUser.accounts[i];
            }
        }
    };
    $scope.createAssetAccount = function(){
        $scope.createAccountModal.show();
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

        $scope.createAccountModal.hide();
    };


    $scope.closeAllModals = function() {
        $scope.createCurrencyModal.hide();
        $scope.createAccountModal.hide();
    };
    $ionicModal.fromTemplateUrl('partials/createAccount.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.createAccountModal = modal;
    });
    $ionicModal.fromTemplateUrl('partials/createCurrency.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.createCurrencyModal = modal;
    });
    $scope.$on('$destroy', function() {
        $scope.createCurrencyModal.remove();
        $scope.createAccountModal.remove();
    });
    $scope.$on('modal.hidden', function() { });
    $scope.$on('modal.removed', function() { });





    $scope.loadAssetAccounts();

}

function AccountDetailController($scope, $state, $ionicModal, LastFlagUser, AppAuth){
    AppAuth.ensureHasCurrentUser(LastFlagUser);
    $scope.hasAccessToken = (AppAuth.accessToken != null);
    $scope.currentAccount = null;

    for(var i = 0; i < AppAuth.currentUser.accounts.length; i++){
        if(AppAuth.currentUser.accounts[i].id == $state.params.id){
            $scope.currentAccount = AppAuth.currentUser.accounts[i];
            break;
        }
    }

    $scope.logout = function(){
        LastFlagUser.logout(null, function(err){console.log('Logged out');});
        AppAuth.clearCredentials();
        $state.go('home');
    };

    $scope.sendAsset = function(){
        $scope.sendCurrencyModal.show();
    };



    $ionicModal.fromTemplateUrl('partials/sendCurrency.html', {
        scope: $scope,
        animation: 'slide-in-up'
    }).then(function(modal) {
        $scope.sendCurrencyModal = modal;
    });

    $scope.closeAllModals = function() {
        $scope.sendCurrencyModal.hide();
    };
    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
        $scope.sendCurrencyModal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() { });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() { });



}






angular.module('lastFlagApp.controllers', ['lbServices', 'lastFlagApp.services'])
  .controller('HomeController', ['$scope', HomeController])
  .controller('LoginController', ['$scope', '$state', 'LastFlagUser', 'AppAuth', LoginController])
  .controller('RegistrationController', ['$scope', '$state', 'AssetService', 'Currency', 'LastFlagUser', RegistrationController])
  .controller('AccountsSummaryController', ['$scope', '$state', '$ionicModal', 'LastFlagUser', 'Account', 'Currency', 'AppAuth', 'AssetService', AccountsSummaryController])
  .controller('AccountDetailController', ['$scope', '$state', '$ionicModal', 'LastFlagUser', 'AppAuth', AccountDetailController]);
