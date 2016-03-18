/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('LogInController', LogInController);

    LogInController.$inject = ['$location', 'toastr', 'authService', 'authTokenService'];

    /**
     * User Log In Controller
     * */
    function LogInController ($location, toastr, authService, authTokenService) {
        var vm = this;

        vm.errors = [];
        vm.data = {};
        vm.sendRequest = sendRequest;

        if (authTokenService.hasToken()) {
            $location.path('/');
        }

        /**
         * Send user sign up request
         * */
        function sendRequest () {
            vm.errors = [];

            authService.login(vm.data.email, vm.data.password)
                .success(function (data) {
                    vm.errors = [];

                    // TODO CV investigate
                    //authService.getUser(data.token)
                    //    .then(function (d) {
                    //        vm.user = d.data;
                    //    });

                    if (data.success) {
                        toastr.success(data.message);
                        // vm.loggedIn = authTokenService.hasToken(); // TODO CV investigate
                        $location.path('/');
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


})();
