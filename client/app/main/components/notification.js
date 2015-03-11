angular.module('zeroApp').factory('notification', function() {
  var container = $('#notification-bar')
  var content = container.find('.content')
  var closeBtn = container.find('.close-msg')
  var timeoutID

  var notification = {
    show: function(msg, timeout) {
      if(timeoutID) {
        clearTimeout(timeoutID)
      }
      content.text(msg || '')
      container.addClass('show')
      if(timeout) {
        timeoutID = setTimeout(notification.hide, timeout);
      }
    },
    hide: function() {
      container.removeClass('show')
    }
  }

  closeBtn.click(notification.hide)

  return notification
})