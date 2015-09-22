angular.module('mainCtrl', [])

.controller('MainController', function($rootScope, $location, Auth){

        var vm = this;
        vm.loginData = {};
        vm.signupData = {};
        vm.loggedIn = Auth.isLoggedIn();

        $rootScope.$on('$routeChangeStart', function(){

            vm.loggedIn = Auth.isLoggedIn();

            Auth.getUser()
                .then(function(data){
                    vm.user = data.data;
                }
            );
        });

        vm.doLogin = function(){
            vm.processing = true;
            vm.error = '';

            Auth.login(vm.loginData.email, vm.loginData.password)

                .success(function(data){
                    vm.processing = false;

                    Auth.getUser(data.token)
                        .then(function(data){
                            vm.user = data.data;
                        });
                    if(data.success){
                        $location.path('/');
                        vm.loggedIn = Auth.isLoggedIn();
                    }else{
                        vm.error = data.message;
                    }
                }
            );
        };

        vm.doSignUp = function(){
            vm.processing = true;
            vm.error = '';

            if(vm.signupData.password != vm.signupData.passwordRep){
                vm.error = 'Passwords do not match';
            }else{
                Auth.signUp(vm.signupData.firstName, vm.signupData.lastName, vm.signupData.email, vm.signupData.password)

                    .success(function(data){
                        vm.processing = false;
                        vm.error = null;
                        if(data.success){
                            $location.path('/signupSuccess');
                        }else{
                            vm.error = data.message || data.errmsg;
                        }
                    }
                );
            }
        };

        vm.doLogout = function(){

            vm.processing = true;
            vm.error = '';

            Auth.logout();
            $location.path('/logout');
        };


    });