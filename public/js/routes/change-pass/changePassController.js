/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('ChangePassController', ChangePassController);

    ChangePassController.$inject = ['$window', 'toastr', 'REGEX', 'authService'];

    /**
     * Change User Password Controller
     * */
    function ChangePassController ($window, toastr, REGEX, authService) {
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
                    authService.changePass({
                        currentPass: vm.data.currentPass,
                        newPass: vm.data.newPass
                    })
                        .success(function (data) {
                            vm.errors = [];

                            if (data.success) {
                                toastr.success(data.message);
                                $window.history.back();
                            } else {
                                toastr.error('Error', data.message);
                            }
                        });
                }
            } else {
                vm.errors.push('New passwords do not match or are empty.');

            }

        }
    }
})();
