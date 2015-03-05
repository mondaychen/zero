angular.module('zeroApp').directive('contactDetail', function() {
  return {
    restrict: 'A', // for IE 8
    scope: {
      type: '=',
      detail: '='
    },
    link: function (scope, element) {
      var content = scope.detail
      if (scope.type == 'email') {
        content = '<a href="mailto:#">#</a>'.replace(/\#/g, scope.detail)
      }
      element.html(content)
    }
  }
})