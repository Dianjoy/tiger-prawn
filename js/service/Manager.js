/*
 * @overview 负责服务器数据交互
 */
'use strict';
(function (ns) {
  var defaults = {
    dataType: 'json',
    type: 'post',
    cache: false,
    xhrFields: {
      withCredentials: true
    }
  };
  var manager = {
    $body: null,
    $me: null,
    call: function (url, data, options) {
      options = _.extend({
        url: url,
        data: data
      }, defaults, options);
      var self = this
        , error = options.error || this.onError
        , success = options.success || this.onSuccess;
      options.success = function (response) {
        if (response.code === 0) {
          self.postHandle(response);
          success.call(options.context, response);
          self.trigger('complete:call', response);
        } else {
          error(response);
        }
      };
      options.error = function (xhr, status, err) {
        error.call(options.context, xhr, status, err);
      };
      return $.ajax(options);
    },
    fetch: function (url, handler, context) {
      return $.get(url, function (response) {
        handler.call(context, response);
      });
    },
    get: function (url, data, options) {
      options.method = 'get';
      this.call(url, data, options);
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
      console.log('success', response);
    }
  };
  manager = _.extend(manager, Backbone.Events);
  ns.Manager = manager;
}(Nervenet.createNameSpace('tp.service')));

