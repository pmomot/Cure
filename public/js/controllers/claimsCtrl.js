MyApp.controller('ClaimsController', [ // eslint-disable-line no-undef
    '$scope', '$rootScope', '$state', '$window', 'Auth', 'ClaimService', 'hrs', '$timeout', '$stateParams', '$location',
    function ($scope, $rootScope, $state, $window, Auth, ClaimService, hrs, $timeout, $stateParams, $location) {
        'use strict';

        var vm = $scope;

        vm.discussionId = $stateParams.id;
        vm.hrs = hrs.data;
        vm.currentClaimType = $rootScope.currentClaimType = $state.current.data.claimType;
        vm.tags = $state.current.data.tags || [];
        vm.processing = false;
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

        vm.getClaimsByType = function (processing) {
            vm.processing = true;
            ClaimService.getClaimsByType(vm.currentClaimType).success(function (data) {
                vm.processing = processing;
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
        };

        vm.getHrs = function () {
            ClaimService.getHrs().success(function (data) {
                vm.hrs = data;
            });
        };

        /**
         * @param {Bool} sendmail checks if mail sending API is used during method call.
         */
        vm.addClaim = function (sendmail) {
            var uniqueTitle, fullName;

            if (vm.currentClaim.claimRecipient && vm.currentClaim.claimRecipient.length === 0 &&
                vm.currentClaim.claimType === 'Discussion') {
                alert('Add some recipients, bro!');
                return;
            }
            vm.processing = true;
            vm.errors.addingError = [];

            uniqueTitle = true;
            fullName = vm.user.firstName + ' ' + vm.user.lastName;

            vm.claimList.forEach(function (claim) {
                if (vm.currentClaim.claimTitle === claim.claimTitle && claim.status === 'open') {
                    alert('claim with such title already exists');
                    uniqueTitle = false;
                    vm.processing = false;
                }
            });
            if (uniqueTitle) {
                vm.processing = true;
                ClaimService.addClaim(
                    vm.$parent.user._id,
                    fullName,
                    vm.user.email,
                    vm.currentClaim.claimTitle,
                    vm.currentClaim.claimType,
                    vm.currentClaim.claimTag,
                    vm.currentClaim.claimRecipient,
                    vm.currentClaim.claimComment,
                    vm.currentClaim.anonymous)
                    .success(function (data) {
                        vm.getClaimsByType(sendmail);
                        vm.errors.addingError = [];
                        if (data.status === 'success') {
                            if (sendmail) {
                                ClaimService.sendOneClaim(vm.currentClaim, vm.$parent.user).success(function (d) {
                                    if (d.status === 'success') {
                                        vm.getClaimsByType();
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
                            vm.removeLastAddedClass();
                            $scope.$broadcast('clearMulti');
                        } else {
                            $scope.$broadcast('clearMulti');
                            vm.multiRefreshed = true;
                            vm.processing = false;
                            vm.errors.addingError.push(data.message);
                        }
                    }
                );
            }
        };

        vm.addComment = function (claim) {
            var content = angular.element('textarea[data-id=' + claim._id + ']').val(),
                comment;

            vm.processing = true;
            if (content.length <= 0) {
                vm.processing = false;
                return;
            }
            comment = {
                created: new Date().toISOString(),
                content: content,
                author: vm.$parent.user
            };
            ClaimService.addComment(comment, claim._id, claim.claimRecipient, claim.claimTitle).success(function (data) {
                vm.processing = false;
                if (data.status === 'success') {
                    vm.getClaimsByType();
                } else {
                    console.log(data);
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
            vm.processing = true;
            ClaimService.resolveClaim(claim, status).success(function (data) {
                vm.processing = false;
                if (data.status === 'success') {
                    vm.getClaimsByType();
                }
            });
        };

        vm.sendClaims = function () {
            vm.processing = true;
            vm.claimListToSend = [];
            vm.claimList.forEach(function (claim) {
                if (claim.checked) {
                    vm.claimListToSend.push(claim);
                }
            });
            ClaimService.sendClaims(vm.claimListToSend, vm.$parent.user).success(function (data) {
                vm.processing = false;
                if (data.status === 'success') {
                    vm.getClaimsByType();
                }
            });
        };

        vm.orderByDate = function (item) {
            var parts = item.split('-');

            return new Date(parseInt(parts[2]), parseInt(parts[1]), parseInt(parts[0]));
        };

        vm.removeLastAddedClass = function () {
            vm.classRemoved = true;
            $timeout(function () {
                vm.classRemoved = false;
            }, 1000);
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

        vm.deleteUser = function (userEmail) {
            Auth.deleteUser(userEmail);
        };

        vm.getClaimsByType();
    }
]);
