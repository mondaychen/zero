angular.module('zeroApp').factory('InfoCollection',
  ['notification' ,'$http', function(notification, $http) {

  var isPending = false

  var postVote = (function() {
    var defaultParams = {
      category: 'phone', // or 'email'
      type: null, // null for 'email', string for 'phone'
      upVotes: 0,
      downVotes: 0,
      hasNew: false
    }
    var urlPattern = '/api/Providers/:category/:type/:value/:hasNew/:upVotes/:downVotes/'
    return function(params, whenSuccess, whenError) {
      params = _.defaults(params, defaultParams)
      whenSuccess = _.isFunction(whenSuccess) ? whenSuccess : $.noop
      whenError = _.isFunction(whenError) ? whenError : $.noop
      var url = urlPattern.replace(/\:.+?\//g, function($1) {
        var key = $1.slice(1, $1.length - 1)
        if(params[key] === null || _.isUndefined(params[key])
          || params[key] === '') {
          return ''
        }
        return params[key] + '/'
      })
      notification.show('Voting for' + params.value + '...')
      isPending = true
      $http.post('http://kurtteichman.com:9000' + url).success(function() {
        isPending = false
        whenSuccess(arguments)
      }).error(function() {
        isPending = false
        whenError(arguments)
      })
    }
  })()

  function InfoCollection (name, initialArr, displayName) {
    this.name = name
    this.displayName = displayName
    initialArr = initialArr || []
    this.initialArr = _.isArray(initialArr) ? initialArr : [initialArr]

    this._init()
  }

  InfoCollection.prototype._init = function() {
    var self = this
    self.collection = []
    _.each(this.initialArr, function(item) {
      self.add(item)
    })

    self.notes = []
  }

  InfoCollection.prototype._makeObj = function(data) {
    if(_.isString(data)) {
      data = {
        value: data
      }
    }
    return data
  }

  InfoCollection.prototype.add = function(data) {
    var self = this
    data = this._makeObj(data)
    var dft = {
      "value": '',
      "upVotes": 0,
      "downVotes": 0,
      "hasNew": true,
      "voteStatus": 0,
      update: function(data) {
        self.update(this, data)
      }
    }
    data = _.extend(dft, data)
    data.type = self.name === 'email' ? null : self.name
    data.category = self.name === 'email' ? 'email' : 'phone'
    this._updateItem(data, true)
    this.collection.push(data)
  }

  InfoCollection.prototype.update = function(item, data) {
    data = this._makeObj(data)
    item = _.extend(item, data)
    this._updateItem(item)
  }

  InfoCollection.prototype.sort = function() {
    this.collection = _.sortBy(this.collection, function(item) {
      var score = item.score
      if (score > -1) {
        score += item.hasNew ? 100 : 0
        score += item.lastVoted ? 1000 : 0
      }
      return -score
    })
  }

  InfoCollection.prototype._updateItem = function(item, preventRequest) {
    var params = {}
    // set to 0 initially
    item.oldVoteStatus = _.isUndefined(item.oldVoteStatus)
      ? item.voteStatus : item.oldVoteStatus
    if(item.oldVoteStatus == 1) {
      item.upVotes--
      params.upVotes = -1
    }
    if(item.oldVoteStatus == -1) {
      item.downVotes--
      params.downVotes = -1
      if(item.wasNew) {
        item.wasNew = false
        item.hasNew = true
      }
    }
    // upvote
    if(item.voteStatus == 1) {
      item.upVotes++
      params.upVotes = 1
    }
    // down vote
    if(item.voteStatus == -1) {
      item.downVotes++
      params.downVotes = 1
      if(item.hasNew) {
        item.wasNew = true
      }
      item.hasNew = false
    }

    var updateLocalStatus = function() {
      item.score = item.upVotes - item.downVotes
      item.isRecommended = item.score > 7
      item.isHighlight = item.score > 0
      item.oldVoteStatus = item.voteStatus
    }
    
    if(!preventRequest) {
      params.hasNew = item.hasNew
      params.category = item.category
      params.type = item.type
      params.value = item.value
      postVote(params, updateLocalStatus)
    } else {
      updateLocalStatus()
    }
  }

  return InfoCollection
}])