angular.module('zeroApp').factory('Messager',
  function() {
    function Messager (scope) {
      var self = this
      this.scope = scope
      this.types = {}
      this.msgBox = $('#msg-box')
      this.numberInput = this.msgBox.find('input[name="number"]')
      this.msgInput = this.msgBox.find('textarea')
      // initialize bootstrap modal
      this.msgBox.on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget)
        var number = button.data('number')
        var type = button.data('type')

        self.open(type, number)
      })
      // attributes for angular
      this.message = ''
      this.displayName = ''
      this.success = false
      this.failed = false
      this.lengthLimit = 0
      this.submit = function() {
        if(!this.message
          || (this.lengthLimit && this.message.length > this.lengthLimit)) {
          return
        }
        // TODO send the message
        // change this.success & this.failed after the response
        this.message = ''
      }
    }

    _.extend(Messager.prototype, {
      addType: function(name, options) {
        this.types[name] = {
          limit: options.limit || 0,
          displayName: (options.displayName + ' ') || ''
        }
        return this
      },
      open: function(type, number) {
        if(number) {
          this.numberInput.val(number).attr('readonly', true)
        }
        if(type && this.types[type]) {
          this.lengthLimit = this.types[type].limit
          this.displayName = this.types[type].displayName
        }
        this.message = ''
        this.msgInput.focus()
        this.success = false
        this.failed = false
        if(this.scope) {
          this.scope.$apply()
        }
      }
    })

    return Messager
  })