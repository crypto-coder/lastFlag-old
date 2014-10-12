'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('lastFlagApp.services', ['lbServices'])
    .value('version', '0.1')
    .factory('AppAuth', function() {
        return {
            currentUser: null,

            //TODO: figure out how to do this properly
            accessToken: null,


            clearCredentials: function(){
                this.currentUser = null;
                this.accessToken = null;
            },

            // Note: we can't make the User a dependency of AppAuth
            // because that would create a circular dependency
            // AppAuth <- $http <- $resource <- LoopBackResource <- User <- AppAuth
            ensureHasCurrentUser: function(LastFlagUser) {
                if (this.currentUser) {
                    console.log('Using cached current user.');
                } else {
                    console.log('Fetching current user from the server.');
                    this.currentUser = LastFlagUser.getCurrent(function() {
                        // success
                    }, function(response) {
                        console.log('LastFlagUser.getCurrent() err', arguments);
                    });
                }
            }
        }
    })
    .factory('AssetService', function(){
        return {
            currentAssetList: null,

            getCurrentAssetList: function(Currency){
                if(this.currentAssetList == null){
                    this.currentAssetList = Currency.find(
                                                    function(assets, responseHeaders){
                                                        console.log("SUCCESS - Retrieved current Asset list");},
                                                    function(err){
                                                        console.log("ERROR - Failed to retrieve the Asset list");
                                                    });
                }
                return this.currentAssetList;
            }
        }
    });
