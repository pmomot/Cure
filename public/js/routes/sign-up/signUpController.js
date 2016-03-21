/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('SignUpController', SignUpController);

    SignUpController.$inject = ['$location', '$window', 'toastr', 'REGEX', 'authService'];

    /**
     * User Sign Up Controller
     * */
    function SignUpController ($location, $window, toastr, REGEX, authService) {
        var vm = this;

        vm.errors = [];
        vm.data = {};
        vm.sendRequest = sendRequest;

        if ($window.localStorage.getItem('token') === '') { // sign up page can be opened only when not authorized
            $location.path('/');
        }

        /**
         * Send user sign up request
         * */
        function sendRequest () {

            vm.errors = [];

            if (!REGEX.NAME.test(vm.data.firstName)) {
                vm.errors.push('First name may contain only letters.');
            }
            if (!REGEX.NAME.test(vm.data.lastName)) {
                vm.errors.push('Last name may contain only letters.');
            }
            if (!REGEX.EMAIL.test(vm.data.email)) {
                vm.errors.push('Email is invalid.');
            }
            if (!REGEX.PASS.test(vm.data.password)) {
                vm.errors.push('Password must be at least 4 characters long and not contain spaces.');
            }
            if (vm.data.password !== vm.data.passwordRep) {
                vm.errors.push('Passwords do not match.');
            }

            if (vm.errors.length === 0) {
                vm.data.userGroup = 'users';

                authService.signUp(vm.data)
                    .success(function (data) {
                        vm.errors = [];

                        if (data.success) {
                            toastr.success('New user created! Now log in.');
                            $location.path('/user/log-in');
                        } else {
                            if (!data.message) {
                                data.message = '';
                            }
                            toastr.error('Error', data.message);
                        }
                    }
                );
            }

        }

    }


})();
