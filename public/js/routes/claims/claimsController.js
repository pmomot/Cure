/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('ClaimsController', ClaimsController);

    ClaimsController.$inject = ['$routeParams', 'claimService', 'authService'];

    /**
     * Claims Controller
     * */
    function ClaimsController ($routeParams, claimService, authService) {
        var vm = this,
            config = {};

        switch ($routeParams.claimType) {
            case 'propositions':
                config = {
                    tags: ['Equipment', 'Furniture', 'Other'],
                    claimType: 'Proposition',
                    title: 'Propositions / Claims',
                    hint: 'All your wishes, comments and complaints.',
                    fetchClosed: true
                };
                break;
            case 'stuff':
                config = {
                    tags: [],
                    claimType: 'Chemical',
                    title: 'Stuff',
                    hint: '',
                    fetchClosed: true
                };
                break;
            case 'discussions':
                config = {
                    tags: [],
                    claimType: 'Discussion',
                    title: 'Discussions',
                    hint: '',
                    fetchClosed: false
                };
                break;
            case 'purchases':
            default:
                config = {
                    tags: ['Products', 'Bakery', 'Officeware'],
                    claimType: 'Purchase',
                    title: 'Purchases',
                    hint: 'Something, you need to be bought.',
                    fetchClosed: true
                };
                break;
        }

        vm.config = config;
        vm.activeTag = 'All';
        vm.modalShow = false;
        vm.modalClaim = {};
        vm.modalAction = '';

        vm.user = authService.getUserInfo;
        vm.claimsInfo = claimService.getClaimsInfo;

        vm.isHr = isHr;

        claimService.fetchClaimsInfo({
            claimType: vm.config.claimType,
            fetchClosed: vm.config.fetchClosed
        });


        /**
         * Get if user belongs to HR group
         * */
        function isHr () {
            return vm.user().userGroup === 'HR';
        }
    }

})();
