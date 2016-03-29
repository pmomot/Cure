/**
 * Created by petermomot on 3/24/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clDiscussionsList', discussionsList);

    discussionsList.$inject = ['$location', '$anchorScroll', '$timeout', 'claimService'];

    /**
     * Discussions List Directive
     * */
    function discussionsList ($location, $anchorScroll, $timeout, claimService) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/discussionsListView.html',
            scope: {
                opened: '='
            },
            replace: true,
            link: function (scope) {
                var prevLength = 0;

                scope.comment = comment;
                scope.resolve = resolve;

                scope.$watch('opened', goToActiveItem);

                /**
                 * Add comment to discussion
                 * @param {Object} claim - claim body
                 * */
                function comment (claim) {
                    var content = angular.element(document.getElementById(claim._id)).find('textarea').val(),
                        params;

                    if (content.length === 0) {
                        return;
                    }

                    params = {
                        claimId: claim._id,
                        comment: {
                            created: new Date().toISOString(),
                            content: content
                        },
                        claimRecipient: claim.claimRecipient, // users, that will get emails notifications about comment
                        claimTitle: claim.claimTitle
                    };

                    claimService.postComment(params);
                }

                /**
                 * Resolve discussion claim
                 * @param {Object} claim - claim body
                 * */
                function resolve (claim) {
                    claim.status = 'resolved';
                    claimService.resolveClaim(claim);
                }

                /**
                 * Scroll to and add 'active' class to desired discussion
                 * */
                function goToActiveItem () {
                    if (prevLength === scope.opened.length || $location.hash().length === 0) {
                        return;
                    } else {
                        prevLength = scope.opened.length;
                    }

                    $timeout(function () {
                        var el = angular.element(document.getElementById($location.hash()));

                        $anchorScroll();
                        el.addClass('active');

                        $timeout(function () {
                            el.removeClass('active');

                            $timeout(function () {
                                $location.hash('');
                            }, 300);

                        }, 300);

                    }, 0);

                }
            }
        };
    }
})();
