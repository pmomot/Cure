/**
 * Created by petermomot on 3/24/16.
 */
'use strict';

(function () {

    angular
        .module('ClaimPortal')
        .controller('DiscussionsController', DiscussionsController);

    DiscussionsController.$inject = ['claimService', 'authService'];

    /**
     * Discussions Controller
     * */
    function DiscussionsController (claimService, authService) {
        var vm = this;

        vm.config = {
            tags: [],
            claimType: 'Discussion',
            title: 'Discussions',
            hint: ''
        };
        vm.hrs = []; // TODO CV find out if needed

        vm.user = authService.getUserInfo;
        vm.claimsInfo = claimService.getClaimsInfo;

        vm.isHr = isHr;

        claimService.fetchClaimsInfo({
            claimType: vm.config.claimType,
            fetchClosed: false
        });


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
