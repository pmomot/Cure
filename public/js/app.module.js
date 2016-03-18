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
            // 'ClaimPortal.Repositories',
            // 'ClaimPortal.Directives',
            // 'ClaimPortal.Filters',
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
                preventOpenDuplicates: false,
                timeOut: 3000
            });
        })
        .run(['$rootScope', '$location', function ($rootScope, $location) {
            // prevent loading any session required page without necessary token
            //$rootScope.$on('$routeChangeStart', function (event, next) {
            //    if (!authTokenService.hasToken()) {
            //        if (next.templateUrl !== 'app/routes/login/loginView.html' &&
            //            next.templateUrl !== 'app/routes/signup/signupView.html' &&
            //            next.templateUrl !== 'app/routes/changePasswordView.html') {
            //
            //            $location.path('/login');
            //        }
            //    }
            //
            //});
        }]);

    angular.module('ClaimPortal.Services', []);
    // angular.module('ClaimPortal.Repositories', []);
    // angular.module('ClaimPortal.Directives', []);
    // angular.module('ClaimPortal.Filters', []);
    angular.module('ClaimPortal.Constants', []);

})();
