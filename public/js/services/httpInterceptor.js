/**
 * Created by petermomot on 3/17/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Services')
        .factory('httpInterceptor', httpInterceptor);

    httpInterceptor.$inject = ['$rootScope', '$q', '$window'];

    /**
     * Service intercepts all api requests and responses
     * */
    function httpInterceptor ($rootScope, $q, $window) {

        /**
         * Fires every time response is coming
         * */
        function responseCallback () {
            $rootScope.processing = false;
        }

        return {
            request: function (config) {
                config.headers['x-access-token'] = $window.localStorage.getItem('token');
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
                    $window.localStorage.setItem('token', '');
                }

                return $q.reject(rejection);
            }
        };
    }
})();
