/**
 * Created by petermomot on 3/17/16.
 */
'use strict';

angular.module('ClaimPortal.Services').factory('authTokenService', ['$window', function ($window) {

    if (!$window.localStorage.getItem('token')) {
        $window.localStorage.setItem('token', '');
    }

    /**
     * Get token
     * */
    function getToken () {
        return $window.localStorage.getItem('token');
    }

    /**
     * Set token
     * */
    function setToken (newToken) {
        if (newToken) {
            $window.localStorage.setItem('token', newToken);
        }
    }

    /**
     * Clear token
     * */
    function clearToken () {
        $window.localStorage.setItem('token', '');
    }

    /**
     * Get if token present
     * */
    function hasToken () {
        return $window.localStorage.getItem('token') !== '';
    }

    return {
        getToken: getToken,
        setToken: setToken,
        clearToken: clearToken,
        hasToken: hasToken
    };
}]);
