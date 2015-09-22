angular.module('authService', [])

.factory('Auth', function($http, $q, AuthToken){

        var authFactory = {};

        authFactory.login = function(email, password){

            return $http.post('/api/login', {
                email: email,
                password: password
            })
                .success(function(data){
                    AuthToken.setToken(data.token);
                    return data;
            })
        };

        authFactory.signUp = function(firstName, lastName, email, password){

            return $http.post('/api/signup', {
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password
            })
                .success(function(data){
                    return data;
                })
        };

        authFactory.logout = function(){

            AuthToken.setToken();
        };

        authFactory.isLoggedIn = function(){
            if(AuthToken.getToken()) return true;

            return false;
        };

        authFactory.getUser = function(token){
            if(AuthToken.getToken()){
                return $http({url: '/api/me', method: 'GET', headers:{'x-access-token': token}})
            };

            return $q.reject({message: 'User is not logged in'});
        };

        return authFactory;
    })

.factory('AuthToken', function($window){

        var authTokenFactory = {};

        authTokenFactory.getToken = function(){

            return $window.localStorage.getItem('token');
        };

        authTokenFactory.setToken = function(token) {
            if (token) {
                $window.localStorage.setItem('token', token);
            }else{
                $window.localStorage.removeItem('token');
            }
        };

        return authTokenFactory;
    })

.factory('AuthInterceptor', function($q, $location, AuthToken){

        var interceptorFactory = {};

        interceptorFactory.request = function(config){

            var token = AuthToken.getToken();

            if(token) config.headers['x-access-token'] = token;

            return config
        };

        interceptorFactory.responceError = function(response){

            if(response.status == 403) $location.path('/login');

            return $q.reject(response)
        };

        return interceptorFactory;
    });