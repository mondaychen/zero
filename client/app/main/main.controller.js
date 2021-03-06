'use strict';

var app = angular.module('zeroApp')

app.controller('MainCtrl', ['ieVersion', 'InfoCollection', 'notification',
  'Messager', 'hotkeys',
  '$scope', '$http', '$location', '$resource', '$filter','$q',
  function (ieVersion, InfoCollection, notification, Messager, hotkeys,
    $scope, $http, $location, $resource, $filter, $q) {

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
      "gmrn": "mrn",
      "email": "email"
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
      notification.hide();
      // $scope.original_query_data = angular.copy(data);

      /*
      $scope.contacts = _.sortBy(_.map(data, function(person) {
         return getOrderedOutput(person);
      }), 'role');
      */
      var temp_array = _.map(data,function(person) {
        return getOrderedOutput(person);
      });

      // if there is a careteam
      if (temp_array.length > 0) {
        temp_array = [temp_array[0]].concat(_.sortBy(temp_array.slice(1),'role'));
        // TODO check to see if the order provider exists in the careTeam
      }

      $scope.contacts = temp_array;

      var existingCWID = {}
      $scope.contacts = _.reject($scope.contacts, function(contact) {
        if(existingCWID[contact.cwid]) {
          return true
        }
        existingCWID[contact.cwid] = true
        return false
      });

      // added specifically for the james request
      if (_.has(params,'email')) {
        for (var i = 0; i < $scope.contacts.length; i++) {
          for (var x = 0; x < $scope.contacts[i]['email']['collection'].length; x++) {
            if ($scope.contacts[i]['email']['collection'][x]['email'].toLowerCase() == params['email'].toLowerCase()) {
              $scope.viewContact($scope.contacts[i]);
              break;
            }
          }
        }
      } else {
        $scope.viewContact($scope.contacts[0]);
      }
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
              item.role.fieldValue = 'ordering provider ' + data[0]['orderPagerNum']['fieldValue'];
            }
          })
        }
      },
      {
        value: "/api/Providers/careTeam" + getQuery()
      },
      {
        value: "/api/Providers/providerByEmail" + getQuery()
      }
    ];

    var resolve = _.after(urls.length, function() {
      if(mixture.length) {
        whenSuccess(mixture);
      } else {
        whenError();
      }
    });

    var requests = _.map(urls, function(url_object) {
      var deferred = $q.defer();
      url_object.pretreat = url_object.pretreat || $.noop;
      $http.get(url_object.value)
        .success(function(data) {
          url_object.pretreat(data);
          deferred.resolve(data);
        })
        .error(function(data) {
          url_object.pretreat(data);
          deferred.resolve(data);
        });
      return deferred.promise;
    });

    $q.all(requests)
    .then(function(resolved_data_array){
      //console.log(resolved_data_array);
      //var flattened_arrays = _.flatten(resolved_data_array);
      var flattened_data = _.flatten(resolved_data_array);
      //console.log(flattened_data);
      var provider       = flattened_data[0];
      var provider_name  = (provider.firstName.fieldValue + " " + provider.lastName.fieldValue).toLowerCase();

      var temp           = null;
      var temp_name      = null;
      for (var i = 1; i < flattened_data.length; i++) {
        temp = flattened_data[i];
        temp_name = (temp.firstName.fieldValue + " " + temp.lastName.fieldValue).toLowerCase()
        if (provider_name === temp_name) {
          /*
          console.log(provider_name);
          console.log(temp_name);
          console.log('TRUE');
          console.log(temp);
          */
          provider.role.fieldValue = temp.role.fieldValue + " & " + provider.role.fieldValue;
        }
      }

      whenSuccess(_.flatten(resolved_data_array));
      //console.log(resolved_data_array);
    });
    /*
    _.each(urls, function(url) {
      url.pretreat = url.pretreat || $.noop;
      $http.get(url.value).success(function(data) {
        mixture = mixture.concat(data)
        url.pretreat(data);
        resolve();
      })
      .error(function() {
        resolve();
      });
    });
    */
    $.post('/stats', {application:"zero", action:"providerQuery"});
  });

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
          $('html, body').animate({
            scrollTop: self.subInfoView.offset().top
          }, 100);
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
    initialize: function(container, data) {
      container.find('input[name="number"]').val(data.number || '')
        .attr('readonly', !!data.number)
    },
    url: '/api/Providers/message/page/:number/:message/',
    type: 'pager'
  })
  $scope.SMS = new Messager($('#SMS-box'), {
    limit: 1600,
    initialize: function(container, data) {
      container.find('input[name="toPhone"]').val(data.number || '')
        .attr('readonly', !!data.number)
    },
    url: '/api/Providers/message/sms/:toPhone/:message/',
    type:'SMS'
  })
  $scope.email = new Messager($('#email-box'), {
    initialize: function(container, data) {
      container.find('input[name="toEmail"]').val(data.email || '')
        .attr('readonly', !!data.email)
      var mailtoConatiner = container.find('.mailto')
      if(data.email) {
        mailtoConatiner
          .html('<a href="mailto:@">Launch full Email application for @</a>'
            .replace(/\@/g, data.email)).show()
      } else {
        mailtoConatiner.hide()
      }
    },
    url: '/api/Providers/message/email/:fromEmail/:toEmail/:message/',
    type:'email'
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
        $scope.SMS.show({number: number || null})
      }
    })
    .add({
      combo: 'p',
      description: 'Send page to the top pager number',
      callback: function(e) {
        var number = $scope.person.pagerNum.get(0)
          && $scope.person.pagerNum.get(0).number
        $scope.pager.show({number: number || null})
      }
    })
    .add({
      combo: 'e',
      description: 'Send Email to the top Email address',
      callback: function(e) {
        var email = $scope.person.email.get(0)
          && $scope.person.email.get(0).email
        $scope.email.show({email: email || null})
      }
    })
}])