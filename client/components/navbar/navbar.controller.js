'use strict';

angular.module('zeroApp')
  .controller('NavbarCtrl', function ($scope, $location, $cookies, Auth) {
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

    var instituteKeyMap = ['cornell', 'columbia']
    var typeKeyMap = ['gmrn', 'gacc']

    $scope.search = {
      institute: $cookies['search.institute'] || 0,
      type: $cookies['search.type'] ||  0,
      showOptions: false,
      value: '',
      submit: function() {
        // TODO: A form validation may be needed.
        // It is possible to change the url & content without refresh the whole page.
        $location.search(typeKeyMap[$scope.search.type] + '=' + this.value
          + '&institution=' + instituteKeyMap[$scope.search.institute])
        this.value = ''
        this.showOptions = false
      }
    }
    $scope.$watch('search', function() {
      $cookies['search.institute'] = $scope.search.institute
      $cookies['search.type'] = $scope.search.type
    }, true)
  });
