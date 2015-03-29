'use strict';

var app = angular.module('zeroApp')

app.controller('MainCtrl', ['ieVersion', 'InfoCollection', 'notification',
  '$scope', '$http', '$location', '$resource',
  function (ieVersion, InfoCollection, notification,
    $scope, $http, $location, $resource) {

  var votableLists = ['officePhone', 'mobilePhone', 'pagerNum', 'email', 'faxNum']
  var dispalyNames = {
    'email'       : 'Email',
    'faxNum'      : 'Fax',
    'officePhone' : 'Office Phone',
    'mobilePhone' : 'Mobile Phone',
    'pagerNum'    : 'Pager'
  }

  function makeStringByKeys(keys, obj, separator) {
    separator = separator || ' '
    return _.chain(obj).pick(keys).values().compact().value().join(separator)
  }

  function getOrderedOutput(data) {
    var output = {}
    _.each(data, function(value, key) {
      output[key] = _.isObject(value) ? value.fieldValue : value
    })

    // generate full name
    output.fullName = makeStringByKeys(['firstName',
      'middleName', 'lastName'], output) || 'NAME NOT AVAILABLE'
    output.fullName = makeStringByKeys(['fullName', 'honor'], output, ', ')

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
    // a duplicate-free version is needed for ngRepeat
    output.addresses = _.uniq(_.map(addresses, function(add) {
      return add.join('<br>')
    }))

    // generate numbers
    _.forEach(votableLists, function(listName) {
      output[listName] = _.map(output[listName], function(item) {
        var rtn = {
          value: item.number || item.email,
          upVotes: item.upVotes,
          downVotes: item.downVotes
        }
        item.value = item.number || item.email
        // rtn.lastVoted = (_.random(15) < 2) ? _.now(): null
        item.voteStatus = 0
        return item
      })
      // make instance
      output[listName] = new InfoCollection(listName, output._id,
        output[listName], dispalyNames[listName])
      // rank
      output[listName].sort()
    })

    return output
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

  $scope.$watch(function(){ return $location.search() }, function(params){
    notification.show('Loading...')

    // $http.get('/2.0/zero/getProvider' + getQuery())
    // $http.get("http://kurtteichman.com:9000/api/Providers/careTeam?institution=columbia&mrn=1863656")
    $http.get("http://localhost:9000/assets/test_careTeam.json")
    .success(function(data) {
      notification.hide()
      $scope.original_query_data = angular.copy(data);

      $scope.contacts = _.sortBy(_.map(data, function(person) {
         return getOrderedOutput(person)
      }), 'role')
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
    }).error(function() {
      notification.show('Failed to load data. Please try again later.')
    })
  });


  $scope.scheme = {
    'email'       : 'yellow',
    'faxNum'      : 'mint',
    'officePhone' : 'red',
    'mobilePhone' : 'blue',
    'pagerNum'    : 'green'
  }

  $scope.dispalyNames = dispalyNames

  var cssSupportTransition = !ieVersion || ieVersion > 9

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

}])