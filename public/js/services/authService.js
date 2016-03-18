'use strict';

angular.module('ClaimPortal.Services').factory('authService', ['$http', '$q', 'authTokenService', function ($http, $q, authTokenService) {
    // TODO CV refactor this

    var authFactory = {};

    authFactory.login = function (email, password) {

        return $http.post('/api/login', {
            email: email,
            password: password
        })
            .success(function (data) {
                authTokenService.setToken(data.token);

                return data;
            });
    };

    authFactory.changePass = function (currentPass, newPass, email) {
        return $http({url: '/api/changePassword', method: 'POST', data: {
            currentPass: currentPass,
            newPass: newPass,
            email: email
        }})
            .success(function (data) {
                authTokenService.setToken(data.token);
                return data;
            });
    };

    authFactory.signUp = function (requestData) {

        return $http.post('/api/user', requestData)
            .success(function (data) {
                return data;
            });
    };

    authFactory.logout = function () {
        authTokenService.clearToken();
    };

    authFactory.getUser = function () {
        if (authTokenService.getToken()) {
            return $http({url: '/api/user', method: 'GET'})
                .success(function (data) {
                    return data;
                });
        }

        return $q.reject({message: 'User is not logged in'});
    };

    return authFactory;
}]);

