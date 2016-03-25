/**
 * Created by petermomot on 3/23/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clClaimItem', claimItem);

    /**
     * Claim Item Directive
     * */
    function claimItem () {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/claimItemView.html',
            scope: {
                c: '=',
                modalClaim: '=',
                modalAction: '=',
                modalShow: '=',
                opened: '=',
                isHr: '&'
            },
            replace: true,
            link: function (scope) {
                scope.openModal = openModal;

                /**
                 * Open claim resolving modal
                 * @param {Object} item - claim object
                 * @param {String} action - 'accept' or 'decline' claim
                 * */
                function openModal (item, action) {
                    scope.modalClaim = item;
                    scope.modalAction = action;
                    scope.modalShow = true;
                }
            }
        };
    }
})();
