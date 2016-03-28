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
      this.type = options.type

      this._data = null

      if (this.type != 'email') {
        $http.get('/api/users/phoneByIP/').then(function (data) {
          self.message += (data.data['phone'] != undefined) ? data.data['phone'] : '';
          var elemLen = self.message.length;
        // For IE Only
          autofocus();
          if (document.selection) {
              // Set focus
              //elem.focus();
              // Use IE Ranges
              var oSel = document.selection.createRange();
              // Reset position to 0 & then set at end
              oSel.moveStart('character', -elemLen);
              oSel.moveStart('character', elemLen);
              oSel.moveEnd('character', 0);
              oSel.select();
          } else if (elem.selectionStart || elem.selectionStart == '0') {
              // Firefox/Chrome
              elem.selectionStart = elemLen;
              elem.selectionEnd = elemLen;
              elem.focus();
          }
        });
      }

      // initialize bootstrap modal
      this.msgBox.on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var data = button.data() || {}
        _.extend(data, self._data)
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
        var _always = function() {
          self.pending = false
          autofocus()
        }
        $http.post(self.url(params)).success(function() {
          $timeout.cancel(timeoutId)
          self.success = true
          self.message = ''
          timeoutId = $timeout(function() {
            self.success = false
          }, 3000)

          _always()
        }).error(function() {
          self.failed = true
          _always()
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