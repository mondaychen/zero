'use strict';

angular.module('zeroApp')
  .config(function ($stateProvider, $sceProvider) {
    $sceProvider.enabled(false)
    $stateProvider
      .state('main', {
        url: '/',
        templateUrl: 'app/main/main.html',
        controller: 'MainCtrl'
      });
  });
