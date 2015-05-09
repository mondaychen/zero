'use strict';

var app = angular.module('zeroApp')

app.controller('MainCtrl', ['ieVersion', 'InfoCollection', 'notification',
  'Messager', 'hotkeys',
  '$scope', '$http', '$location', '$resource', '$filter',
  function (ieVersion, InfoCollection, notification, Messager, hotkeys,
    $scope, $http, $location, $resource, $filter) {

  var votableLists = ['officePhone', 'mobilePhone', 'pagerNum', 'email', 'faxNum']
  var displayNames = {
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

  function formatName(keys, obj) {
    _.each(keys, function(key) {
      if(!_.isString(obj[key])) {
        return
      }
      obj[key] = obj[key].slice(0,1).toUpperCase()
        + obj[key].slice(1).toLowerCase()
    })
  }

  function getOrderedOutput(data) {
    var output = {}
    _.each(data, function(value, key) {
      output[key] = _.isObject(value) ? value.fieldValue : value
    })

    // generate full name
    formatName(['firstName', 'middleName', 'lastName'], output)
    output.fullName = makeStringByKeys(['firstName',
      'middleName', 'lastName'], output) || 'NAME NOT AVAILABLE'
    output.fullName = makeStringByKeys(['fullName', 'honor'], output, ', ')

    // generate addresses
    // var addresses = []
    // angular.forEach(output.addresses, function(address) {
    //   address.fullPostCode = makeStringByKeys(['addrState',
    //     'addrPostCode'], address)
    //   address.addrLine3 = makeStringByKeys(['addrCity',
    //     'fullPostCode'], address, ', ')
    //   addresses.push( _.chain(address).pick(['addrLine1', 'addrLine2', 'addrLine3'])
    //     .values().compact().value() )
    // })
    // // a duplicate-free version is needed for ngRepeat
    // output.addresses = _.uniq(_.map(addresses, function(add) {
    //   return add.join('<br>')
    // }))

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
        output[listName], displayNames[listName], data[listName].notes_history)
      // rank
      output[listName].sort()
    })

    return output
  }

  function getQuery() {
    var query  = "?"
    var keyMap = {
      "gacc": "accession",
      "gmrn": "mrn"
    }
    var search = _.clone($location.search())
    search.institution = search.institution || 'cornell'
    query += _.map(search, function(value, key) {
      if(keyMap[key]) {
        return keyMap[key] + "=" + value
      }
      return key + "=" + value
    }).join("&")

    return query
  }

  $scope.contacts = []
  $scope.person = {}

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
  $scope.swicthContact = function (step) {
    // only work in main view
    if($scope.viewStatus.currentView !== 'detail'
      || $scope.viewStatus.viewClass !== 'zero-main-view') {
      return
    }
    var idx = $scope.contacts.indexOf($scope.person) + step
    if($scope.contacts[idx]) {
      $scope.viewContact($scope.contacts[idx])
    }
  }

  $scope.$watch(function(){ return $location.search() }, function(params){
    if(_.size(params) === 0) {
      $scope.viewStatus.currentView = 'home'
      return
    }
    notification.show('Loading...')
    $scope.viewStatus.currentView = 'loading'

    var whenSuccess = function(data) {
      $scope.viewStatus.currentView = 'detail'
      notification.hide()
      // $scope.original_query_data = angular.copy(data);

      $scope.contacts = _.sortBy(_.map(data, function(person) {
         return getOrderedOutput(person)
      }), 'role')
      var existingCWID = {}
      $scope.contacts = _.reject($scope.contacts, function(contact) {
        if(existingCWID[contact.cwid]) {
          return true
        }
        existingCWID[contact.cwid] = true
        return false
      })
      $scope.viewContact($scope.contacts[0])
    }

    var whenError = function() {
      notification.show({
        msg: 'Failed to load data. Please try again later.',
        type: 'danger'
      })
      $scope.viewStatus.currentView = 'loadingError'
    }

    var urls = [
      {
        value: "/api/Providers/provider" + getQuery(),
        pretreat: function(data) {
          _.each(data, function(item) {
            if(item.role && !item.role.fieldValue) {
              item.role.fieldValue = 'ordering provider'
            }
          })
        }
      },
      {
        value: "/api/Providers/careTeam" + getQuery()
      }
    ]

    var mixture = []
    var resolve = _.after(urls.length, function() {
      if(mixture.length) {
        whenSuccess(mixture)
      } else {
        whenError()
      }
    })
    _.each(urls, function(url) {
      url.pretreat = url.pretreat || $.noop
      $http.get(url.value).success(function(data) {
        mixture = mixture.concat(data)
        url.pretreat(data)
        resolve()
      }).error(function() {
        resolve()
      })
    })
  })

  $scope.scheme = {
    'email'       : 'yellow',
    'faxNum'      : 'mint',
    'officePhone' : 'red',
    'mobilePhone' : 'blue',
    'pagerNum'    : 'green'
  }

  $scope.displayNames = displayNames

  var cssSupportTransition = !ieVersion || ieVersion > 9
  $scope.cssSupportTransition = $scope.cssSupportAnimation = cssSupportTransition

  $scope.viewStatus = {
    currentView: 'home',
    viewClass: 'zero-main-view',
    targetSubView: '',
    mainInfoView: $('#main-info'),
    subInfoView: $('#sub-info'),
    changeToSubView: function(category) {
      var viewClass = 'zero-sub-view'
      if(this.viewClass === viewClass) {
        return
      }
      this.viewClass = viewClass
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
      var viewClass = 'zero-main-view'
      if(self.viewClass === viewClass) {
        return
      }
      self.subInfoView.removeClass('show')
      var delayTime = cssSupportTransition ? 600: 1
      _.delay(function() {
        self.targetSubView = ''
        self.subInfoView.hide()
        self.mainInfoView.show()
        _.delay(function() {
          self.viewClass = viewClass
          $scope.$apply()
        }, 20)
      }, delayTime)
    }
  }

  $scope.$watch('person', function() {
    $scope.viewStatus.changeToMainView()
  })

  $scope.clipboardText = function() {
    return "Findings discussed with " + $scope.person.fullName + " at "
      + $filter('date')(new Date(), 'short')
  }

  $scope.pager = new Messager($('#pager-box'), {
    limit: 240,
    initialize: function(container, number) {
      container.find('input[name="number"]').val(number || '')
        .attr('readonly', !!number)
    },
    url: '/api/Providers/message/page/:number/:message/'
  })
  $scope.SMS = new Messager($('#SMS-box'), {
    limit: 1600,
    initialize: function(container, number) {
      container.find('input[name="toPhone"]').val(number || '')
        .attr('readonly', !!number)
    },
    url: '/api/Providers/message/sms/:toPhone/:message/'
  })

  // hotkeys
  hotkeys.bindTo($scope)
    .add({
      combo: 'up',
      description: 'Navigate to previous contact',
      callback: function(e) {
        if(e.preventDefault) {
          e.preventDefault()
        } else {
          e.returnValue = false
        }
        $scope.swicthContact(-1)
      }
    })
    .add({
      combo: 'down',
      description: 'Navigate to next contact',
      callback: function(e) {
        if(e.preventDefault) {
          e.preventDefault()
        } else {
          e.returnValue = false
        }
        $scope.swicthContact(+1)
      }
    })
    .add({
      combo: 's',
      description: 'Send message to the top mobile phone number',
      callback: function(e) {
        var number = $scope.person.mobilePhone.get(0)
          && $scope.person.mobilePhone.get(0).number
        $scope.SMS.show(number || null)
      }
    })
    .add({
      combo: 'p',
      description: 'Send page to the top pager number',
      callback: function(e) {
        var number = $scope.person.pagerNum.get(0)
          && $scope.person.pagerNum.get(0).number
        $scope.pager.show(number || null)
      }
    })

}])
