angular.module('zeroApp').value('ieVersion', (function () {
  var v = 4
  var div = document.createElement('div')
  var i = div.getElementsByTagName('i')
  do {
      div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->'
  } while (i[0])
  return v > 5 ? v : false
})())