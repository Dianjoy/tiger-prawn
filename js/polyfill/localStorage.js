/**
 * Created by meathill on 15/4/10.
 * safari 在隐身模式下无法使用localStorage，会报错
 * > QuotaExceededError: DOM Exception 22: An attempt was made to add something to storage that exceeded the quota.
 */
'use strict';
(function () {
  var data = {}

  // 兼容safari
  try {
    localStorage.setItem('tp', 1);
    localStorage.removeItem('tp');
  } catch (e) {
    localStorage.setItem = function (key, value) {
      data[key] = value;
    };
    localStorage.getItem = function (key) {
      return data[key];
    };
  }
}());