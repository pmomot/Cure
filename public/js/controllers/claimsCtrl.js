'use strict';

// TODO CV change alerts to normal popups
MyApp.controller('ClaimsController', [ // eslint-disable-line no-undef
    '$scope', '$rootScope', '$state', '$window', 'Auth', 'ClaimService', 'hrs', '$timeout', '$stateParams', '$location',
    function ($scope, $rootScope, $state, $window, Auth, ClaimService, hrs, $timeout, $stateParams, $location) {
        var vm = $scope;

        vm.discussionId = $stateParams.id;
        vm.hrs = hrs.data;
        vm.currentClaimType = $rootScope.currentClaimType = $state.current.data.claimType;
        vm.tags = $state.current.data.tags || [];
        vm.errors = {
            addingError: []
        };
        vm.modalOpened = false;
        vm.modalType = '';
        vm.activeTag = 'All';
        vm.tagsAvailability = {};
        vm.tagsList = ['Products', 'Bakery', 'Officeware', 'Equipment', 'Furniture', 'Other'];
        vm.currentClaim = {
            claimTitle: '',
            claimType: vm.currentClaimType,
            claimTag: vm.tags[0],
            claimRecipient: vm.hrs ? vm.hrs[0] : vm.hrs,
            claimComment: '',
            anonymous: false
        };
        vm.claimList = [];
        vm.claimList.clean = true;
        vm.claimListToSend = [];
        vm.newComment = {
            created: Date,
            content: '',
            author: vm.$parent.user
        };
        vm.multiRefreshed = false;

        /**
         * Get claims by their type
         * */
        function getClaimsByType () {

            ClaimService.getClaimsByType(vm.currentClaimType).success(function (data) {
                // TODO CV refactor this!!!
                vm.tagsAvailability = {};
                vm.claimList = data;
                vm.claimList.clean = true;
                vm.claimList.hasOpen = false;
                vm.claimList.hasUnresolved = false;
                vm.claimList.forEach(function (claim) {
                    var i = 0;

                    for (i; i < vm.tagsList.length; i += 1) {
                        if (vm.tagsList[i].match(claim.claimTag) && claim.status === 'open') {
                            vm.tagsAvailability[claim.claimTag] = true;
                        }
                    }
                    if (claim.status !== 'open') {
                        vm.claimList.clean = false;
                    }
                    if (claim.status === 'open') {
                        vm.claimList.hasOpen = true;
                    }
                    if (claim.status === 'accepted' || claim.status === 'declined') {
                        vm.claimList.hasUnresolved = true;
                    }
                });
                if (vm.discussionId) {
                    $location.hash(vm.discussionId);
                }
            });
        }

        /**
         * @param {Bool} sendmail checks if mail sending API is used during method call.
         */
        vm.addClaim = function (sendmail) {
            var uniqueTitle, fullName, addClaimParams = {};

            if (vm.currentClaim.claimRecipient && vm.currentClaim.claimRecipient.length === 0 &&
                vm.currentClaim.claimType === 'Discussion') {
                // alert('Add some recipients, bro!');
                return;
            }
            vm.errors.addingError = [];

            uniqueTitle = true;
            fullName = vm.user.firstName + ' ' + vm.user.lastName;

            vm.claimList.forEach(function (claim) {
                if (vm.currentClaim.claimTitle === claim.claimTitle && claim.status === 'open') {
                    // alert('claim with such title already exists');
                    uniqueTitle = false;
                }
            });
            if (uniqueTitle) {
                addClaimParams = angular.extend({
                    creator: vm.$parent.user._id,
                    fullName: fullName,
                    authorEmail: vm.user.email
                }, vm.currentClaim);

                ClaimService.addClaim(addClaimParams)
                    .success(function (data) {
                        getClaimsByType();
                        vm.errors.addingError = [];
                        if (data.status === 'success') {
                            if (sendmail) {
                                ClaimService.sendOneClaim(vm.currentClaim, vm.$parent.user).success(function (d) {
                                    if (d.status === 'success') {
                                        getClaimsByType();
                                    }
                                });
                            }
                            vm.currentClaim = {
                                claimTitle: '',
                                claimType: vm.currentClaimType,
                                claimTag: vm.tags[0],
                                claimRecipient: vm.hrs ? vm.hrs[0] : vm.hrs,
                                claimComment: '',
                                anonymous: false
                            };

                            // TODO CV think about this, maybe use no-transition class
                            vm.classRemoved = true;
                            $timeout(function () {
                                vm.classRemoved = false;
                            }, 1000);

                            $scope.$broadcast('clearMulti');
                        } else {
                            $scope.$broadcast('clearMulti');
                            vm.multiRefreshed = true;
                            vm.errors.addingError.push(data.message);
                        }
                    }
                );
            }
        };

        vm.addComment = function (claim) {
            var content = angular.element('textarea[data-id=' + claim._id + ']').val(),
                comment;

            if (content.length === 0) {
                return;
            }

            comment = {
                created: new Date().toISOString(),
                content: content,
                author: vm.$parent.user
            };
            ClaimService.addComment(comment, claim._id, claim.claimRecipient, claim.claimTitle).success(function (data) {
                if (data.status === 'success') {
                    getClaimsByType();
                } else {
                    // TODO CV handle errors properly
                    // console.log(data);
                }
            });
        };

        vm.filterByTag = function (tagName) {
            vm.activeTag = tagName;
        };

        vm.showTooltip = function (id) {
            angular.element('.comment-tooltip[data-id=' + id + ']').css('display', 'block');
        };

        vm.hideTooltip = function (id) {
            angular.element('.comment-tooltip[data-id=' + id + ']').css('display', 'none');
        };

        vm.openModal = function (item, action) {
            if (action === 'accept') {
                vm.modalType = 'accept';
            } else {
                vm.modalType = 'decline';
            }
            vm.modalOpened = true;
            vm.reviewingClaim = item;
        };

        vm.closeModal = function (reason) {
            if (reason === 'accept') {
                vm.reviewingClaim.status = 'accepted';
                vm.resolveClaim(vm.reviewingClaim);
            } else if (reason === 'decline') {
                vm.reviewingClaim.status = 'declined';
                vm.resolveClaim(vm.reviewingClaim);
            }
            vm.modalOpened = false;
            vm.modalType = '';
            vm.reviewingClaim = {};

        };

        vm.resolveClaim = function (claim, status) {
            ClaimService.resolveClaim(claim, status).success(function (data) {
                if (data.status === 'success') {
                    getClaimsByType();
                }
            });
        };

        vm.sendClaims = function () {
            vm.claimListToSend = [];
            vm.claimList.forEach(function (claim) {
                if (claim.checked) {
                    vm.claimListToSend.push(claim);
                }
            });
            ClaimService.sendClaims(vm.claimListToSend).success(function (data) {
                if (data.status === 'success') {
                    getClaimsByType();
                }
            });
        };

        vm.checkCheckedCheckboxes = function () {
            var disabled = true;

            vm.claimList.forEach(function (claim) {
                if (claim.checked) {
                    disabled = false;
                }
            });
            return disabled;
        };


        /**
         * Function runs on controller initialize
         * */
        function init () {
            getClaimsByType();
        }

        init();
    }
]);
