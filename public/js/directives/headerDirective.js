/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clHeader', headerDirective);

    headerDirective.$inject = ['$location', 'accountService'];

    /**
     * Header Directive
     * */
    function headerDirective ($location, accountService) {
        return {
            restrict: 'E',
            templateUrl: 'js/directives/headerView.html',
            link: link,
            replace: true
        };

        /**
         * Link function
         * */
        function link ($scope) {
            $scope.userInfo = accountService.getUserInfo();
            $scope.path = $location.path().substr(8);

            $scope.logout = function () {
                accountService.logout();
                $location.path('/user/log-in');
            };

            if (Object.keys($scope.userInfo).length === 0) {
                accountService.loadUserInfo()
                    .then(function () {
                        $scope.userInfo = accountService.getUserInfo();
                    });
            }

        }
    }
})();
