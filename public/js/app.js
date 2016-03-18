'use strict';

(function () {
    // TODO CV ui.router -> ngRoute

    angular.module('ClaimPortal', ['ui.router', 'isteven-multi-select', 'ClaimPortal.Services', 'ClaimPortal.Constants'])
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

        .run(['$rootScope', '$state', '$window', 'authService', 'authTokenService', function ($rootScope, $state, $window, authService, authTokenService) {
            $rootScope.$on('$stateChangeStart', function (e, toState, toParams) {
                var toPage = toState.name;

                authService.getUser(authTokenService.getToken()) // TODO CV search for getUser
                    .then(function (data) {
                        $rootScope.user = data.data;
                    }
                );

                if (authTokenService.hasToken()) { // user is logged in
                    if (toPage === 'home' || toPage === 'home.login') {
                        $state.go('home.purchases');
                    } else if (toPage === 'home.changePass') {
                        $rootScope.currentClaimType = null;
                    }

                } else if (toPage !== 'home.login') {
                    //e.preventDefault();

                    if (toParams.id) {
                        authService.discussionId = toParams.id;
                    }

                    //$state.go('home.login');
                }

            });
        }
        ]);

    angular.module('ClaimPortal.Services', []);
    angular.module('ClaimPortal.Constants', []);
})();
