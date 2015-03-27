angular.module('zeroApp').directive('infoItems', ['ieVersion',
  function(ieVersion) {
  return {
    restrict: 'A', // for IE 8
    scope: {
      items: '=',
      type: '=',
      isExtended: '=extended'
    },
    templateUrl: 'app/main/components/info_items.html',
    link: function(scope, element) {
      scope.submitNewItem = function() {
        if (scope.newItem) {
          scope.items.add(scope.newItem, {
            whenSuccess: function() {
              scope.newItem = ''
            }
          })
        }
      }
      scope.submitNewNote = function() {
        if (scope.newNote) {
          scope.items.notes.push(scope.newNote)
          scope.newNote = ''
        }
      }
      scope.vote = function(e, item, value) {
        if(item.voteStatus == value) {
          item.update({voteStatus: 0})
          return
        }
        item.update({voteStatus: value})
        // fix rendering for IE 8
        if(!ieVersion || ieVersion > 8) {
          return
        }
        _.defer(function() {
          $(e.currentTarget).parent().children().each(function() {
            this.className = this.className
            this.focus()
          })
          e.currentTarget.focus()
        })
      }
    }
  }
}])