/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {
    angular.module('ClaimPortal',
        [
            'ngRoute',
            'toastr',
            'isteven-multi-select',
            'ClaimPortal.Services',
            'ClaimPortal.Repositories',
            'ClaimPortal.Directives',
            'ClaimPortal.Constants'
        ])
        .config(['$httpProvider', function ($httpProvider) {
            $httpProvider.interceptors.push('httpInterceptor');
        }])
        .config(function (toastrConfig) {
            angular.extend(toastrConfig, {
                maxOpened: 5,
                newestOnTop: true,
                preventDuplicates: false,
                preventOpenDuplicates: true,
                allowHtml: true,
                timeOut: 3000
            });
        })
        .run(['$rootScope', '$location', '$window', 'accountService', function ($rootScope, $location, $window, accountService) {
            // prevent loading any session required page without necessary token
            $rootScope.$on('$routeChangeStart', function (event, next) {
                if ($window.localStorage.getItem('token') === '') {
                    if (next.templateUrl !== 'js/routes/log-in/logInView.html' &&
                        next.templateUrl !== 'js/routes/sign-up/signUpView.html') {

                        $location.path('/user/log-in');
                    }
                } else if (!accountService.hasUserInfo()) {
                    accountService.loadUserInfo();
                }

            });
        }]);

    angular.module('ClaimPortal.Services', []);
    angular.module('ClaimPortal.Repositories', []);
    angular.module('ClaimPortal.Directives', []);
    angular.module('ClaimPortal.Constants', []);

})();
