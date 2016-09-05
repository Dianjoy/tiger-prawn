/**
 * Created by meathill on 14/11/15.
 * 对 Backbone 做针对本应用的修改，不直接修改 Backbone
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
 * @see http://api.jquery.com/jQuery.ajax/
 */
"use strict";
(function (b, _) {
  var sync = b.sync;

  // add withCredential
  b.sync = function (method, model, options) {
    options = options || {};

    if ('success' in options) {
      var success = options.success;
      options.success = function (response) {
        b.trigger('backbone:sync', response);
        success.call(options.context, response);
      };
    }

    if ('xhrField' in options) {
      options.xhrFields.withCredentials = true;
    } else {
      options.xhrFields = {
        withCredentials: true
      };
    }
    return sync(method, model, options);
  };

  // 修复Backbone在url()时的问题
  b.Model.prototype.isNew = function () {
    return !this.id;
  };

  // `Backbone.history.checkUrl()` 执行后进行检查,如果当前 url 不符合要求则广播失败
  b.history.checkUrl = _.bind(function (e) {
    var current = this.getFragment();
    if (current === this.fragment && this.iframe) {
      current = this.getHash(this.iframe.contentWindow);
    }

    if (current === this.fragment) return false;
    if (this.iframe) this.navigate(current);

    if (!this.loadUrl()) {
      b.trigger('backbone:route-error', 404);
    }
  }, b.history);
}(Backbone, _));