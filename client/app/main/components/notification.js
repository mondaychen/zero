angular.module('zeroApp').factory('notification', function() {
  var container = $('#notification-bar')
  var msgBox = container.find('.message')
  var content = container.find('.content')
  var closeBtn = container.find('.close')
  var timeoutID

  var alertClass = 'alert-info'
  msgBox.addClass(alertClass)

  var notification = {
    show: function(data, timeout) {
      if(_.isString(data)) {
        data = {
          msg: data,
          type: 'info'
        }
      }
      if(timeoutID) {
        clearTimeout(timeoutID)
      }
      content.text(data.msg || '')
      msgBox.removeClass(alertClass)
      alertClass = 'alert-' + data.type
      msgBox.addClass(alertClass)
      container.addClass('show')
      if(timeout) {
        timeoutID = setTimeout(notification.hide, timeout);
      }
    },
    hide: function() {
      if(timeoutID) {
        clearTimeout(timeoutID)
      }
      container.removeClass('show')
    }
  }

  closeBtn.click(notification.hide)

  return notification
})