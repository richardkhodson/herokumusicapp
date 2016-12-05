(function(){
    angular.module('musicapp')
        .service('loginService',loginService);

    function loginService($q,$firebaseArray,$firebaseAuth,$firebaseObject,$log,$window){

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
            firebase.auth().signInWithEmailAndPassword(email, password).then(loginSuccess).catch(function(error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              console.log(errorMessage);
              // ...
            })
            .then(function(data){
                console.log("this other then")
                deferred.resolve(data);
            });
            return deferred.promise;


            // var deferred = $q.defer();
            // var auth = $firebaseAuth();
            // auth.$createUserWithEmailAndPassword(email,password)
            //     .then(function () {
            //         auth.$signInWithEmailAndPassword(email, password)
            //             .then(loginSuccess).then(function(data){
            //                 console.log("successfull")
            //               deferred.resolve(data);  
            //             })
            //             .catch(loginError);
            //             return deferred.promise;
            //     }, function (error) {
            //         if (error.code === "auth/email-already-in-use") {
            //             auth.$signInWithEmailAndPassword(email, password)
            //                 .then(loginSuccess).then(function(data){
            //                     deferred.resolve(data);

            //                 })
            //                 .catch(loginError);
            //         } else {
            //             deferred.resolve(error);
            //             $log.error(error);
            //         }
            //     })
            // .catch(loginError);
        }

        function loginSuccess(firebaseUser){
            if(firebaseUser.user === undefined){
                var	user = firebaseUser;   
            } else {
                var user = firebaseUser.user;
            }
            var deferred = $q.defer();
            var currentTime = getTime();
            var	userProfile = user.uid;
            var  ref = firebase.database().ref('users/' + userProfile);
            console.log(user.providerData[0].displayName)
            setCurrentUser();
            ls.user = $firebaseObject(ref);
            // log.info(ls.user);
            ls.user.$loaded().then(function(){
                ref.set({
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    lastLogin: getTime(),
                    active: true,
                    uid: user.uid
                }).then(function(){
                })
            })
            ls.getUserSettings()
            deferred.resolve();
            return deferred.promise;
        }

        function loginError(error) {
            log.error("Authentication failed:", error);
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
