(function(){
    angular.module('musicapp')
        .service('loginService', function ($q,$log, $http, $localStorage){

        var user;
        if($localStorage.user) {
            user = $localStorage.user;
        }
        var ls = this;
        var log = $log;
        ls.signOut = signOut;
        ls.getTime = getTime;
        ls.loginWithEmail = loginWithEmail;
        ls.isLoggedIn = isLoggedIn;


        function signOut(){
            user = undefined;
            $localStorage.user = undefined;
            return user;
        }

        function loginWithEmail(email,password) {
            var deferred = $q.defer(); 
            
            $http ({
                method: 'POST',
                url: 'users/login',
                data: {
                    username: email,
                    password: password
                }
            })
                .then(
                    function(successResponse) {
                        user = successResponse.data;
                        $localStorage.user = user;
                        deferred.resolve(user);
                    }, 
                    function(errorResponse) {
                        log.error("Authentication failed:", errorResponse.data.error);
                        deferred.reject();
                    });

            return deferred.promise;

        }

        function isLoggedIn(){
           return user;
        }

        function getTime(){

            var date = new Date();
            var month = date.getMonth() + 1;
            var day = date.getDate();
            var hour = date.getHours();
            var min = date.getMinutes();
            var sec = date.getSeconds();
            var year = date.getFullYear();

            month = (month < 10 ? "0" : "") + month;
            day = (day < 10 ? "0" : "") + day;
            hour = (hour < 10 ? "0" : "") + hour;
            min = (min < 10 ? "0" : "") + min;
            sec = (sec < 10 ? "0" : "") + sec;

            dateObject = month + "/" + day + "/" + year + " " + hour + ":" + min + ":" + sec;
            return dateObject
        }


    })
}());
