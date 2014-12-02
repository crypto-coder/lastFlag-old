'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('lastFlagApp.services', ['lbServices'])
    .value('version', '0.1')
    .factory('AppAuth', function() {
        return {
            currentUser: null,
            currentUserID: 0,

            //TODO: figure out how to do this properly
            accessToken: null,


            clearCredentials: function(){
                this.currentUser = null;
                this.currentUserID = 0;
                this.accessToken = null;
            },

            reloadCurrentUser: function(LastFlagUser, next){
                if(this.currentUserID == 0){this.currentUserID = this.currentUser.id;}
                this.currentUser = LastFlagUser.findOne(
                    {filter: {
                        where: {"id": this.currentUserID},
                        include: {"accounts": ["currency", {"sendTransactions": "toAccount"}, {"receiveTransactions": "fromAccount"}]}
                    }},
                    function(retrievedUser) {
                        if(next){ next(); }
                    },
                    function(err) {
                        console.log('Failed to reload the current user');
                    });
            },

            // Note: we can't make the User a dependency of AppAuth
            // because that would create a circular dependency
            // AppAuth <- $http <- $resource <- LoopBackResource <- User <- AppAuth
            ensureHasCurrentUser: function(LastFlagUser, next) {
                if (this.currentUser) {
                    this.currentUserID = this.currentUser.id;
                    console.log('Using cached current user.');
                } else {
                    console.log('Fetching current user from the server.');
                    this.currentUser = LastFlagUser.getCurrent(
                        function(retrievedUser, headers) {
                            if(next){
                                next();
                            }
                        },
                        function(response) {
                            console.log('LastFlagUser.getCurrent() err', response);
                        });
                }
            }
        }
    })
    .factory('CurrencyService', function(){
        return {
            allCurrencies: null,

            getAllCurrencies: function(Currency){
                if(this.allCurrencies == null){
                    this.allCurrencies = Currency.find(
                                                    function(assets, responseHeaders){
                                                        console.log("SUCCESS - Retrieved current Asset list");},
                                                    function(err){
                                                        console.log("ERROR - Failed to retrieve the Asset list");
                                                    });
                }
                return this.allCurrencies;
            }
        }
    });
