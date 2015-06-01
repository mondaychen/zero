angular.module('zeroApp').factory('Messager',
  ['urlMaker', '$http', '$timeout', function(urlMaker, $http, $timeout) {
    function Messager (el, options) {
      var self = this
      this.msgBox = el
      this.msgInput = this.msgBox.find('textarea')

      this.url = urlMaker(options.url)
      this.initialize = options.initialize || $.noop

      function autofocus () {
        self.msgBox.find('[autofocus]').not('[readonly]').eq(0).focus()
      }

      // attributes for angular
      this.message = ''
      this.success = false
      this.failed = false
      this.lengthLimit = options.limit || 0
      this.pending = false

      this._data = null

      // initialize bootstrap modal
      this.msgBox.on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var data = button.data()
        _.extend(data, this._data)
        self.initialize(self.msgBox, data)
        self._data = null
      }).on('shown.bs.modal', function (event) {
        autofocus()
      })

      var timeoutId

      this.submit = function(e) {
        if(!self.message
          || (self.lengthLimit && self.message.length > self.lengthLimit)) {
          return
        }
        self.pending = true
        $timeout.cancel(timeoutId)
        self.success = false
        self.failed = false
        var params = { message: encodeURIComponent(self.message) }
        self.msgBox.find('[name]').each(function() {
          var dom = $(this)
          params[dom.attr('name')] = dom.val()
        })
        $http.post(self.url(params)).success(function() {
          $timeout.cancel(timeoutId)
          self.success = true
          self.message = ''
          timeoutId = $timeout(function() {
            self.success = false
          }, 3000)
        }).error(function() {
          self.failed = true
        }).then(function() {
          self.pending = false
          autofocus()
        })
      }
    }

    _.extend(Messager.prototype, {
      show: function(data) {
        this._data = data
        this.msgBox.modal()
      }
    })

    return Messager
  }])