/**
 * Created by petermomot on 3/29/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Repositories')
        .factory('accountRepository', accountRepository);

    accountRepository.$inject = ['$http', '$q'];

    /**
     * Account Repository
     * */
    function accountRepository ($http, $q) {

        /**
         * Log in user to portal
         * */
        function login (params) {
            var deferred = $q.defer();

            $http.post('/api/user/log-in', params)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Create new user
         * */
        function signUp (params) {
            var deferred = $q.defer();

            $http.post('/api/user', params)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Get user data form api
         * */
        function loadUserInfo () {
            var deferred = $q.defer();

            $http.get('/api/user')
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Change user password
         * */
        function changePass (params) {
            var deferred = $q.defer();

            $http.post('/api/user/change-pass', params)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Get all HRs from server
         * */
        function fetchHrs (params) {
            var deferred = $q.defer();

            $http.get('/api/users', {params: params})
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        return {
            login: login,
            signUp: signUp,
            loadUserInfo: loadUserInfo,
            changePass: changePass,
            fetchHrs: fetchHrs
        };
    }

})();
