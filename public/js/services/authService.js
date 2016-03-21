'use strict';

(function () {
    angular
        .module('ClaimPortal.Services')
        .factory('authService', authService);

    authService.$inject = ['$http', '$q', '$window'];

    /**
     * Authorization processing service
     * */
    function authService ($http, $q, $window) {

        var userInfo = {};

        if (!$window.localStorage.getItem('token')) {
            $window.localStorage.setItem('token', '');
        }

        /**
         * Log in user to portal
         * */
        function login (email, password) {

            return $http.post('/api/user/log-in', {
                email: email,
                password: password
            })
                .success(function (data) {
                    $window.localStorage.setItem('token', data.token);
                    userInfo = data.user;

                    return data;
                });
        }

        /**
         * Log out of portal
         * */
        function logout () {
            $window.localStorage.setItem('token', '');
        }

        /**
         * Create new user
         * */
        function signUp (requestData) {

            return $http.post('/api/user', requestData)
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Get user data form api
         * */
        function loadUserInfo () {
            if ($window.localStorage.getItem('token') === '') {
                return $q.reject({message: 'User is not logged in'});
            } else {
                return $http({url: '/api/user', method: 'GET'})
                    .success(function (data) {
                        userInfo = data;
                    });
            }
        }

        /**
        * Change user password
        * */
        function changePass (requestData) {
            requestData.email = userInfo.email;

            return $http({url: '/api/user/change-pass', method: 'POST', data: requestData})
                .success(function (data) {
                    $window.localStorage.setItem('token', data.token);
                    return data;
                });
        }

        // service calls
        /**
         * Get current account info
         * */
        function getUserInfo () {
            return userInfo;
        }

        /**
         * Verify that service has user info saved
         * */
        function hasUserInfo () {
            return Object.keys(userInfo).length > 0;
        }

        return {
            // api calls
            login: login,
            logout: logout,
            signUp: signUp,
            loadUserInfo: loadUserInfo,
            changePass: changePass,

            // service calls
            getUserInfo: getUserInfo,
            hasUserInfo: hasUserInfo

        };
    }

})();
