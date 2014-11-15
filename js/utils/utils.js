/**
 * Created by meathill on 14-4-29.
 */
'use strict';
(function (ns) {
  ns.decodeURLParam = function (str) {
    if (!str) {
      return {};
    }
    var params = str.split('&')
      , result = {};
    for (var i = 0, len = params.length; i < len; i++) {
      var arr = params[i].split('=');
      result[arr[0]] = decodeURIComponent(arr[1]);
    }
    return result;
  }
}(Nervenet.createNameSpace('tp.utils')));