MyApp.factory('Auth', ['$http', '$q', 'AuthToken', 'AuthInterceptor', function ($http, $q, AuthToken, AuthInterceptor) { // eslint-disable-line no-undef
    'use strict';

    var authFactory = {};

    authFactory.login = function (email, password) {

        return $http.post('/api/login', {
            email: email,
            password: password
        })
            .success(function (data) {
                AuthToken.setToken(data.token);
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    authFactory.changePass = function (currentPass, newPass, email) {
        var token = AuthToken.getToken();

        return $http({url: '/api/changePass', method: 'POST', headers: {'x-access-token': token}, data: {
            currentPass: currentPass,
            newPass: newPass,
            email: email
        }})
            .success(function (data) {
                AuthToken.setToken(data.token);
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
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
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    authFactory.logout = function () {
        AuthToken.setToken();
    };

    authFactory.isLoggedIn = function () {
        return Boolean(AuthToken.getToken());
    };

    authFactory.getUser = function (token) {
        if (AuthToken.getToken()) {
            return $http({url: '/api/me', method: 'GET', headers: {'x-access-token': token}})
                .success(function (data) {
                    return data;
                }).error(function (data) {
                    AuthInterceptor.responceError(data);
                });
        }

        return $q.reject({message: 'User is not logged in'});
    };

    return authFactory;
}]);

MyApp.factory('AuthToken', ['$window', function ($window) { // eslint-disable-line no-undef
    'use strict';

    var authTokenFactory = {};

    authTokenFactory.getToken = function () {

        return $window.localStorage.getItem('token');
    };

    authTokenFactory.setToken = function (token) {
        if (token) {
            $window.localStorage.setItem('token', token);
        } else {
            $window.localStorage.removeItem('token');
        }
    };

    return authTokenFactory;
}]);

MyApp.factory('AuthInterceptor', ['$q', '$state', 'AuthToken', function ($q, $state, AuthToken) { // eslint-disable-line no-undef
    'use strict';

    var interceptorFactory = {};

    interceptorFactory.request = function (config) {

        var token = AuthToken.getToken();

        if (token) {
            config.headers['x-access-token'] = token;
        }

        return config;
    };

    interceptorFactory.responceError = function (response) {

        if (response.status === 403) {
            AuthToken.setToken();
            $state.go('home.login');
        }

        return $q.reject(response);
    };

    return interceptorFactory;
}]);
