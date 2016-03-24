/**
 * Created by petermomot on 3/22/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clClaimModal', claimModal);

    claimModal.$inject = ['claimService'];

    /**
     * Claim Modal Directive
     * */
    function claimModal (claimService) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/claimModalView.html',
            scope: {
                show: '=',
                c: '=modalClaim',
                modalAction: '='
            },
            replace: true,
            link: function (scope) {
                scope.close = close;

                /**
                 * Close claim resolving modal
                 * @param {String} action - if not empty, new claim status ('accepted' or 'declined')
                 * */
                function close (action) {
                    if (typeof action !== 'undefined') {
                        scope.c.status = action;
                        claimService.resolveClaim(scope.c);
                    }

                    scope.show = false;
                    scope.c = {};
                    scope.modalAction = '';
                }
            }
        };
    }
})();
