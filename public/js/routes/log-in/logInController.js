/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('LogInController', LogInController);

    LogInController.$inject = ['$location', 'toastr', 'authService'];

    /**
     * User Log In Controller
     * */
    function LogInController ($location, toastr, authService) {
        var vm = this;

        vm.errors = [];
        vm.data = {};
        vm.sendRequest = sendRequest;

        /**
         * Send user log in request
         * */
        function sendRequest () {
            vm.errors = [];

            authService.login(vm.data.email, vm.data.password)
                .success(function (data) {
                    vm.errors = [];

                    if (data.success) {
                        toastr.success(data.message);
                        $location.path('/');
                    } else {
                        if (!data.message) {
                            data.message = '';
                        }
                        toastr.error(data.message);
                    }
                }
            );

        }

    }


})();
