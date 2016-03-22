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
            list: [],
            availableTags: [],
            clean: true,
            hasOpen: false,
            hasUnresolved: false
        };

        /**
         * Get claims from server
         * @param {String} claimType - type of claim
         * */
        function getClaimsByType (claimType) {
            var deferred = $q.defer();

            claimRepository.getClaimsByType(claimType)
                .then(function (claims) {
                    processClaimsData(claims);

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

            claimsInfo.list.forEach(function (c) {
                if (c.status === 'open' && newClaim.claimTitle === c.claimTitle) {
                    uniqueTitle = false;
                }
            });

            if (!uniqueTitle) {
                toastr.error("New claim's title is not unique", 'Error');
                return deferred.reject();
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
                        claimsInfo.list.push(result.createdClaim);
                        processClaimsData();
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

                        getClaimsByType(claim.claimType);

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
        // * Send resolved claims to user by email
        // * @param {Array} claims - list of claims
        // * */
        //function sendClaims (claims) {
        //
        //    return $http({url: '/api/sendClaims', method: 'POST', data: {
        //        claims: claims
        //    }})
        //        .success(function (data) {
        //            return data;
        //        });
        //}
        //
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
         * Provide processed claims data
         * */
        function getClaimsInfo () {
            return claimsInfo;
        }

        // helpers
        /**
         * Get all necessary info from list of claims
         * */
        function processClaimsData (claims) {
            if (!claims) {
                claims = claimsInfo.list;
            }
            claimsInfo = {
                list: claims,
                availableTags: [],
                clean: true,
                hasOpen: false,
                hasUnresolved: false
            };

            claimsInfo.list.forEach(function (c) {
                if (claimsInfo.availableTags.indexOf(c.claimTag) === -1 && c.status === 'open') {
                    claimsInfo.availableTags.push(c.claimTag);
                }

                if (c.status === 'open') {
                    claimsInfo.hasOpen = true;
                } else {
                    claimsInfo.clean = false;
                    if (c.status === 'accepted' || c.status === 'declined') {
                        claimsInfo.hasUnresolved = true;
                    }
                }

            });
        }

        return {
            getClaimsByType: getClaimsByType,
            addClaim: addClaim,
            resolveClaim: resolveClaim,

            getClaimsInfo: getClaimsInfo
            //sendClaims: sendClaims,
            //sendOneClaim: sendOneClaim,
            //addComment: addComment,
            //getHrs: getHrs
        };
    }

})();
