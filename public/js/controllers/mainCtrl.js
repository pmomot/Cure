'use strict';

angular.module('ClaimPortal').controller('MainController', ['$scope', '$rootScope', function ($scope, $rootScope) {
    $scope.changePassData = {
        currentPass: '',
        newPass: '',
        newPassRepeat: ''
    };

    $scope.user = $scope.$parent.user;


    $rootScope.$watch('user', function () {
        $scope.user = $rootScope.user;
    });
    $rootScope.$watch('currentClaimType', function () {
        $scope.currentClaimType = $rootScope.currentClaimType;
    });
}]);
