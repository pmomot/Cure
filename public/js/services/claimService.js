'use strict';

(function () {
    angular
        .module('ClaimPortal.Services')
        .factory('claimService', claimService);

    claimService.$inject = ['$q', 'claimRepository', 'toastr', 'authService'];

    /**
     * Claim Service
     * */
    function claimService ($q, claimRepository, toastr, authService) {

        var claimsInfo = {
            opened: [],
            closed: [],
            availableTags: []
        };

        /**
         * Get claims from server
         * @param {String} claimType - type of claim
         * @param {Array} status - claim status
         * @param {Function} callback - what to do with claims
         * */
        function getClaims (claimType, status, callback) {
            var deferred = $q.defer();

            claimRepository.getClaims({
                claimType: claimType,
                status: status
            })
                .then(function (claims) {
                    if (typeof callback === 'function') {
                        callback(claims);
                    }

                    deferred.resolve();
                })
                .catch(function (errors) {
                    deferred.reject(errors);
                });

            return deferred.promise;
        }

        /**
        * Create new claim or discussion
        * @param {Object} newClaim - claim body
        * */
        function addClaim (newClaim) {
            var deferred = $q.defer(),
                uniqueTitle = true,
                data, user;

            if (newClaim.claimRecipient && newClaim.claimRecipient.length === 0 &&
                newClaim.claimType === 'Discussion') {
                toastr.error('Please, add some recipients');
                deferred.reject();
                return deferred.promise;
            }

            claimsInfo.opened.forEach(function (c) {
                if (newClaim.claimTitle === c.claimTitle) {
                    uniqueTitle = false;
                }
            });

            if (!uniqueTitle) {
                toastr.error("New claim's title is not unique");
                deferred.reject();
                return deferred.promise;
            }

            user = authService.getUserInfo();
            data = angular.extend(newClaim, {
                fullName: user.fullName,
                authorEmail: user.email
            });

            claimRepository.addClaim(data)
                .then(function (result) {
                    if (result.success === true) {
                        toastr.success(result.message);

                        fetchClaimsInfo({
                            claimType: newClaim.claimType
                        });

                        deferred.resolve();
                    } else {
                        toastr.error(result.message);
                        deferred.reject(result);
                    }
                })
                .catch(function (errors) {
                    if (!errors) {
                        errors = {};
                    }
                    if (!errors.message) {
                        errors.message = 'Something went wrong';
                    }
                    toastr.error(errors.message);
                    deferred.reject(errors);
                });

            return deferred.promise;
        }

        /**
        * Resolve claim with positive or negative status
        * @param {Object} claim - claim body
        //* @param {String} status - claim status
        * */
        function resolveClaim (claim) {
            var deferred = $q.defer();


            claimRepository.resolveClaim({
                _id: claim._id,
                status: claim.status,
                claimComment: claim.claimComment
            })
                .then(function (result) {
                    if (result.success === true) {
                        toastr.success(result.message);

                        fetchClaimsInfo({
                            claimType: claim.claimType
                        });

                        deferred.resolve();
                    } else {
                        toastr.error(result.message);
                        deferred.reject(result);
                    }
                })
                .catch(function (errors) {
                    if (!errors) {
                        errors = {};
                    }
                    if (!errors.message) {
                        errors.message = 'Something went wrong';
                    }
                    toastr.error(errors.message);
                    deferred.reject(errors);
                });

            return deferred.promise;
        }

        /**
         * Post new comment to discussion
         * @param {Object} data - comment body
         * */
        function postComment (data) {
            var deferred = $q.defer();

            data.comment.author = authService.getUserInfo();

            claimRepository.postComment(data)
                .then(function (result) {
                    if (result.success) {
                        toastr.success(result.message);

                        fetchClaimsInfo({
                            claimType: 'Discussion'
                        });

                        deferred.resolve();
                    } else {
                        toastr.error(result.message);
                        deferred.reject(result);
                    }
                })
                .catch(function (errors) {
                    if (!errors) {
                        errors = {};
                    }
                    if (!errors.message) {
                        errors.message = 'Something went wrong';
                    }
                    toastr.error(errors.message);
                    deferred.reject(errors);
                });

            return deferred.promise;
        }

        /**
         * Make two calls - for opened and for other claims
         * @param {Object} params - type of claim
         * */
        function fetchClaimsInfo (params) {
            if (typeof params.fetchClosed === 'undefined' && params.claimType !== 'Discussion') {
                params.fetchClosed = true;
            }

            getClaims(params.claimType, ['open'], function (claims) {
                processOpenedClaims(claims);
            }).then(function () {
                if (params.fetchClosed) {
                    getClaims(params.claimType, ['accepted', 'declined', 'resolved'], function (claims) {
                        claimsInfo.closed = claims;

                    });
                }
            });
        }

        /**
         * Provide processed claims data
         * */
        function getClaimsInfo () {
            return claimsInfo;
        }

        // helpers
        /**
         * Get available tags from list of opened claims
         * */
        function processOpenedClaims (claims) {
            claimsInfo = {
                opened: claims,
                availableTags: []
            };

            claimsInfo.opened.forEach(function (c) {
                if (claimsInfo.availableTags.indexOf(c.claimTag) === -1) {
                    claimsInfo.availableTags.push(c.claimTag);
                }
            });
        }

        return {
            addClaim: addClaim,
            resolveClaim: resolveClaim,
            postComment: postComment,

            fetchClaimsInfo: fetchClaimsInfo,
            getClaimsInfo: getClaimsInfo
        };
    }

})();
