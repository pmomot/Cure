/**
 * Created by petermomot on 3/22/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clAddClaim', addClaim);

    addClaim.$inject = ['$timeout', 'claimService', 'authService'];

    /**
     * Add Claim Directive
     * */
    function addClaim ($timeout, claimService, authService) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/addClaimView.html',
            scope: {
                claimType: '=',
                tags: '='
            },
            replace: true,
            link: function (scope) {
                scope.sendRequest = sendRequest;
                scope.hrs = authService.getHrs;

                resetClaim();

                if (scope.claimType === 'Discussion') {
                    authService.fetchHrs();
                }

                /**
                 * Create new claim
                 * */
                function sendRequest () {
                    claimService.addClaim(scope.claim)
                        .then(function () {
                            resetClaim();
                            $timeout(function () { // hack for clearing multi-select plugin
                                angular.element(document.querySelector('.helperButton')).triggerHandler('click');
                            }, 0, false);
                        });
                }

                /**
                 * Reset claim to base state
                 * */
                function resetClaim () {
                    scope.claim = {
                        claimTitle: '',
                        claimType: scope.claimType,
                        claimTag: scope.tags[0],
                        claimComment: '',
                        anonymous: false
                    };
                }
            }
        };

    }
})();
