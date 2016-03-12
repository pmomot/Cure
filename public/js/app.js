'use strict';

var MyApp = angular.module('MyApp', ['ui.router', 'isteven-multi-select']) // eslint-disable-line no-unused-vars
    .config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state('home', {
                url: '/home',
                templateUrl: '../views/pages/home.html',
                controller: 'MainController',
                data: {
                    claimType: undefined
                }
            })
            .state('home.login', {
                url: '/login',
                templateUrl: '../views/pages/login.html',
                controller: 'MainController',
                data: {
                    claimType: undefined
                }
            })
            .state('home.changePass', {
                url: '/changePass',
                templateUrl: '../views/pages/changePass.html',
                controller: 'MainController',
                data: {
                    claimType: undefined
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

    }])

    .run(['$rootScope', '$state', '$window', 'Auth', function ($rootScope, $state, $window, Auth) {
        $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
            var toPage;

            Auth.getUser($window.localStorage.token)
                .then(function (data) {
                    $rootScope.user = data.data;
                }
            );
            // TODO CV simplify ifs
            toPage = toState.name;
            if ((toPage !== 'home.login' && !Auth.isLoggedIn()) || (toPage === 'home.changePass' && !Auth.isLoggedIn())) {
                event.preventDefault();
                $state.go('home.login');
            }
            if (toPage !== 'home.login' && !Auth.isLoggedIn() && toParams.id) {
                Auth.discussionId = toParams.id;
                event.preventDefault();
                $state.go('home.login');
            }
            if ((toPage === 'home') || (toPage === 'home.login' && Auth.isLoggedIn())) {
                event.preventDefault();
                $state.go('home.purchases');
            }
            if (toPage === 'home.changePass') {
                $rootScope.currentClaimType = undefined;
            }
        });
    }
    ]);
