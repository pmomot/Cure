/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clSpinner', spinnerDirective);

    /**
     * Loading Spinner Directive
     * */
    function spinnerDirective () {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/loadingSpinnerView.html',
            scope: {
                processing: '='
            },
            replace: true
        };
    }
})();
