/**
 * Created by petermomot on 3/17/16.
 */
'use strict';

MyApp.factory('httpInterceptor', ['$rootScope', '$q', '$injector', 'AuthToken', // eslint-disable-line no-undef
    function ($rootScope, $q, $injector, AuthToken) {

        /**
         * Fires every time response is coming
         * */
        function responseCallback () {
            $rootScope.processing = false;

            // TODO CV add message popup
        }

        return {
            request: function (config) {
                var token = AuthToken.getToken();

                if (token) {
                    config.headers['x-access-token'] = token;
                }

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
                    AuthToken.setToken();
                    // hack to resolve circular dependency
                    $injector.get('$state').go('home.login');
                }

                return $q.reject(rejection);
            }
        };
    }]
);
