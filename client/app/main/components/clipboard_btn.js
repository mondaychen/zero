angular.module('zeroApp').directive('clipboardButton', function() {
  return {
    restrict: 'A', // for IE 8
    scope: {
      text: '='
    },
    link: function (scope, element) {
      var client = new ZeroClipboard(element)

      var tooltipOptions = {
        title: element.attr('title'),
        placement: element.data('placement')
      }

      client.on('error', function() {
        // for IE
        if(window.clipboardData) {
          element.click(function(e) {
            window.clipboardData.setData('Text', scope.text) 
          })
          element.tooltip(tooltipOptions)
        } else {
          element.hide()
        }
        ZeroClipboard.destroy()
      })

      client.on('ready', function() {
        client.on("copy", function (event) {
          var clipboard = event.clipboardData;
          clipboard.setData("text/plain", scope.text)
        })
        // FIXME: dirty workaround for ZeroClipboard & Bootstrap Tooltip issue
        // https://github.com/zeroclipboard/zeroclipboard/issues/369
        if(element.data('toggle') === 'tooltip') {
          $('#global-zeroclipboard-html-bridge').tooltip(tooltipOptions)
          // disable original title
          element.removeAttr('title')
        }
      })

    }
  }
})