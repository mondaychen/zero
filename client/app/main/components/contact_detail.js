angular.module('zeroApp').directive('contactDetail', function() {
  var msgLinkTmpl = _.template('<button class="btn btn-link" data-toggle="modal"'
    + ' data-target="#msg-box" data-type="<%= type %>"'
    + ' data-number="<%= number %>"><%= text %></button>')
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
        var text = scope.detail.replace(/\D/g, '')
        var PHONE_NUM_LENGTH = 10
        var startPosition = text.length - PHONE_NUM_LENGTH
        text = [text.slice(0, startPosition), '(',
          text.slice(startPosition, startPosition + 3), ') ',
          text.slice(startPosition + 3, startPosition + 6), '-',
          text.slice(startPosition + 6)].join('')
        content = msgLinkTmpl({
          type: 'SMS',
          number: scope.detail,
          text: text
        })
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