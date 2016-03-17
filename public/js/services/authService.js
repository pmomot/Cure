'use strict';

MyApp.factory('Auth', ['$http', '$q', 'AuthToken', function ($http, $q, AuthToken) { // eslint-disable-line no-undef
    var authFactory = {};

    authFactory.login = function (email, password) {

        return $http.post('/api/login', {
            email: email,
            password: password
        })
            .success(function (data) {
                AuthToken.setToken(data.token);
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
                AuthToken.setToken(data.token);
                return data;
            });
    };

    authFactory.signUp = function (userGroup, firstName, lastName, email, password) {

        return $http.post('/api/signup', {
            userGroup: userGroup,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        })
            .success(function (data) {
                return data;
            });
    };

    authFactory.logout = function () {
        AuthToken.setToken();
    };

    authFactory.isLoggedIn = function () {
        return Boolean(AuthToken.getToken());
    };

    authFactory.getUser = function () {
        if (AuthToken.getToken()) {
            return $http({url: '/api/me', method: 'GET'})
                .success(function (data) {
                    return data;
                });
        }

        return $q.reject({message: 'User is not logged in'});
    };

    return authFactory;
}]);

