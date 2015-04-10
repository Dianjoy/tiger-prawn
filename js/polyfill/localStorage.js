/**
 * Created by meathill on 15/4/10.
 * safari 在隐身模式下无法使用localStorage，会报错
 * > QuotaExceededError: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota.
 */
'use strict';
(function () {
  var _storage = null
    , data = {}
    , Storage = function () {};
  Storage.prototype = {
    getItem: function (key) {
      return data[key];
    },
    hasItem: function (key) {
      return !!data[key];
    },
    removeItem: function (key) {
      delete data[key];
    },
    setItem: function (key, value) {
      data[key] = value;
    }
  };

  // 兼容safari
  try {
    localStorage.setItem('tp', 1);
    localStorage.removeItem('tp');
  } catch (e) {
    _storage = localStorage;
    window.localStorage = new Storage();
  }
}());