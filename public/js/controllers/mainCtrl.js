MyApp.controller('MainController', ['$scope','$rootScope','$state','Auth', function($scope, $rootScope, $state, Auth){

    var vm = $scope;

    vm.regExes = {
        name    : /^[a-zA-Z\s]+$/,
        email   : /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
        password: /^\S{4,}$/
    };
    vm.changePassData = {
        currentPass  : '',
        newPass      : '',
        newPassRepeat: ''
    };
    vm.loginData = {};
    vm.signUpData = {};
    vm.errors = {
        loginError     : [],
        signUpError    : [],
        changePassError: [],
        logoutError    : []
    };
    vm.user = vm.$parent.user;
    vm.loggedIn = Auth.isLoggedIn();

    $rootScope.$on('$stateChangeStart', function(e, toState){
        vm.loggedIn = Auth.isLoggedIn();
        vm.loginData = {};
        vm.signUpData = {};
        vm.errors = {
            loginError     : [],
            signUpError    : [],
            changePassError: [],
            logoutError    : []
        };
    });

    vm.doLogin = function(){
        vm.processing = true;
        vm.errors.loginError = [];
        Auth.login(vm.loginData.email, vm.loginData.password)
            .success(function(data){
                vm.processing = false;
                Auth.getUser(data.token)
                    .then(function(data){
                        vm.user = data.data;
                    });
                if(data.success){
                    $state.go('home.purchases');
                    vm.loggedIn = Auth.isLoggedIn();
                    vm.errors.loginError = [];
                }else{
                    $state.go('home.login');
                    vm.errors.loginError.push(data.message);
                }
            }
        );
    };

    vm.changePass = function(){
        vm.processing = true;
        vm.errors.changePassError = [];
        if((vm.changePassData.newPass == vm.changePassData.newPassRepeat) && (vm.changePassData.newPass != '') && (vm.changePassData.newPassRepeat != '')){
            if(!vm.regExes.password.test(vm.changePassData.newPass) || !vm.regExes.password.test(vm.changePassData.newPassRepeat)){
                vm.errors.changePassError.push('New password must be at least 4 characters long and not contain spaces.')
            }else{
                Auth.changePass(vm.changePassData.currentPass, vm.changePassData.newPass, vm.user.email)
                    .success(function(data){
                    vm.processing = false;
                    vm.errors.changePassError = [];
                    if(data.success){
                        vm.showSuccess();
                    }else{
                        if(data.errmsg){
                            vm.errors.changePassError.push('You have entered wrong current password.');
                        }else{
                            vm.errors.changePassError.push(data.message);
                        }
                    }
                })
            }
        }else{
            vm.errors.changePassError.push('New passwords do not match or are empty.');
        }
    };

    vm.changePassPage = function(){
        vm.processing = true;
        $state.go('home.changePass');
    };

    vm.doSignUp = function(){
        vm.processing = true;
        vm.errors.signUpError = [];
        if(!vm.regExes.name.test(vm.signUpData.firstName)){
            vm.errors.signUpError.push('First name may contain only letters.');
        }
        if(!vm.regExes.name.test(vm.signUpData.lastName)){
            vm.errors.signUpError.push('Last name may contain only letters.');
        }
        if(!vm.regExes.email.test(vm.signUpData.email)){
            vm.errors.signUpError.push('Email is invalid.');
        }
        if(!vm.regExes.password.test(vm.signUpData.password)){
            vm.errors.signUpError.push('Password must be at least 4 characters long and not contain spaces.');
        }
        if(vm.signUpData.password != vm.signUpData.passwordRep){
            vm.errors.signUpError.push('Passwords do not match.');
        }
        if(vm.errors.signUpError.length == 0){
            vm.signUpData.userGroup = 'users';
            Auth.signUp(vm.signUpData.userGroup, vm.signUpData.firstName, vm.signUpData.lastName, vm.signUpData.email, vm.signUpData.password)
                .success(function(data){
                    vm.processing = false;
                    vm.errors.signUpError = [];
                    if(data.success){
                        vm.showSuccess();
                    }else{
                        if(data.errmsg){
                            vm.errors.signUpError.push('User with this Email already exists.');
                        }else{
                            vm.errors.signUpError.push(data.message);
                        }
                    }
                }
            );
        }
    };

    vm.doLogout = function(){
        vm.processing = true;
        vm.errors.logoutError = '';
        Auth.logout();
        $state.go('home.login');
    };

    vm.showSignUp = function(){
        angular.element('#signUp, #logIn').toggleClass('hidden');
    };

    vm.showSuccess = function(){
        vm.loginData = {};
        vm.signUpData = {};
        vm.errors = {
            loginError     : [],
            signUpError    : [],
            changePassError: [],
            logoutError    : []
        };
        angular.element('#sigSuc, #logUp').toggleClass('hidden');
    };

    vm.hideSuccess = function(ifPassChange){
        if(ifPassChange){
            vm.doLogout();
            $state.go('home.login');
        }else{
            angular.element('#sigSuc, #logUp').toggleClass('hidden');
            vm.showSignUp();
        }
    };

    $rootScope.$watch('user', function() {
        vm.user = $rootScope.user;
    });
    $rootScope.$watch('currentClaimType', function() {
        vm.currentClaimType = $rootScope.currentClaimType;
    });
}]);