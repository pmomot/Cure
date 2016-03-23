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

            // TODO CV look at this on Discussion tab
            //if (claim.claimRecipient && claim.claimRecipient.length === 0 &&
            //    claim.claimType === 'Discussion') {
            //    alert('Add some recipients, bro!');
                //return;
            //}

            claimsInfo.opened.forEach(function (c) {
                if (newClaim.claimTitle === c.claimTitle) {
                    uniqueTitle = false;
                }
            });

            if (!uniqueTitle) {
                toastr.error("New claim's title is not unique", 'Error');
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

                        fetchClaimsInfo(newClaim.claimType);

                        deferred.resolve();
                    } else {
                        deferred.reject(result);
                    }
                })
                .catch(function (errors) {
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

                        fetchClaimsInfo(claim.claimType);

                        deferred.resolve();
                    } else {
                        deferred.reject(result);
                    }
                })
                .catch(function (errors) {
                    deferred.reject(errors);
                });

            return deferred.promise;
        }

        ///**
        // * Send email about adding new discussion
        // * @param {Object} claim - discussion body
        // * */
        //function sendOneClaim (claim) {
        //
        //    return $http({url: '/api/sendOneClaim', method: 'POST', data: {
        //        claim: claim
        //    }})
        //        .success(function (data) {
        //            return data;
        //        });
        //}
        //
        ///**
        // * Add new comment to discussion
        // * @param {Object} comment - comment body
        // * @param {String} claimId - claim id
        // * @param {Array} claimRecipient - users, that will get emails notifications about comment
        // * @param {String} claimTitle - claim title
        // * */
        //function addComment (comment, claimId, claimRecipient, claimTitle) {
        //
        //    return $http({url: '/api/addComment', method: 'POST', data: {
        //        claimId: claimId,
        //        comment: comment,
        //        claimRecipient: claimRecipient,
        //        claimTitle: claimTitle
        //    }})
        //        .success(function (data) {
        //            return data;
        //        });
        //}
        //
        ///**
        // * Get all HRs
        // * */
        //function getHrs () { // TODO CV move to user service
        //
        //    return $http({method: 'GET', url: '/api/hrs'})
        //        .success(function (data) {
        //            return data;
        //        });
        //}

        /**
         * Make two calls - for opened and for other claims
         * @param {String} claimType - type of claim
         * */
        function fetchClaimsInfo (claimType) {
            getClaims(claimType, ['open'], function (claims) {
                processOpenedClaims(claims);
            }).then(function () {
                getClaims(claimType, ['accepted', 'declined', 'resolved'], function (claims) {
                    claimsInfo.closed = claims;

                });
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
            getClaims: getClaims,
            addClaim: addClaim,
            resolveClaim: resolveClaim,

            fetchClaimsInfo: fetchClaimsInfo,
            getClaimsInfo: getClaimsInfo
            //sendOneClaim: sendOneClaim,
            //addComment: addComment,
            //getHrs: getHrs
        };
    }

})();
