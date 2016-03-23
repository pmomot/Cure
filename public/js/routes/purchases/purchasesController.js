/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('PurchasesController', PurchasesController);

    PurchasesController.$inject = ['claimService', 'authService'];

    /**
     * Purchases Controller
     * */
    function PurchasesController (claimService, authService) {
        var vm = this;

        vm.tags = ['Products', 'Bakery', 'Officeware'];
        vm.activeTag = 'All';
        vm.claimType = 'Purchase';
        vm.hrs = []; // TODO CV find out if needed
        vm.modalShow = false;
        vm.modalClaim = {};
        vm.modalAction = '';

        vm.user = authService.getUserInfo;
        vm.claimsInfo = claimService.getClaimsInfo;

        vm.isHr = isHr;

        claimService.fetchClaimsInfo(vm.claimType);


        /**
         * Get if user belongs to HR group
         * */
        function isHr () {
            return vm.user().userGroup === 'HR';
        }


        // TODO CV get to it later
        //vm.discussionId = $stateParams.id;
        //vm.hrs = hrs.data;

        //vm.newComment = {
        //    created: Date,
        //    content: '',
        //    author: vm.$parent.user
        //};
        //vm.multiRefreshed = false;


    }


})();
