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
            .when('/user/change-pass', {
                templateUrl: 'js/routes/change-pass/changePassView.html',
                controller: 'ChangePassController',
                controllerAs: 'vm'
            })
            .when('/claims/:claimType', {
                templateUrl: 'js/routes/claims/claimsView.html',
                controller: 'ClaimsController',
                controllerAs: 'vm'
            })
            .when('/discussions', {
                templateUrl: 'js/routes/discussions/discussionsView.html',
                controller: 'DiscussionsController',
                controllerAs: 'vm'
            })
            .otherwise({
                redirectTo: '/claims/purchases'
            });
    }
})();
