(function(){
    angular.module('musicapp')
        .service('loginService',loginService);

    function loginService($q,$firebaseArray,$firebaseAuth,$firebaseObject,$log,$window, $http){

        var ls = this;
        var log = $log;
        ls.signIn 	   = signIn;
        ls.signOut	   = signOut;
        ls.getTime	   = getTime;
        // ls.signOut();
        ls.isLoggedIn  = isLoggedIn();
        ls.currentUser = setCurrentUser();
        ls.authDataCheck = authDataCheck;
        ls.getUserSettings = getUserSettings;
        ls.loginWithEmail = loginWithEmail;

        function authDataCheck(){
            var deferred = $q.defer();
            firebase.auth().onAuthStateChanged(function(user){
                if (user){
                    log.info("user is " + user.providerData[0].displayName)
                    deferred.resolve(user)
                }else{
                    log.error("failed")
                }
            })
            return deferred.promise;
        }

        function setCurrentUser(){
            var user = firebase.auth().currentUser,
                name , email, photoURL, uid;
            if (user !== null){
                ls.currentUser = {
                    name: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    uid: user.uid,
                    today: getTime()
                };
                ls.isLoggedIn = true;
                // log(ls.currentUser)
            } else{
                ls.currentUser = undefined;
                ls.isLoggedIn = false;
            }
        }

        function signIn(provider){
            var auth = $firebaseAuth();
            return auth.$signInWithPopup(provider)
                .then(loginSuccess).then(function(data){

                    ls.isLoggedIn = isLoggedIn();
                })
                .catch(loginError);
        }

        function signOut(msg){
            var auth = $firebaseAuth();
            var user = firebase.auth().currentUser;
            var ref = firebase.database().ref('users/' + user.uid);
            ls.user = $firebaseObject(ref);
            ls.user.$loaded().then(function(){
                ref.update({
                    logoutTime: getTime(),
                    active: false
                })
            }).then(function(){
                auth.$signOut();
                ls.currentUser = undefined;
                ls.isLoggedIn = isLoggedIn();
            }, function(error){
                log.error("An error occurred: " + error)
            })
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
                        var user = successResponse.data;
                        deferred.resolve(user);
                    }, 
                    function(errorResponse) {
                        log.error("Authentication failed:", errorResponse.data.error);
                        deferred.reject();
                    });

            return deferred.promise;

        }

        function isLoggedIn(){
            firebase.auth().onAuthStateChanged(function(user){
                if (user){
                    setCurrentUser();
                    return ls.isLoggedIn = true;
                }else{
                    return ls.isLoggedIn = false;
                }
            });
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

        function getUserSettings(){
            var deferred = $q.defer();
            ls.authDataCheck().then(function(user){
                var settingRef = firebase.database().ref().child('user_information/').child(user.uid);
                var objectSetting = $firebaseObject(settingRef);
                objectSetting.$loaded().then(function(){
                    var settings = objectSetting;
                    if (settings.enable_friends === undefined){
                        settingRef.set({
                                enable_friends: true,
                                show_suggest: true,
                                embed_player: true
                            })
                            .then(function(){
                                ls.settings = {
                                    enableFriends: true,
                                    showSuggest: true,
                                    embedPlayer: true
                                };
                                deferred.resolve(ls.settings)
                            })
                    } else {
                        ls.settings = objectSetting;
                        deferred.resolve(ls.settings)
                    }
                })
            });
            return deferred.promise;
        }

    }
}());
