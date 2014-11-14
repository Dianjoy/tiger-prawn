/*
 * @overview 负责服务器数据交互
 */
'use strict';
;(function (ns) {
  var manager = {
    $body: null,
    $me: null,
    call: function (url, data, options) {
      options = options || {};
      var self = this
        , onSuccess = options.success || this.onSuccess
        , onError = options.error || this.onError
        , context = options.context;
      $.ajax({
        url: url,
        data: data,
        dataType: 'json',
        type: options.method || 'post',
        cache: false,
        xhrFields: {
          withCredentials: true
        },
        success: function (response) {
          if (response.code === 0) {
            onSuccess.call(context, response);
            self.postHandle(response);
            self.trigger('complete:call', response);
          } else {
            onError.call(context, response);
          }
        },
        error: function (xhr, status, err) {
          onError.call(context, xhr, status, err);
        }
      });
    },
    postHandle: function (response) {
      // 以后可以扩展成循环，现在先逐个添加好了
      if ('me' in response) {
        this.$me.set(response.me);
      }
    },
    onError: function (xhr, status, error) {
      console.log(xhr, status, error);
      if (status === 401) {
        this.$body.load('page/error.html');
      }
    },
    onProgress: function (loaded, total) {
      console.log(loaded / total);
    },
    onSuccess: function (response) {
      this.trigger('complete:upload', response);
      console.log('success', response);
    }
  };
  manager = _.extend(manager, Backbone.Events);
  ns.Manager = manager;
}(Nervenet.createNameSpace('tp.service')));

