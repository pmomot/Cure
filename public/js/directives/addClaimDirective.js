/**
 * Created by petermomot on 3/22/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clAddClaim', addClaim);

    addClaim.$inject = ['claimService', 'authService'];

    /**
     * Add Claim Directive
     * */
    function addClaim (claimService, authService) {
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

                // TODO CV add multiple select support
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
                            scope.$broadcast('clearMulti');
                            scope.multiRefreshed = false;

                        });
                }

                /**
                 * Reset claim to base state
                 * */
                function resetClaim () {
                    //var hrs;

                    scope.claim = {
                        claimTitle: '',
                        claimType: scope.claimType,
                        claimTag: scope.tags[0],
                        claimComment: '',
                        anonymous: false
                    };
                    //
                    //if (scope.claimType === 'Discussion') {
                    //    hrs = scope.hrs();
                    //
                    //    if (hrs.length > 0) {
                    //        scope.claim.claimRecipient = hrs[0];
                    //    }
                    //
                    //}
                }
            }
        };

        //    ClaimService.addClaim(addClaimParams)
        //        .success(function (data) {
        //            if (data.status === 'success') {
        //
        //                $scope.$broadcast('clearMulti');
        //            } else {
        //                $scope.$broadcast('clearMulti');
        //                vm.multiRefreshed = true;
        //            }
        //        }
        //    );

    }
})();
