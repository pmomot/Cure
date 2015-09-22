angular.module('appRoutes', ['ngRoute'])

.config(function($routeProvider, $locationProvider){

        $routeProvider
            .when('/',{
                templateUrl: '../views/pages/home.html'
            })
            .when('/signupSuccess',{
                templateUrl: '../views/pages/signupSuccess.html'
            })
            .when('/logout',{
                templateUrl: '../views/pages/home.html'
            })
    });