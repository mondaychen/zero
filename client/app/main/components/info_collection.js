angular.module('zeroApp').factory('InfoCollection',
  ['notification', 'urlMaker' ,'$http',
  function(notification, urlMaker, $http) {

  var postVote = (function() {
    var defaultParams = {
      category: 'phone', // or 'email'
      type: null, // null for 'email', string for 'phone'
      upVotes: 0,
      downVotes: 0,
      hasNew: false
    }
    var urlPattern = '/api/Providers/:category/:type/:value/:hasNew/:upVotes/:downVotes/:provider_id/'
    var origin = 'http://kurtteichman.com:9000'
    var url = urlMaker(urlPattern, origin, defaultParams)
    return function(params, whenSuccess, whenError) {
      whenSuccess = _.isFunction(whenSuccess) ? whenSuccess : $.noop
      whenError = _.isFunction(whenError) ? whenError : $.noop
      notification.show('Voting for' + params.value + '...')
      $http.post(url(params)).success(function() {
        notification.show('Successfully voted for ' + params.value, 2500)
        whenSuccess(arguments)
      }).error(function() {
        notification.show('Failed to make the vote for ' + params.value, 4000)
        whenError(arguments)
      })
    }
  })()

  function InfoCollection (name, id, initialArr, displayName) {
    this.name = name
    this.id = id
    this.displayName = displayName
    initialArr = initialArr || []
    this.initialArr = _.isArray(initialArr) ? initialArr : [initialArr]

    this._init()
  }

  InfoCollection.prototype._init = function() {
    var self = this
    self.collection = []
    _.each(this.initialArr, function(item) {
      self.add(item, true)
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

  InfoCollection.prototype.add = function(data, local) {
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
    this._updateItem(data, local)
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

  InfoCollection.prototype._updateItem = function(item, local) {
    var self = this
    // set to 0 initially
    item.oldVoteStatus = _.isUndefined(item.oldVoteStatus)
      ? item.voteStatus : item.oldVoteStatus
    var params = _.clone(item)
    params.upVotes = params.downVotes = 0
    if(params.oldVoteStatus == 1) {
      params.upVotes = -1
    }
    if(params.oldVoteStatus == -1) {
      params.downVotes = -1
      if(params.wasNew) {
        params.wasNew = false
        params.hasNew = true
      }
    }
    // upvote
    if(params.voteStatus == 1) {
      params.upVotes = 1
    }
    // down vote
    if(params.voteStatus == -1) {
      params.downVotes = 1
      if(params.hasNew) {
        params.wasNew = true
      }
      params.hasNew = false
    }

    var updateLocalStatus = function() {
      item.upVotes += params.upVotes
      item.downVotes += params.downVotes
      item.wasNew = params.wasNew
      item.hasNew = params.hasNew
      item.score = item.upVotes - item.downVotes
      item.isRecommended = item.score > 7
      item.isHighlight = item.score > 0
      item.oldVoteStatus = item.voteStatus
    }
    
    if(!local) {
      params.provider_id = self.id
      postVote(params, updateLocalStatus, function() {
        item.voteStatus = item.oldVoteStatus
      })
    } else {
      updateLocalStatus()
    }
  }

  return InfoCollection
}])