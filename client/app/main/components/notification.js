angular.module('zeroApp').factory('notification', function() {
  var container = $('#notification-bar')
  var content = container.find('.content')
  var closeBtn = container.find('.close-msg')

  var notification = {
    show: function(msg) {
      content.text(msg || '')
      container.addClass('show')
    },
    hide: function() {
      container.removeClass('show')
    }
  }

  closeBtn.click(notification.hide)

  return notification
})