/**
 * Created by petermomot on 3/22/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clOpenedClaim', openedClaim);

    /**
     * Opened Claim Directive
     * */
    function openedClaim () {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/openedClaimView.html',
            scope: {
                c: '=',
                modalClaim: '=',
                modalAction: '=',
                modalShow: '=',
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
