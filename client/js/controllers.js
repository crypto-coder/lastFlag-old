'use strict';

/* Controllers */
function HomeController($scope){}

function LoginController($scope, $state, LastFlagUser){
    $scope.credentials = {};

    $scope.login = function(){
            LastFlagUser.login($scope.credentials,
                function(accessToken){
                    console.log('SUCCESS - Login - Access Token = ' + accessToken.id);
                    $scope.accessToken = accessToken.id;

                    $state.go('summary');
                },
                function(err){
                    console.log('ERROR - Login Failure');
                    $scope.loginError = err.data.error;
                    for(var i in err.data.error){console.log(i+' = '+err.data.error[i]);}
                });
    }
}

function RegistrationController($scope, $state, AssetService, Currency, LastFlagUser){
    $scope.registration = {};
    //$scope.assets = [{name:'test', id:1, issued:100}, {name:'test2', id:2, issued:1000}];

    //TODO: This is silly.  No need to provide Currency type...
    $scope.assets = AssetService.getCurrentAssetList(Currency);


    $scope.register = function(){

        var registrationDetails = {username: $scope.registration.username,
                              email: $scope.registration.username + '@test.com',
                              password: $scope.registration.password};

        LastFlagUser.create(registrationDetails,
                                function(user){
                                    console.log('SUCCESS - Created a new User - User ID = ' + user.id);
                                    $scope.user = user;


                                    //Create the Account using the requested currency

                                    //for(var i in user){console.log(i+' = '+user[i]);}

                                    var credentials = {"username": $scope.registration.username,
                                                        "password": $scope.registration.password,
                                                        "ttl": "1209600000"};

                                    LastFlagUser.login(credentials,
                                        function(accessToken){
                                            console.log('SUCCESS - Login - Access Token = ' + accessToken.id);
                                            $scope.accessToken = accessToken.id;

                                            $state.go('summary');
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


    //var newUser = LastFlagUser.create({email: 'test@user.com', password: 'password'},
    //    function(err, user){
    //        console.log(err);
    //        console.log(user.id);
    //        console.log(user.username);
    //    });
    //newUser.$save(
    //    function(){console.log('Success');},
    //    function(err){console.log('Error='+err);}
    //);
}


function SummaryController($scope, LastFlagUser, AppAuth){
    AppAuth.ensureHasCurrentUser(LastFlagUser);
    $scope.currentUser = AppAuth.currentUser;

}




angular.module('lastFlagApp.controllers', ['lbServices', 'lastFlagApp.services'])
  .controller('HomeController', ['$scope', HomeController])
  .controller('LoginController', ['$scope', '$state', 'LastFlagUser', LoginController])
  .controller('RegistrationController', ['$scope', '$state', 'AssetService', 'Currency', 'LastFlagUser', RegistrationController])
  .controller('SummaryController', ['$scope', 'LastFlagUser', 'AppAuth', SummaryController]);
