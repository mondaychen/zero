'use strict';

var app = angular.module('zeroApp')

app.config(function($provide) {
  $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
});


app.run(function($httpBackend) {

  var regForBackend = /^\/2.0\/zero\/getProvider/i;

  $httpBackend.whenGET(regForBackend).respond(function(method,url,data) {
    return [200
      , {"addresses":[{"addrPostCode":"100218722","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"425 E 61ST ST","addrLine2":"11TH FLOOR","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10009","locTypeCode":"New York","locName":null,"addrLine1":"425 East 13th Street,","addrLine2":null,"addrState":"NY","addrCity":"New York"},{"addrPostCode":"100214870","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"525 E 68TH ST","addrLine2":"J-130","addrState":"NY","addrCity":"NEW YORK"},{"addrPostCode":"10021","locTypeCode":"NEW YORK","locName":"Practice Address","addrLine1":"505 EAST 70TH STREET, HT582","addrLine2":"HT 582","addrState":"NY","addrCity":"NEW YORK"}],"NPI":"1235160458","mobilePhone":["9176262564"],"firstName":"LONA","middleName":null,"lastName":"PRASAD","pagerNum":[],"faxNum":["2127468717"],"contactPreference":"email","email":["lop9006@direct.weillcornell.org","lop9006@med.cornell.edu"],"officePhone":["2128210974","2127463000","2127464159","2127462640"]}
      , {}]
  });

  $httpBackend.whenGET(/^\S/).passThrough();

})

app.controller('MainCtrl', function ($scope, $http, $location) {

  var getOrderedOutputObject = function(data) {
    var temp_output = {
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

    temp_output = $.extend(temp_output, data)

    var names = []

    angular.forEach(['firstName', 'middleName', 'lastName'], function(name) {
      if(temp_output[name]) {
        names.push(temp_output[name])
      }
    })

    temp_output.fullName = names.join(' ')

    delete temp_output['NPI'];
    delete temp_output['firstName'];
    delete temp_output['lastName'];
    delete temp_output['middleName'];

    return temp_output;
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


  $scope.$watch(function(){ return $location.search() }, function(params){
    var modifyAddressArray = function(data_object) {
      data_object['addresses'] = data_object['addresses'].splice(0,1);
      delete data_object['addresses'];
    }

    $http.get('/2.0/zero/getProvider' + getQuery())
    .success(function(data) {
      console.log(data)
      $scope.original_query_data = angular.copy(data);
      // $scope.content['referring_md_provider_output'] = getOrderedOutputObject(data['referring_md_provider_output']);
      // modifyAddressArray($scope.content['referring_md_provider_output']);
      // $scope.content['match_metrix_provider_output'] = getOrderedOutputObject(data['match_metrix_provider_output']);
      // modifyAddressArray($scope.content['match_metrix_provider_output']);
      // $scope.content['hybridized_provider_output'] = getOrderedOutputObject(data['hybridized_provider_output']);
      // modifyAddressArray($scope.content['hybridized_provider_output']);

      $scope.content['hybridized_provider_output'] = getOrderedOutputObject(data);
      modifyAddressArray($scope.content['hybridized_provider_output']);
    })
  });

  $scope.isSelectedObject = {
    'referring_md_provider_output':false,
    'match_metrix_provider_output':false,
    'hybridized_provider_output'  :false
  }

  $scope.alternateAddressesBoolean = {
    'referring_md_provider_output':false,
    'match_metrix_provider_output':false,
    'hybridized_provider_output'  :false
  }

  $scope.showAlternateAddresses = function(choice) {
    $scope.alternateAddressesBoolean[choice] = !$scope.alternateAddressesBoolean[choice];
  }

  $scope.getAlternateAddresses = function(associated_category) {
    return $scope.original_query_data[associated_category]['addresses'].splice(1);
  }

  $scope.userSelect = function(choice) {
    $scope.isSelectedObject[choice] = !$scope.isSelectedObject[choice];

    angular.forEach($scope.isSelectedObject, function(value,key) {
      if (key != choice) {
        $scope.isSelectedObject[key] = false;
      }
    });
  }

  $scope.content = {
    'match_metrix_provider_output'    : null,
    'match_metrix_radiologist_output' : null,
    'referring_md_provider_output'    : null,
    'referring_md_attending_output'   : null,
    'hybridized_provider_output'      : null
  }
});