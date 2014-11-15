'use strict';


// Declare app level module which depends on filters, and services
angular.module('lastFlagApp', [
  'ionic',
  'ng',
  'ngSanitize',
  'ngAnimate',
  'lastFlagApp.filters',
  'lastFlagApp.directives',
  'lastFlagApp.controllers',
  'lastFlagApp.services',
  'ui.router',
  'lbServices',
  'ng-currency'
]).
config(['$stateProvider', '$urlRouterProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $httpProvider){

    $stateProvider
        .state('home', { url: '/', templateUrl: 'partials/home.html', controller: HomeController})
        .state('login', { url: '/login', templateUrl: 'partials/login.html', controller: LoginController })
        .state('register', { url: '/register', templateUrl: 'partials/register.html', controller: RegistrationController })
        .state('accounts', { url: '/accounts', templateUrl: 'partials/accounts.html', controller: AccountsSummaryController })
        .state('accountDetail', { url: '/accounts/{id:[0-9]{1,8}}', templateUrl: 'partials/detail.html', controller: AccountDetailController });

    $urlRouterProvider.otherwise('/');





    /* Intercept http errors */
    var interceptor = function ($rootScope, $q, $location) {
        function success(response) {
            return response;
        }
        function error(response) {
            var status = response.status;
            var config = response.config;
            var method = config.method;
            var url = config.url;
            if (status == 401) {
                $location.path( "/login" );
            } else {
                $rootScope.error = method + " on " + url + " failed with status " + status;
            }
            return $q.reject(response);
        }
        return function (promise) {
            return promise.then(success, error);
        };
    };
    $httpProvider.interceptors.push(interceptor);
    $httpProvider.defaults.headers.common['Content-Type'] = 'application/json';
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];


}])
.run(['$rootScope', '$state', '$stateParams', '$ionicLoading', '$document', 'AppAuth', function($rootScope, $state, $stateParams, $ionicLoading, $document, AppAuth ){
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;

        $rootScope.$on('$routeChangeStart', function(event, next, current){
           console.log('AppAuth.currentUser', AppAuth.currentUser);
           console.log('$location.path()', $location.path());
        });
}]);



/*
config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/', {templateUrl: 'partials/home.html', controller: 'HomeController'});
  $routeProvider.when('/login', {templateUrl: 'partials/login.html', controller: 'LoginController'});
  $routeProvider.when('/register', {templateUrl: 'partials/register.html', controller: 'RegistrationController'});
  $routeProvider.otherwise({redirectTo: '/'});
}]);
*/
