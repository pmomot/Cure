/**
 * Created by petermomot on 3/18/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('LogInController', LogInController);

    LogInController.$inject = ['$location', 'accountService'];

    /**
     * User Log In Controller
     * */
    function LogInController ($location, accountService) {
        var vm = this;

        vm.errors = [];
        vm.data = {};
        vm.sendRequest = sendRequest;

        /**
         * Send user log in request
         * */
        function sendRequest () {
            vm.errors = [];

            accountService.login(vm.data.email, vm.data.password)
                .then(function (data) {
                    vm.errors = [];

                    if (data.success) {
                        if ($location.url().indexOf('?discussion-id=') === -1) {
                            $location.path('/');
                        } else {
                            $location.path('/claims/discussions');
                        }
                    }
                }
            );

        }

    }


})();
