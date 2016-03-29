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
        .run(['$rootScope', '$location', '$window', 'accountService', '$anchorScroll', function ($rootScope, $location, $window, accountService, $anchorScroll) {

            // prevent loading any session required page without necessary token
            $rootScope.$on('$routeChangeStart', function (event, next) {
                var url = $location.url();

                if ($window.localStorage.getItem('token') === '') {
                    if (next.templateUrl !== 'js/routes/log-in/logInView.html' &&
                        next.templateUrl !== 'js/routes/sign-up/signUpView.html') {

                        $location.path('/user/log-in');
                    }
                } else if (!accountService.hasUserInfo()) {
                    accountService.loadUserInfo();
                }

                if (url.indexOf('?discussion-id=') !== -1) {
                    if ($window.localStorage.getItem('token') !== '') { // user logged in
                        $location.url(url.split('?discussion-id=')[0]);
                        $location.hash(url.split('?discussion-id=')[1]);
                    }
                }

            });

            $anchorScroll.yOffset = 40;
        }]);

    angular.module('ClaimPortal.Services', []);
    angular.module('ClaimPortal.Repositories', []);
    angular.module('ClaimPortal.Directives', []);
    angular.module('ClaimPortal.Constants', []);

})();
