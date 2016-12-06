// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('musicapp', [
    'ionic', 
    'musicapp.controllers', 
    'ngStorage'
    ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function () {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  })
})


.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
  

  .state('callback',{
    url: '/callback',
    templateUrl: 'templates/callback.html',
    controller: 'callbackCtrl',
      controllerAs: 'vm'
  })

  .state('landing', {
  url: '/landing',
  templateUrl: 'templates/landing.html',
  controller: 'landingCtrl',
    controllerAs: 'vm'
  })

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.artist', {
    url: '/artist',
    views: {
      'tab-artist': {
        templateUrl: 'templates/tab-artist.html',
        controller: 'ArtistCtrl',
        controllerAs: "vm"
      }
    }
  })

  .state('tab.songs', {
      url: '/songs',
      views: {
        'tab-songs': {
          templateUrl: 'templates/tab-songs.html',
          controller: 'SongsCtrl',
          controllerAs: 'vm'
        }
      }
    })
    .state('tab.song-detail', {
      url: '/songs/:songId',
      views: {
        'tab-songs': {
          templateUrl: 'templates/songs-detail.html',
          controller: 'SongsDetailCtrl'
        }
      }
    })

  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/tab-account.html',
        controller: 'AccountCtrl',
        controllerAs: 'vm'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/landing');

});


