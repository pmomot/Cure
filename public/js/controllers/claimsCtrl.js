MyApp.controller('ClaimsController', ['$scope','$rootScope','$state','$window', 'Auth', 'ClaimService', 'hrs', function($scope, $rootScope, $state, $window, Auth, ClaimService, hrs) {

    var vm = $scope;
    vm.hrs = hrs.data;
    console.log(vm.hrs);
    vm.currentClaimType = $state.current.data.claimType;
    vm.tags = $state.current.data.tags || [];
    vm.processing = false;
    vm.errors = {
      addingError:[]
    };
    vm.modalOpened = false;
    vm.modalType = String;

    vm.currentClaim = {
        claimTitle: '',
        claimType: vm.currentClaimType,
        claimTag: vm.tags[0],
        claimRecipient: vm.hrs ? vm.hrs[0] : undefined,
        claimComment: ''
    };
    vm.claimList = [];
    vm.claimList.clean = true;
    vm.claimListToSend = [];
    vm.newComment = {
        created: Date,
        content: '',
        author: vm.$parent.user
    };

    vm.getClaimsByType = function(){
        ClaimService.getClaimsByType(vm.currentClaimType).success(function(data){
            vm.claimList = data;
            vm.claimList.forEach(function(claim){
                if (claim.status != 'open'){
                    vm.claimList.clean = false;
                    return;
                }
            });
            console.log(data)
        })
    };

    vm.getHrs = function(){
        ClaimService.getHrs().success(function(data){
            vm.hrs = data;
            console.log(vm.hrs);
        })
    };

    vm.addClaim = function(sendmail){
        vm.processing = true;
        vm.errors.addingError = [];
        var fullName = vm.user.firstName + ' ' + vm.user.lastName;

        ClaimService.addClaim(
            vm.$parent.user._id,
            fullName,
            vm.user.email,
            vm.currentClaim.claimTitle,
            vm.currentClaim.claimType,
            vm.currentClaim.claimTag,
            vm.currentClaim.claimRecipient,
            vm.currentClaim.claimComment)

            .success(function(data){
                vm.getClaimsByType();
                vm.processing = false;
                vm.errors.addingError = [];
                if(data.status == 'success'){
                    if(sendmail){
                        ClaimService.sendOneClaim(vm.currentClaim, vm.$parent.user).success(function(data){
                            if(data.status == 'success'){
                                vm.getClaimsByType();
                            }
                        })
                    }
                }else{
                    vm.errors.addingError.push(data.message);
                }
            }
        );
    };

    vm.addComment = function(claim){
        var content = angular.element('textarea[data-id='+claim._id+']').val();
        if (content.length <=0) return;
        var comment = {
            created: Date.now(),
            content: content,
            author: vm.$parent.user
        };

        ClaimService.addComment(comment, claim._id, claim.claimRecipient, claim.claimTitle).success(function(data){
            if(data.status == 'success'){
                vm.getClaimsByType();
            }else{
                console.log(data)
            }
        })
    };

    vm.filterByTag = function(tagName){
        if(tagName == 'All'){
            angular.element("#claimsListTable tbody tr").show();
        }else{
            angular.element("#claimsListTable tbody tr").hide();
            angular.element("#claimsListTable tbody tr[data-tag="+tagName+"]").show();
        }
    };

    vm.openModal = function(item, action) {
        if(action == 'accept'){
            vm.modalType = 'accept';
        }else{
            vm.modalType = 'decline';
        }
        vm.modalOpened = true;
        vm.reviewingClaim = item;
    };

    vm.closeModal = function(reason) {
        if(reason == 'accept'){
            vm.reviewingClaim.status = 'accepted';
            vm.resolveClaim(vm.reviewingClaim);
            vm.reviewingClaim = {};
            console.log('accepted')
        }else if(reason == 'decline'){
            vm.reviewingClaim.status = 'declined';
            vm.resolveClaim(vm.reviewingClaim);
            vm.reviewingClaim = {};
            console.log('declined')
        }else{
            vm.reviewingClaim = {};
            console.log('cancelled')
        }

        vm.modalOpened = false;
        vm.modalType = undefined;
        vm.reviewingClaim = {};
    };

    vm.resolveClaim = function(claim, status){
        ClaimService.resolveClaim(claim, status).success(function(data){
            if(data.status == 'success'){
                vm.getClaimsByType();
            }
        })


    };

    vm.sendClaims = function(){
        vm.claimListToSend = [];
        vm.claimList.forEach(function(claim){
            if(claim.checked){
                vm.claimListToSend.push(claim);
            }
        });
        ClaimService.sendClaims(vm.claimListToSend, vm.$parent.user).success(function(data){
            if(data.status == 'success'){
                vm.getClaimsByType();
            }
        })
    };
    vm.getClaimsByType();
}]);
