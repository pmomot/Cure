'use strict';

angular.module('ClaimPortal').controller('MainController', ['$scope', '$rootScope', '$state', 'authService', 'authTokenService', '$location', 'REGEX', function ($scope, $rootScope, $state, authService, authTokenService, $location, REGEX) {
    var vm = $scope;

    vm.changePassData = {
        currentPass: '',
        newPass: '',
        newPassRepeat: ''
    };
    vm.loginData = {};
    vm.signUpData = {};
    vm.errors = {
        loginError: [],
        signUpError: [],
        changePassError: [],
        logoutError: []
    };
    vm.user = vm.$parent.user;
    vm.loggedIn = authTokenService.hasToken();

    $rootScope.$on('$stateChangeStart', function () {
        vm.loggedIn = authTokenService.hasToken();
        vm.loginData = {};
        vm.signUpData = {};
        vm.errors = {
            loginError: [],
            signUpError: [],
            changePassError: [],
            logoutError: []
        };
    });

    vm.changePass = function () {
        vm.errors.changePassError = [];
        if ((vm.changePassData.newPass === vm.changePassData.newPassRepeat) && (vm.changePassData.newPass !== '') && (vm.changePassData.newPassRepeat !== '')) {
            if (!REGEX.PASS.test(vm.changePassData.newPass) || !REGEX.PASS.test(vm.changePassData.newPassRepeat)) {
                vm.errors.changePassError.push('New password must be at least 4 characters long and not contain spaces.');
            } else {
                authService.changePass(vm.changePassData.currentPass, vm.changePassData.newPass, vm.user.email)
                    .success(function (data) {
                        vm.errors.changePassError = [];

                        if (data.success) {
                            vm.showSuccess();
                        } else {
                            if (data.errmsg) {
                                vm.errors.changePassError.push('You have entered wrong current password.');
                            } else {
                                vm.errors.changePassError.push(data.message);
                            }
                        }
                    });
            }
        } else {
            vm.errors.changePassError.push('New passwords do not match or are empty.');
        }
    };

    vm.doLogout = function () {
        vm.errors.logoutError = '';
        authService.logout();
        $state.go('home.login');
    };

    vm.showSuccess = function () {
        vm.loginData = {};
        vm.signUpData = {};
        vm.errors = {
            loginError: [],
            signUpError: [],
            changePassError: [],
            logoutError: []
        };
        angular.element('#sigSuc, #logUp').toggleClass('hidden');
    };

    vm.hideSuccess = function (ifPassChange) {
        if (ifPassChange) {
            vm.doLogout();
            $state.go('home.login');
        } else {
            angular.element('#sigSuc, #logUp').toggleClass('hidden');
        }
    };

    $rootScope.$watch('user', function () {
        vm.user = $rootScope.user;
    });
    $rootScope.$watch('currentClaimType', function () {
        vm.currentClaimType = $rootScope.currentClaimType;
    });
}]);
