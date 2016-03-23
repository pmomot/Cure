/**
 * Created by petermomot on 3/23/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clTagFilter', tagFilter);

    /**
     * Tag Filter Directive
     * */
    function tagFilter () {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/tagFilterView.html',
            scope: {
                tags: '=',
                activeTag: '='
            },
            replace: true,
            link: function (scope) {
                scope.filterByTag = filterByTag;

                /**
                 * Show claims filtered by tag
                 * */
                function filterByTag (tagName) {
                    scope.activeTag = tagName;
                }
            }
        };
    }
})();
