/**
 * Created by meathill on 14/11/14.
 */
'use strict';
(function (ns) {
  ns.Error = {
    getAjaxMessage: function (xhr, status, error) {
      // 服务器错误
      if (xhr.statusCode().status === '500') {
        return {
          message: '服务器错误，请告知管理员',
          icon: 'close'
        }
      }
      if (xhr.status === 0) {
        return {
          message: '连接超时，请检查您的网络。',
          icon: 'close'
        }
      }
      var message = (xhr.responseJSON ? xhr.responseJSON.msg : null) || error || ''
        , icon = 'frown-o';
      if (status === 'error' && !xhr.responseText) { // 没有返回值，应该是某种服务器出错
        message = '请求服务器失败，请重试。若连续失败，请联系管理员。';
        icon = 'user-md';
      }
      return {
        message: message,
        icon: icon
      }
    }
  };
}(Nervenet.createNameSpace('tp')));