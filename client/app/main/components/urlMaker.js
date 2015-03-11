angular.module('zeroApp').factory('urlMaker', function() {

  function urlMaker (urlPattern, origin, defaultParams) {
    return function (params) {
      params = _.defaults(params, defaultParams)

      var url = urlPattern.replace(/\:.+?\//g, function($1) {
        var key = $1.slice(1, $1.length - 1)
        if(params[key] === null || _.isUndefined(params[key])
          || params[key] === '') {
          return ''
        }
        return params[key] + '/'
      })

      return (origin || '') + url
    }
  }

  return urlMaker
})