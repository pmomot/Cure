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
            var path = $location.path().substr(1);

            if (path.indexOf('claims') === 0) { // all except discussions
                path = path.substr(7);
            }
            $scope.userInfo = authService.getUserInfo();
            $scope.path = path;

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
