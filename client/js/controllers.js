'use strict';

/* Controllers */
function HomeController($scope){}

function LoginController($scope, LastFlagUser){
    $scope.credentials = {};

    $scope.login = function(){
            LastFlagUser.login($scope.credentials,
                function(accessToken){
                    console.log('Success');
                    $scope.accessToken = accessToken.id;
                    console.log(user.id);
                    console.log(accessToken.userId);
                },
                function(err){
                    console.log('Error');
                    $scope.registerError = err;
                    for(var i in err){console.log(i+' = '+err[i]);}
                });
    }
}

function RegistrationController($scope, $state, LastFlagUser){
    $scope.registration = {};

    $scope.register = function(){

        LastFlagUser.create({username: $scope.registration.username, email: $scope.registration.email, password:$scope.registration.password},
                                function(user){
                                    console.log('SUCCESS - Created a new User - User ID = ' + user.id);
                                    $scope.user = user;
                                    //for(var i in user){console.log(i+' = '+user[i]);}

                                    var credentials = {"username": $scope.registration.username,
                                                        "password": $scope.registration.password,
                                                        "ttl": "1209600000"};

                                    LastFlagUser.login(credentials,
                                        function(accessToken){
                                            console.log('SUCCESS - Login - Access Token = ' + accessToken.id);
                                            $scope.accessToken = accessToken.id;



                                        },
                                        function(err){
                                            console.log('ERROR - Login Failure');
                                            $scope.registerError = err;
                                            for(var i in err){console.log(i+' = '+err[i]);}
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



angular.module('lastFlagApp.controllers', [])
  .controller('HomeController', ['$scope', HomeController])
  .controller('LoginController', ['$scope', 'LastFlagUser', LoginController])
  .controller('RegistrationController', ['$scope', '$state', 'LastFlagUser', RegistrationController])
  .controller('SummaryController', ['$scope', function($scope) {

  }]);
