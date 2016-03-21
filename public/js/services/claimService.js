'use strict';

(function () {
    angular
        .module('ClaimPortal.Services')
        .factory('ClaimService', ClaimService);

    ClaimService.$inject = ['$http'];

    /**
     * Claim Service
     * */
    function ClaimService ($http) {

        /**
         * Create new claim or discussion
         * @param {Object} data - claim body
         * */
        function addClaim (data) {

            return $http({url: '/api/addClaim', method: 'POST', data: data})
                .success(function (response) {
                    return response;
                });
        }

        /**
         * Resolve claim with positive or negative status
         * @param {Object} claim - claim body
         * @param {String} status - claim status
         * */
        function resolveClaim (claim, status) {

            return $http({url: '/api/resolveClaim', method: 'POST', data: {
                _id: claim._id,
                status: status || claim.status,
                claimComment: claim.claimComment
            }})
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Get claims from server
         * @param {String} claimType - type of claim
         * */
        function getClaimsByType (claimType) {

            return $http({url: '/api/addClaim', method: 'GET', params: {claimType: claimType}})
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Send resolved claims to user by email
         * @param {Array} claims - list of claims
         * */
        function sendClaims (claims) {

            return $http({url: '/api/sendClaims', method: 'POST', data: {
                claims: claims
            }})
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Send email about adding new discussion
         * @param {Object} claim - discussion body
         * */
        function sendOneClaim (claim) {

            return $http({url: '/api/sendOneClaim', method: 'POST', data: {
                claim: claim
            }})
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Add new comment to discussion
         * @param {Object} comment - comment body
         * @param {String} claimId - claim id
         * @param {Array} claimRecipient - users, that will get emails notifications about comment
         * @param {String} claimTitle - claim title
         * */
        function addComment (comment, claimId, claimRecipient, claimTitle) {

            return $http({url: '/api/addComment', method: 'POST', data: {
                claimId: claimId,
                comment: comment,
                claimRecipient: claimRecipient,
                claimTitle: claimTitle
            }})
                .success(function (data) {
                    return data;
                });
        }

        /**
         * Get all HRs
         * */
        function getHrs () { // TODO CV move to user service

            return $http({method: 'GET', url: '/api/hrs'})
                .success(function (data) {
                    return data;
                });
        }

        return {
            addClaim: addClaim,
            resolveClaim: resolveClaim,
            getClaimsByType: getClaimsByType,
            sendClaims: sendClaims,
            sendOneClaim: sendOneClaim,
            addComment: addComment,
            getHrs: getHrs
        };
    }

})();
