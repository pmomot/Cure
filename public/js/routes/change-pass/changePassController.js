/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('ChangePassController', ChangePassController);

    ChangePassController.$inject = ['$window', 'REGEX', 'accountService'];

    /**
     * Change User Password Controller
     * */
    function ChangePassController ($window, REGEX, accountService) {
        var vm = this;

        vm.errors = [];
        vm.data = {
            currentPass: '',
            newPass: '',
            newPassRepeat: ''
        };
        vm.sendRequest = sendRequest;

        /**
         * Send user change password request
         * */
        function sendRequest () {
            vm.errors = [];

            if ((vm.data.newPass === vm.data.newPassRepeat) && (vm.data.newPass !== '') && (vm.data.newPassRepeat !== '')) {
                if (!REGEX.PASS.test(vm.data.newPass) || !REGEX.PASS.test(vm.data.newPassRepeat)) {
                    vm.errors.push('New password must be at least 4 characters long and not contain spaces.');
                } else {
                    accountService.changePass({
                        currentPass: vm.data.currentPass,
                        newPass: vm.data.newPass
                    })
                        .then(function (data) {
                            vm.errors = [];

                            if (data.success) {
                                $window.history.back();
                            }
                        });
                }
            } else {
                vm.errors.push('New passwords do not match or are empty.');

            }

        }
    }
})();
