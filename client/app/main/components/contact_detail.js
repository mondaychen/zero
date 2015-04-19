angular.module('zeroApp').directive('contactDetail', function() {
  return {
    restrict: 'A', // for IE 8
    scope: {
      type: '=',
      detail: '='
    },
    link: function (scope, element) {
      var content = scope.detail
      if (scope.type === 'officePhone' || scope.type === 'mobilePhone') {
        // formatting
        content = scope.detail.replace(/\D/g, '')
        var PHONE_NUM_LENGTH = 10
        var startPosition = content.length - PHONE_NUM_LENGTH
        content = [content.slice(0, startPosition), '(',
          content.slice(startPosition, startPosition + 3), ')',
          content.slice(startPosition + 3, startPosition + 6), '-',
          content.slice(startPosition + 6)].join('')
      }
      if (scope.type === 'email') {
        content = '<a href="mailto:@">@</a>'.replace(/\@/g, scope.detail)
      }
      if (scope.type === 'pagerNum') {
        content = ('<a href="javascript:;" data-toggle="modal" data-target="#pager-box"'
          + 'data-number="@">@</a>')
          .replace(/\@/g, scope.detail)
      }
      element.html(content)
    }
  }
})