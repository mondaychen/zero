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
    }
  }
})