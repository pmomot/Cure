'use strict';

(function () {
    angular
        .module('ClaimPortal.Repositories')
        .factory('claimRepository', claimRepository);

    claimRepository.$inject = ['$http', '$q'];

    /**
     * Claim Repository
     * */
    function claimRepository ($http, $q) {

        /**
         * Get claims from server
         * @param {Object} params - query parameters
         * */
        function getClaims (params) {
            var deferred = $q.defer();

            $http.get('/api/claims', {params: params})
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Create new claim or discussion
         * @param {Object} data - claim body
         * */
        function addClaim (data) {
            var deferred = $q.defer();

            $http.post('/api/claims', data)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
        * Resolve claim
        * @param {Object} data - request body
        * */
        function resolveClaim (data) {
            var deferred = $q.defer();

            $http.post('/api/resolveClaim', data)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
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

        return {
            getClaims: getClaims,
            addClaim: addClaim,
            resolveClaim: resolveClaim
            //sendOneClaim: sendOneClaim,
            //addComment: addComment,
            //getHrs: getHrs
        };
    }

})();
