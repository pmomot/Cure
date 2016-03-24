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
                // TODO CV make hover on css only
                scope.showTooltip = showTooltip;
                scope.hideTooltip = hideTooltip;
                scope.openModal = openModal;

                /**
                 * Show tooltip with hr comment
                 * @param {Object} $event - angular event object
                 * */
                function showTooltip ($event) {
                    angular.element($event.target).parent().children().eq(0).css('display', 'block');
                }

                /**
                 * Hide tooltip with hr comment
                 * @param {Object} $event - angular event object
                 * */
                function hideTooltip ($event) {
                    angular.element($event.target).parent().children().eq(0).css('display', 'none');
                }

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
