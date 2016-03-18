/**
 * Created by petermomot on 3/17/16.
 */
'use strict';

angular.module('ClaimPortal.Services').factory('httpInterceptor', ['$rootScope', '$q', '$injector', 'authTokenService',
    function ($rootScope, $q, $injector, authTokenService) {

        /**
         * Fires every time response is coming
         * */
        function responseCallback () {
            $rootScope.processing = false;

            // TODO CV add message popup
        }

        return {
            request: function (config) {
                config.headers['x-access-token'] = authTokenService.getToken();
                $rootScope.processing = true;

                return config;
            },

            response: function (response) {
                responseCallback();

                return response;
            },

            responseError: function (rejection) {
                responseCallback();

                if (rejection.status === 403) {
                    authTokenService.clearToken();
                    // hack to resolve circular dependency
                    //$injector.get('$state').go('home.login');
                }

                return $q.reject(rejection);
            }
        };
    }]
);
