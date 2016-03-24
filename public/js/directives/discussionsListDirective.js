/**
 * Created by petermomot on 3/24/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clDiscussionsList', discussionsList);

    discussionsList.$inject = ['claimService'];

    /**
     * Discussions List Directive
     * */
    function discussionsList (claimService) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/discussionsListView.html',
            scope: {
                opened: '='
            },
            replace: true,
            link: function (scope) {
                scope.comment = comment;
                scope.resolve = resolve;

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
            }
        };
    }
})();
