angular.module('zeroApp').directive('contactDetail', function() {
  var page = function(num) {
    console.log(num)
  }
  return {
    restrict: 'A', // for IE 8
    scope: {
      type: '=',
      detail: '='
    },
    link: function (scope, element) {
      var content = scope.detail
      if (scope.type == 'email') {
        content = '<a href="mailto:@">@</a>'.replace(/\@/g, scope.detail)
      }
      if (scope.type == 'pagerNum') {
        content = ('<a href="#">@</a>')
          .replace(/\@/g, scope.detail)
        content = $(content)
        content.click(function(e) {
          e.preventDefault()
          page(scope.detail)
        })
      }
      element.html(content)
    }
  }
})