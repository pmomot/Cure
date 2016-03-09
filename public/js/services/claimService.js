MyApp.factory('ClaimService', ['$http', '$q', 'AuthToken', 'AuthInterceptor', function ($http, $q, AuthToken, AuthInterceptor) { // eslint-disable-line no-undef
    'use strict';

    var claimFactory = {};

    // TODO CV move params to object
    claimFactory.addClaim = function (creator, fullName, authorEmail, claimTitle, claimType, claimTag, claimRecipient, claimComment, anonymous) {

        var token = AuthToken.getToken();

        return $http({url: '/api/addClaim', method: 'POST', headers: {'x-access-token': token}, data: {
            creator: creator,
            fullName: fullName,
            authorEmail: authorEmail,
            claimTitle: claimTitle,
            claimType: claimType,
            claimTag: claimTag,
            claimRecipient: claimRecipient,
            claimComment: claimComment,
            anonymous: anonymous
        }})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.resolveClaim = function (claim, status) {

        var token = AuthToken.getToken();

        return $http({url: '/api/resolveClaim', method: 'POST', headers: {'x-access-token': token}, data: {
            _id: claim._id,
            status: status || claim.status,
            claimComment: claim.claimComment
        }})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.getClaimsByType = function (claimType) {

        var token = AuthToken.getToken();

        return $http({url: '/api/addClaim', method: 'GET', headers: {'x-access-token': token}, params: {claimType: claimType}})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.sendClaims = function (claims, currentUser) {

        var token = AuthToken.getToken();

        return $http({url: '/api/sendClaims', method: 'POST', headers: {'x-access-token': token}, data: {
            claims: claims,
            currentUser: currentUser
        }})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.sendOneClaim = function (claim, currentUser) {

        var token = AuthToken.getToken();

        return $http({url: '/api/sendOneClaim', method: 'POST', headers: {'x-access-token': token}, data: {
            claim: claim,
            currentUser: currentUser
        }})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.addComment = function (comment, claimId, claimRecipient, claimTitle) {

        var token = AuthToken.getToken();

        return $http({url: '/api/addComment', method: 'POST', headers: {'x-access-token': token}, data: {
            claimId: claimId,
            comment: comment,
            claimRecipient: claimRecipient,
            claimTitle: claimTitle
        }})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    claimFactory.getHrs = function () {

        var token = AuthToken.getToken();

        return $http({method: 'GET', url: '/api/hrs', headers: {'x-access-token': token}})
            .success(function (data) {
                return data;
            }).error(function (data) {
                AuthInterceptor.responceError(data);
            });
    };

    return claimFactory;
}]);
