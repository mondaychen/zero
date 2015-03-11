'use strict';

var app = angular.module('zeroApp')



app.config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});

app.run(function($httpBackend) {

  var regForBackend = /^\/2.0\/zero\/getProvider/i;

  $httpBackend.whenGET(regForBackend).respond(function(method,url,data) {
    return [200
      , [
        {"addresses":[{"addrPostCode":"100218722","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"425 E 61ST ST","addrLine2":"11TH FLOOR","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10009","locTypeCode":"New York","locName":null,"addrLine1":"425 East 13th Street,","addrLine2":null,"addrState":"NY","addrCity":"New York"},{"addrPostCode":"100214870","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"525 E 68TH ST","addrLine2":"J-130","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10021","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"505 EAST 70TH STREET, HT582","addrLine2":"HT 582","addrState":"NY","addrCity":"NEW YORK"}],"NPI":"1235160458","mobilePhone":["9176262564"],"firstName":"LONA","middleName":null,"lastName":"PRASAD","pagerNum":["12312"],"faxNum":["2127468717"],"contactPreference":"email","email":["lop9006@direct.weillcornell.org","lop9006@med.cornell.edu"],"officePhone":["2128210974","2127463000","2127464159","2127462640"]}
      , {"addresses":[{"addrPostCode":"10016","locTypeCode":"New York","locName":null,"addrLine1":"121 East 31st Street, Apt 8b","addrLine2":null,"addrState":"NY","addrCity":"New York"},{"addrPostCode":"111022448","locTypeCode":"LONG ISLAND CITY","locName":"Practice Address","addrLine1":"2510 30TH AVE","addrLine2":null,"addrState":"NY","addrCity":"LONG ISLAND CITY"},{"addrPostCode":"10065","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"525 EAST 68TH STREET","addrLine2":null,"addrState":"NY","addrCity":"NEW YORK"}],"NPI":null,"mobilePhone":["9177161603"],"firstName":"STEPHEN","middleName":"James","lastName":"WEBSTER","pagerNum":[],"faxNum":["2127464883"],"contactPreference":"email","email":["bizsjw@yahoo.com"],"officePhone":["7182674285","2127460780"]}
      , {"addresses":[{"addrPostCode":"10021","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"261 EAST 78 STREET","addrLine2":null,"addrState":"NY","addrCity":"NEW YORK"}],"NPI":"1194896365","mobilePhone":[],"firstName":"KETLY","middleName":null,"lastName":"MICHEL","pagerNum":[],"faxNum":["2122494517"],"contactPreference":"officePhone","email":[],"officePhone":["2122494501","2127462142"]}
      ]
      , {}]
  });

  $httpBackend.whenPOST(/^\/2.0\/zero\/phone/i).respond(function(method,url,data) {
    console.log(url)
    return [200
      , {success: 1}
      , {}]
  });

  $httpBackend.whenGET(/^\S/).passThrough();
  $httpBackend.whenPOST(/^\S/).passThrough();

})

app.controller('MainCtrl', ['ieVersion', 'InfoCollection', '$scope',
  '$http', '$location', '$resource',
  function (ieVersion, InfoCollection, $scope, $http, $location, $resource) {

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

    console.log(data)

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
      output[listName] = new InfoCollection(listName,
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

    // $http.get('/2.0/zero/getProvider' + getQuery())
    $http.get("http://kurtteichman.com:9000/api/Providers/careTeam?institution=columbia&mrn=1863656")
    .success(function(data) {
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