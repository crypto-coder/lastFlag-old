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

                    AppAuth.currentUser = LastFlagUser.findOne(
                        {id: accessToken.userId, filter: {include: "accounts"}},
                        function(retrievedUser) {
                            console.log('Success retrieving the accounts');

                            //AppAuth.ensureHasCurrentUser(LastFlagUser);

                            $state.go('summary');
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

                                            AppAuth.currentUser = LastFlagUser.findOne(
                                                {id: accessToken.userId, filter: {include: "accounts"}},
                                                function(retrievedUser) {
                                                    console.log('Success retrieving the accounts');
                                                    $state.go('summary');
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


function SummaryController($scope, $state, LastFlagUser, AppAuth, Account){
    AppAuth.ensureHasCurrentUser(LastFlagUser);
    $scope.hasAccessToken = (AppAuth.accessToken != null);


    $scope.logout = function(){

        LastFlagUser.logout(null,
            function(err){
                console.log('Logged out');
            }
        );
        AppAuth.clearCredentials();

        $state.go('home');
    };



    $scope.createdAssets = [];
    $scope.receivedAssets = [];
    for(var i = 0; i < AppAuth.currentUser.accounts.length; i++){
        if(AppAuth.currentUser.accounts[i].accountType == 'I'){
            $scope.createdAssets[$scope.createdAssets.length] = AppAuth.currentUser.accounts[i];
        }else{
            $scope.receivedAssets[$scope.receivedAssets.length] = AppAuth.currentUser.accounts[i];
        }
    }

}




angular.module('lastFlagApp.controllers', ['lbServices', 'lastFlagApp.services'])
  .controller('HomeController', ['$scope', HomeController])
  .controller('LoginController', ['$scope', '$state', 'LastFlagUser', 'AppAuth', LoginController])
  .controller('RegistrationController', ['$scope', '$state', 'AssetService', 'Currency', 'LastFlagUser', RegistrationController])
  .controller('SummaryController', ['$scope', '$state', 'LastFlagUser', 'AppAuth', 'Account', SummaryController]);
