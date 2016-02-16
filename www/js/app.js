app = angular.module('starter', ['ionic', 'firebase', 'hmTouchEvents' /*, 'ui.router', 'ct.ui.router.extras', 'ui.bootstrap'*/]);

app.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
});

app.config(function($stateProvider, $urlRouterProvider) 
{
    $stateProvider
        .state('work', {
            url: '/work',
            templateUrl: 'partials/svg.html'
        })
        .state('menu', {
            url: '/menu',
            templateUrl: 'partials/menu.html'
        })
        .state('exos', {
            url: '/exos',
            templateUrl: 'partials/exos.html'
        })
        .state('name', {
            url: '/',
            templateUrl: 'partials/name.html'
        })
        .state('replay', {
            url: '/replay',
            templateUrl: 'partials/liste.html'
        })
        $urlRouterProvider.otherwise('/');
});


