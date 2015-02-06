'use strict';

angular.module('zeroApp')
  .controller('MainCtrl', function ($scope, $http, $location) {
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

    angular.forEach(data,function(value,key) {
      temp_output[key] = value;
    });

    temp_output['fullName'] = (temp_output['firstName']) ? temp_output['firstName'] : '';
    temp_output['fullName'] += (temp_output['middleName']) ? ' ' + temp_output['middleName'] : '';
    temp_output['fullName'] += (temp_output['lastName']) ? ' ' + temp_output['lastName'] : '';

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
      $scope.original_query_data = angular.copy(data);
      $scope.content['referring_md_provider_output'] = getOrderedOutputObject(data['referring_md_provider_output']);
      modifyAddressArray($scope.content['referring_md_provider_output']);
      $scope.content['match_metrix_provider_output'] = getOrderedOutputObject(data['match_metrix_provider_output']);
      modifyAddressArray($scope.content['match_metrix_provider_output']);
      $scope.content['hybridized_provider_output']   = getOrderedOutputObject(data['hybridized_provider_output']);
      modifyAddressArray($scope.content['hybridized_provider_output']);
    });
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