angular.module('zeroApp').factory('InfoCollection',
  ['notification', 'urlMaker' ,'$http',
  function(notification, urlMaker, $http) {

  function postMaker(url) {
    return function(params, options) {
      var whenSuccess = _.isFunction(options.whenSuccess)
        ? options.whenSuccess : $.noop
      var whenError = _.isFunction(options.whenError)
        ? options.whenError : $.noop
      notification.show(options.txtLoading)
      $http.post(url(params)).success(function() {
        notification.show(options.txtSuccess, options.timeSuccess || 2500)
        whenSuccess(arguments)
      }).error(function() {
        notification.show(options.txtFailed, options.timeFailed || 4000)
        whenError(arguments)
      })
    }
  }

  function InfoCollection (name, id, initialArr, displayName, notes) {
    this.name = name
    this.id = id
    this.displayName = displayName
    initialArr = initialArr || []
    this.initialArr = _.isArray(initialArr) ? initialArr : [initialArr]

    this.type = this.name === 'email' ? null : this.name
    this.category = this.name === 'email' ? 'email' : 'phone'

    this.note = notes.length ? notes[0] : ''

    this._init()
  }

  InfoCollection.prototype._init = function() {
    var self = this
    self.collection = []
    _.each(this.initialArr, function(item) {
      self.add(item, {
        local: true
      })
    })
  }

  InfoCollection.prototype._makeObj = function(data) {
    if(_.isString(data)) {
      data = {
        value: data
      }
    }
    return data
  }

  InfoCollection.prototype.add = function(data, options) {
    options = options || {}
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
    data.type = self.type
    data.category = self.category
    options.newAdded = !options.local
    this._updateItem(data, options)
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


  var postVote = (function() {
    var defaultParams = {
      category: 'phone', // or 'email'
      type: null, // null for 'email', string for 'phone'
      upVotes: 0,
      downVotes: 0,
      hasNew: false
    }
    var urlPattern = '/api/Providers/:category/:type/:value/:hasNew/:upVotes/:downVotes/:provider_id/:note/'
    var origin = 'http://kurtteichman.com:9000'
    var url = urlMaker(urlPattern, origin, defaultParams)
    return postMaker(url)
  })()

  InfoCollection.prototype._updateItem = function(item, options) {
    var self = this
    options = _.defaults(options || {}, {
      whenSuccess: $.noop,
      whenError: $.noop,
      local: false,
      newAdded: false
    })
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
      options.whenSuccess()
    }
    
    if(!options.local) {
      params.provider_id = self.id
      postVote(params, {
        whenSuccess: updateLocalStatus,
        whenError: function() {
          item.voteStatus = item.oldVoteStatus
          options.whenError()
        },
        txtLoading: (options.newAdded ? 'Adding ' : 'Voting for ')
          + params.value + '...',
        txtSuccess: 'Successfully '
          + (options.newAdded ? 'added: ' : 'voted for ') + params.value,
        txtFailed: 'Failed to '
          + (options.newAdded ? 'add: ' : 'vote for ') + params.value
      })
    } else {
      updateLocalStatus()
    }
  }

  var postNote = (function() {
    var defaultParams = {
      category: 'phone', // or 'email'
      type: null, // null for 'email', string for 'phone'
      upVotes: 0,
      downVotes: 0,
      hasNew: false
    }
    var urlPattern = '/api/Providers/:category/:type/:provider_id/:notes'
    var origin = 'http://kurtteichman.com:9000'
    var url = urlMaker(urlPattern, origin, defaultParams)
    return postMaker(url)
  })()

  InfoCollection.prototype.updateNote = function() {
    var params = {
      category: this.category,
      type: this.type,
      id: this.id,
      notes: this.note
    }
    postNote(params, {
      txtLoading: 'Submitting new note...',
      txtSuccess: 'Note updated successfully',
      txtFailed: 'Failed to submit the new note'
    })
  }

  return InfoCollection
}])