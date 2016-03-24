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

            $http.post('/api/claim/resolve', data)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        /**
         * Post new comment to discussion
         * @param {Object} data - comment body
         * */
        function postComment (data) {
            var deferred = $q.defer();

            $http.post('/api/comment', data)
                .then(function (result) {
                    deferred.resolve(result.data);
                }, function (errors) {
                    deferred.reject(errors.data);
                });

            return deferred.promise;
        }

        return {
            getClaims: getClaims,
            addClaim: addClaim,
            resolveClaim: resolveClaim,
            postComment: postComment
        };
    }

})();
