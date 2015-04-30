angular.module('zeroApp').directive('contactDetail', function() {
  var msgLinkTmpl = _.template('<button class="btn btn-link" data-toggle="modal"'
    + ' data-target="#<%= type %>-box"'
    + ' data-number="<%= number %>"><%= text %></button>')
  function numberFormatter (number) {
    number = number.replace(/\D/g, '')
    var PHONE_NUM_LENGTH = 10
    var startPosition = Math.max(number.length - PHONE_NUM_LENGTH, 0)
    number = _.compact([number.slice(0, startPosition),
      number.slice(startPosition, startPosition + 3),
      number.slice(startPosition + 3, startPosition + 6),
      number.slice(startPosition + 6)]).join('-')
    return number
  }
  return {
    restrict: 'A', // for IE 8
    scope: {
      type: '=',
      detail: '='
    },
    link: function (scope, element) {
      var content = scope.detail
      if (scope.type === 'officePhone' || scope.type === 'mobilePhone') {
        content = msgLinkTmpl({
          type: 'SMS',
          number: scope.detail,
          text: numberFormatter(scope.detail)
        })
      }
      if (scope.type === 'faxNum') {
        content = numberFormatter(scope.detail)
      }
      if (scope.type === 'email') {
        content = '<a href="mailto:@">@</a>'.replace(/\@/g, scope.detail)
      }
      if (scope.type === 'pagerNum') {
        content = msgLinkTmpl({
          type: 'pager',
          number: scope.detail,
          text: scope.detail
        })
      }
      element.html(content)
    }
  }
})