/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .config(routeHandler);

    routeHandler.$inject = ['$routeProvider'];

    /**
     * All app routes
     * */
    function routeHandler ($routeProvider) {

        $routeProvider
            .when('/user/sign-up', {
                templateUrl: 'js/routes/sign-up/signUpView.html',
                controller: 'SignUpController',
                controllerAs: 'vm'
            })
            .when('/user/log-in', {
                templateUrl: 'js/routes/log-in/logInView.html',
                controller: 'LogInController',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: '/'
            });
    }
})();
