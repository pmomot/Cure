'use strict';

var MyApp = angular.module('MyApp', ['ui.router', 'isteven-multi-select']) // eslint-disable-line no-unused-vars
    .config(['$stateProvider', '$urlRouterProvider', '$httpProvider',
    function ($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../views/pages/home.html',
                controller: 'MainController',
                data: {
                    claimType: null
                }
            })
            .state('home.login', {
                url: '/login',
                templateUrl: '../views/pages/login.html',
                controller: 'MainController',
                data: {
                    claimType: null
                }
            })
            .state('home.changePass', {
                url: '/changePass',
                templateUrl: '../views/pages/changePass.html',
                controller: 'MainController',
                data: {
                    claimType: null
                }
            })
            .state('home.purchases', {
                url: '/purchases',
                templateUrl: '../views/pages/claim.html',
                data: {
                    claimType: 'Purchase',
                    tags: ['Products', 'Bakery', 'Officeware']
                },
                resolve: {
                    hrs: function () {
                        return [];
                    }
                },
                controller: 'ClaimsController'
            })
            .state('home.propositions', {
                url: '/propositions',
                templateUrl: '../views/pages/claim.html',
                data: {
                    claimType: 'Proposition',
                    tags: ['Equipment', 'Furniture', 'Other']
                },
                resolve: {
                    hrs: function () {
                        return [];
                    }
                },
                controller: 'ClaimsController'
            })
            .state('home.chemicals', {
                url: '/chemicals',
                templateUrl: '../views/pages/claim.html',
                data: {
                    claimType: 'Chemical'
                },
                resolve: {
                    hrs: function () {
                        return [];
                    }
                },
                controller: 'ClaimsController'
            })
            .state('home.discussions', {
                url: '/discussions/:id',
                templateUrl: '../views/pages/claim.html',
                data: {
                    claimType: 'Discussion'
                },
                resolve: {
                    hrs: function (ClaimService) {
                        return ClaimService.getHrs().then(function (data) {
                            return data;
                        });
                    }
                },
                controller: 'ClaimsController'
            });

        $urlRouterProvider.otherwise('/home/purchases');

        $httpProvider.interceptors.push('httpInterceptor');

    }])

    .run(['$rootScope', '$state', '$window', 'Auth', 'AuthToken', function ($rootScope, $state, $window, Auth, AuthToken) {
        $rootScope.$on('$stateChangeStart', function (e, toState, toParams) {
            var toPage = toState.name,
                isLoggedIn = Auth.isLoggedIn();

            Auth.getUser(AuthToken.getToken())
                .then(function (data) {
                    $rootScope.user = data.data;
                }
            );

            if (isLoggedIn) {
                if (toPage === 'home' || toPage === 'home.login') {
                    $state.go('home.purchases');
                } else if (toPage === 'home.changePass') {
                    $rootScope.currentClaimType = null;
                }

            } else if (toPage !== 'home.login') {
                e.preventDefault();

                if (toParams.id) {
                    Auth.discussionId = toParams.id;
                }

                $state.go('home.login');
            }

        });
    }
    ]);
