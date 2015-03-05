'use strict';

var app = angular.module('zeroApp')

app.ieVersion = (function () {
  var v = 4
  var div = document.createElement('div')
  var i = div.getElementsByTagName('i')
  do {
      div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->'
  } while (i[0])
  return v > 5 ? v : false
})()

app.config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});

app.run(function($httpBackend) {

  var regForBackend = /^\/2.0\/zero\/getProvider/i;

  $httpBackend.whenGET(regForBackend).respond(function(method,url,data) {
    return [200
      , [
        {"addresses":[{"addrPostCode":"100218722","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"425 E 61ST ST","addrLine2":"11TH FLOOR","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10009","locTypeCode":"New York","locName":null,"addrLine1":"425 East 13th Street,","addrLine2":null,"addrState":"NY","addrCity":"New York"},{"addrPostCode":"100214870","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"525 E 68TH ST","addrLine2":"J-130","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10021","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"505 EAST 70TH STREET, HT582","addrLine2":"HT 582","addrState":"NY","addrCity":"NEW YORK"}],"NPI":"1235160458","mobilePhone":["9176262564"],"firstName":"LONA","middleName":null,"lastName":"PRASAD","pagerNum":[],"faxNum":["2127468717"],"contactPreference":"email","email":["lop9006@direct.weillcornell.org","lop9006@med.cornell.edu"],"officePhone":["2128210974","2127463000","2127464159","2127462640"]}
      , {"addresses":[{"addrPostCode":"10016","locTypeCode":"New York","locName":null,"addrLine1":"121 East 31st Street, Apt 8b","addrLine2":null,"addrState":"NY","addrCity":"New York"},{"addrPostCode":"111022448","locTypeCode":"LONG ISLAND CITY","locName":"Practice Address","addrLine1":"2510 30TH AVE","addrLine2":null,"addrState":"NY","addrCity":"LONG ISLAND CITY"},{"addrPostCode":"10065","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"525 EAST 68TH STREET","addrLine2":null,"addrState":"NY","addrCity":"NEW YORK"}],"NPI":null,"mobilePhone":["9177161603"],"firstName":"STEPHEN","middleName":"James","lastName":"WEBSTER","pagerNum":[],"faxNum":["2127464883"],"contactPreference":"email","email":["bizsjw@yahoo.com"],"officePhone":["7182674285","2127460780"]}
      , {"addresses":[{"addrPostCode":"10021","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"261 EAST 78 STREET","addrLine2":null,"addrState":"NY","addrCity":"NEW YORK"}],"NPI":"1194896365","mobilePhone":[],"firstName":"KETLY","middleName":null,"lastName":"MICHEL","pagerNum":[],"faxNum":["2122494517"],"contactPreference":"officePhone","email":[],"officePhone":["2122494501","2127462142"]}
      ]
      , {}]
  });

  $httpBackend.whenGET(/^\S/).passThrough();

})

app.controller('MainCtrl', function ($scope, $http, $location, $resource) {

  var votableLists = ['officePhone', 'mobilePhone', 'pagerNum', 'email', 'faxNum']

  function makeStringByKeys(keys, obj, separator) {
    separator = separator || ' '
    return _.chain(obj).pick(keys).values().compact().value().join(separator)
  }

  function InfoCollection (name, initialArr) {
    this.name = name
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
    this._updateItem(data)
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

  InfoCollection.prototype._updateItem = function(item) {
    item.oldVoteStatus = _.isUndefined(item.oldVoteStatus)
      ? item.voteStatus : item.oldVoteStatus
    if(item.oldVoteStatus == 1) {
      item.upvotes--
    }
    if(item.oldVoteStatus == -1) {
      item.downvotes--
    }
    if(item.voteStatus == 1) {
      item.upvotes++
    }
    if(item.voteStatus == -1) {
      item.downvotes++
    }
    item.score = item.upvotes - item.downvotes
    item.isRecommended = item.score > 7
    item.isHighlight = item.score > 0
    item.oldVoteStatus = item.voteStatus
  }

  function getOrderedOutput(data) {
    var output = {
        'fullName'    : '',
        'firstName'   : '',
        'lastName'    : '',
        'middleName'  : '',
        'NPI'         : '',
        'contactPreference' : '',
        'email'       : [],
        'faxNum'      : [],
        'officePhone' : [],
        'mobilePhone' : [],
        'pagerNum'    : [],
        'addresses'   : []
    };

    output = _.extend(output, data)

    // generate full name
    output.fullName = makeStringByKeys(['firstName',
      'middleName', 'lastName'], output) || 'NAME NOT AVAILABLE'

    // generate addresses
    var addresses = []
    angular.forEach(output.addresses, function(address) {
      address.fullPostCode = makeStringByKeys(['addrState',
        'addrPostCode'], address)
      address.addrLine3 = makeStringByKeys(['addrCity',
        'fullPostCode'], address, ', ')
      addresses.push( _.chain(address).pick(['addrLine1', 'addrLine2', 'addrLine3'])
        .values().compact().value() )
    })
    output.addresses = _.map(addresses, function(add) {
      return add.join('<br>')
    })

    // generate numbers
    _.forEach(votableLists, function(listName) {
      output[listName] = _.map(output[listName], function(item) {
        var rtn = {
          value: item,
          upvotes: _.random(0, 8),
          downvotes: _.random(0, 3)
        }
        rtn.isNew = (_.random(30) < 2)
        rtn.lastVoted = (_.random(15) < 2) ? _.now(): null
        rtn.voteStatus = 0
        return rtn
      })
      // make instance
      output[listName] = new InfoCollection(listName, output[listName])
      // rank
      output[listName].sort()
    })

    delete output['NPI'];
    delete output['firstName'];
    delete output['lastName'];
    delete output['middleName'];

    return output;
  }

  function getQuery() {
    var query  = "?institution=cornell&";
    var count  = 0;
    var keyMap = {
      "gacc":"accession",
      "gmrn":"mrn"
    };

    angular.forEach($location.search(), function(value,key) {
      query += String(keyMap[key]) + "=" + String(value) + "&";
      count++;
    });

    if (count > 1) {
      query = query.slice(0,query.length -1)
    }

    return query;
  }

  $scope.contacts = []
  $scope.person = {}

  var Contacts = $resource('/2.0/zero/getProvider', {
    institution: 'cornell'
  })
  var contacts = Contacts.query({}, function() {
    console.log(contacts)
  })

  $scope.$watch(function(){ return $location.search() }, function(params){

    $http.get('/2.0/zero/getProvider' + getQuery())
    .success(function(data) {
      $scope.original_query_data = angular.copy(data);

      $scope.contacts = _.map(data, function(person) {
         return getOrderedOutput(person)
      })
      $scope.viewContact = function (contact) {
        if(contact.active) {
          return
        }
        _.each($scope.contacts, function(one) {
          one.active = false
        })
        contact.active = true
        $scope.person = contact
      }
      $scope.viewContact($scope.contacts[0])
    })
  });


  $scope.scheme = {
    'email'       : 'yellow',
    'faxNum'      : 'mint',
    'officePhone' : 'red',
    'mobilePhone' : 'blue',
    'pagerNum'    : 'green'
  }

  $scope.dispalyNames = {
    'email'       : 'Email',
    'faxNum'      : 'Fax',
    'officePhone' : 'Office Phone',
    'mobilePhone' : 'Mobile Phone',
    'pagerNum'    : 'Pager'
  }

  var cssSupportTransition = app.ieVersion > 9

  $scope.viewStatus = {
    viewClass: 'zero-main-view',
    targetSubView: '',
    mainInfoView: $('#main-info'),
    subInfoView: $('#sub-info'),
    changeToSubView: function(category) {
      this.viewClass = 'zero-sub-view'
      this.targetSubView = category
      var delayTime = cssSupportTransition ? 800: 1
      _.delay(function(self) {
        self.mainInfoView.hide()
        self.subInfoView.show()
        _.delay(function() {
          self.subInfoView.addClass('show')
        }, 20)
      }, delayTime, this)
    },
    changeToMainView: function() {
      var self = this
      self.subInfoView.removeClass('show')
      var delayTime = cssSupportTransition ? 600: 1
      _.delay(function() {
        self.targetSubView = ''
        self.subInfoView.hide()
        self.mainInfoView.show()
        _.delay(function() {
          self.viewClass = 'zero-main-view'
          $scope.$apply()
        }, 20)
      }, delayTime)
    }
  }

});


app.directive('infoItems', function() {
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
          scope.items.add(scope.newItem)
          scope.newItem = ''
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
        if(!app.ieVersion || app.ieVersion > 8) {
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
})