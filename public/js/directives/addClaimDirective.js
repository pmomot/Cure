/**
 * Created by petermomot on 3/22/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clAddClaim', addClaim);

    addClaim.$inject = ['claimService'];

    /**
     * Add Claim Directive
     * */
    function addClaim (claimService) {
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
                resetClaim();

                /**
                 * Create new claim
                 * */
                function sendRequest () {
                    claimService.addClaim(scope.claim)
                        .then(function () {
                            resetClaim();
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
                        claimRecipient: {}, // TODO CV should be provided only for discussions
                        // claimRecipient: vm.hrs ? vm.hrs[0] : vm.hrs,
                        claimComment: '',
                        anonymous: false
                    };
                }
            }
        };

        //    ClaimService.addClaim(addClaimParams)
        //        .success(function (data) {
        //            if (data.status === 'success') {
        //                if (sendmail) {
        //                    ClaimService.sendOneClaim(vm.currentClaim, vm.$parent.user).success(function (d) {
        //                        if (d.status === 'success') {
        //                            getClaimsByType();
        //                        }
        //                    });
        //                }
        //
        //                // TODO CV think about this, maybe use no-transition class
        //                vm.classRemoved = true;
        //                $timeout(function () {
        //                    vm.classRemoved = false;
        //                }, 1000);
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
