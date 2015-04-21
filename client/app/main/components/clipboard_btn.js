angular.module('zeroApp').directive('clipboardButton', function() {
  return {
    restrict: 'A', // for IE 8
    scope: {
      text: '='
    },
    link: function (scope, element) {
      var client = new ZeroClipboard(element)
      client.on("copy", function (event) {
        var clipboard = event.clipboardData;
        clipboard.setData("text/plain", scope.text)
      })
      // FIXME: dirty workaround for ZeroClipboard & Bootstrap Tooltip issue
      // https://github.com/zeroclipboard/zeroclipboard/issues/369
      if(element.data('toggle') === 'tooltip') {
        $('#global-zeroclipboard-html-bridge').tooltip({
          title: element.attr('title'),
          placement: element.data('placement')
        })
        // disable original title
        element.removeAttr('title')
      }
    }
  }
})