'use strict';

angular.module('zeroApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth) {
    // $scope.menu = [{
    //   'title': 'Home',
    //   'link': '/'
    // }];

    // $scope.isCollapsed = true;
    // $scope.isLoggedIn = Auth.isLoggedIn;
    // $scope.isAdmin = Auth.isAdmin;
    // $scope.getCurrentUser = Auth.getCurrentUser;

    // $scope.logout = function() {
    //   Auth.logout();
    //   $location.path('/login');
    // };

    // $scope.isActive = function(route) {
    //   return route === $location.path();
    // };

    $scope.searchOptions = {
      institute: ['Cornell', 'Columbia'],
      type: ['MRN', 'Accession #']
    }

    $scope.search = {
      institute: 0,
      type: 0,
      showOptions: false
    }
  });
