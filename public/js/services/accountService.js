'use strict';

(function () {
    angular
        .module('ClaimPortal.Services')
        .factory('accountService', accountService);

    accountService.$inject = ['$q', '$window', 'accountRepository', 'toastr'];

    /**
     * Accounts processing service
     * */
    function accountService ($q, $window, accountRepository, toastr) {

        var userInfo = {},
            hrs = [];

        if (!$window.localStorage.getItem('token')) {
            $window.localStorage.setItem('token', '');
        }

        /**
         * Log in user to portal
         * */
        function login (email, password) {
            var deferred = $q.defer();

            accountRepository.login({
                email: email,
                password: password
            })
                .then(function (data) {
                    $window.localStorage.setItem('token', data.token);

                    if (data.success) {
                        data.user.fullName = data.user.firstName + ' ' + data.user.lastName;
                        userInfo = data.user;

                        toastr.success(data.message);
                        deferred.resolve(data);
                    } else {
                        toastr.error(data.message);
                        deferred.reject(data);
                    }
                })
                .catch(function (error) {
                    toastr.error(error.message);
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
         * Create new user
         * */
        function signUp (requestData) {
            var deferred = $q.defer();

            accountRepository.signUp(requestData)
                .then(function (data) {
                    if (data.success) {
                        toastr.success(data.message);
                        deferred.resolve(data);
                    } else {
                        toastr.error(data.message);
                        deferred.reject(data);
                    }
                })
                .catch(function (error) {
                    toastr.error(error.message);
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
         * Get user data form api
         * */
        function loadUserInfo () {
            var deferred = $q.defer();

            if ($window.localStorage.getItem('token') === '') {
                toastr.error('User is not logged in');
                return $q.reject({});
            }

            accountRepository.loadUserInfo()
                .then(function (data) {
                    data.fullName = data.firstName + ' ' + data.lastName;
                    userInfo = data;
                    deferred.resolve(data);
                })
                .catch(function (error) {
                    toastr.error(error.message);
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
        * Change user password
        * */
        function changePass (requestData) {
            var deferred = $q.defer();

            requestData.email = userInfo.email;

            accountRepository.changePass(requestData)
                .then(function (data) {
                    if (data.success) {
                        $window.localStorage.setItem('token', data.token);

                        toastr.success(data.message);
                        deferred.resolve(data);
                    } else {
                        toastr.error(data.message);
                        deferred.reject(data);
                    }
                })
                .catch(function (error) {
                    toastr.error(error.message);
                    deferred.reject();
                });

            return deferred.promise;
        }

        /**
        * Get all HRs from server
        * */
        function fetchHrs () {
            var deferred = $q.defer();

            accountRepository.fetchHrs({userGroup: 'HR'})
                .then(function (data) {
                    hrs = data;
                    deferred.resolve(data);
                })
                .catch(function (error) {
                    toastr.error(error.message);
                    deferred.reject();
                });

            return deferred.promise;
        }

        // service calls
        /**
         * Log out of portal
         * */
        function logout () {
            $window.localStorage.setItem('token', '');
        }

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

        /**
         * Get hrs list
         * */
        function getHrs () {
            return hrs;
        }

        return {
            // api calls
            login: login,
            signUp: signUp,
            loadUserInfo: loadUserInfo,
            changePass: changePass,
            fetchHrs: fetchHrs,

            // service calls
            logout: logout,
            getUserInfo: getUserInfo,
            hasUserInfo: hasUserInfo,
            getHrs: getHrs
        };
    }

})();
