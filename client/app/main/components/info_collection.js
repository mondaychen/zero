angular.module('zeroApp').factory('InfoCollection', ['$http', function($http) {

  var postVote = (function() {
    var defaultParams = {
      category: 'phone', // or 'email'
      type: null, // null for 'email', string for 'phone'
      upvotes: 0,
      downvotes: 0,
      isNew: false
    }
    var urlPattern = '/2.0/zero/phone/:type/:value/:isNew/:upvotes/:downvotes/'
    return function(params) {
      params = _.defaults(params, defaultParams)
      var url = urlPattern.replace(/\:.+?\//g, function($1) {
        var key = $1.slice(1, $1.length - 1)
        if(params[key] === null || _.isUndefined(params[key])
          || params[key] === '') {
          return ''
        }
        return params[key] + '/'
      })
      $http.post(url).success(function() {
        // console.log(arguments)
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
      "upvotes": 0,
      "downvotes": 0,
      "isNew": true,
      "voteStatus": 0,
      update: function(data) {
        self.update(this, data)
      }
    }
    data = _.extend(dft, data)
    switch(self.name) {
      case 'officePhone': data.category = 'phone'; data.type = 'office'; break;
      case 'mobilePhone': data.category = 'phone'; data.type = 'mobile'; break;
      case 'faxNum':      data.category = 'phone'; data.type = 'fax';    break;
      case 'pagerNum':    data.category = 'phone'; data.type = 'pager';  break;
      case 'email':       data.category = 'email'; data.type = null;     break;
      default: break;
    }
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
        score += item.isNew ? 100 : 0
        score += item.lastVoted ? 1000 : 0
      }
      return -score
    })
  }

  InfoCollection.prototype._updateItem = function(item, preventRequest) {
    var params = {}
    // set to 0 for initially
    item.oldVoteStatus = _.isUndefined(item.oldVoteStatus)
      ? item.voteStatus : item.oldVoteStatus
    if(item.oldVoteStatus == 1) {
      item.upvotes--
      params.upvotes = -1
    }
    if(item.oldVoteStatus == -1) {
      item.downvotes--
      params.downvotes = -1
      if(item.wasNew) {
        item.wasNew = false
        item.isNew = true
      }
    }
    // upvote
    if(item.voteStatus == 1) {
      item.upvotes++
      params.upvotes = 1
    }
    // down vote
    if(item.voteStatus == -1) {
      item.downvotes++
      params.downvotes = 1
      if(item.isNew) {
        item.wasNew = true
      }
      item.isNew = false
    }
    
    if(!preventRequest) {
      params.isNew = item.isNew
      params.category = item.category
      params.type = item.type
      postVote(params)
    }

    item.score = item.upvotes - item.downvotes
    item.isRecommended = item.score > 7
    item.isHighlight = item.score > 0
    item.oldVoteStatus = item.voteStatus
  }

  return InfoCollection
}])