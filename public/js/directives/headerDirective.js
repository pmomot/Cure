/**
 * Created by petermomot on 3/21/16.
 */
'use strict';

(function () {
    angular
        .module('ClaimPortal.Directives')
        .directive('clHeader', headerDirective);

    headerDirective.$inject = ['$location', 'authService'];

    /**
     * Header Directive
     * */
    function headerDirective ($location, authService) {
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
            $scope.userInfo = authService.getUserInfo();
            $scope.path = $location.path().substr(1);

            $scope.logout = function () {
                authService.logout();
                $location.path('/user/log-in');
            };

            if (Object.keys($scope.userInfo).length === 0) {
                authService.loadUserInfo()
                    .then(function () {
                        $scope.userInfo = authService.getUserInfo();
                    });
            }

        }
    }
})();
