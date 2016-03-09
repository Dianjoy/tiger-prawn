/**
 * Created by meathill on 14/11/15.
 * 对Backbone做针对本应用的修改，不直接修改backbone
 * @see https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
 * @see http://api.jquery.com/jQuery.ajax/
 */
(function (b) {
  var sync = b.sync;

  // add withCredential
  b.sync = function (method, model, options) {
    options = options || {};

    if ('success' in options) {
      var success = options.success;
      options.success = function (response) {
        b.trigger('backbone-sync', response);
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
}(Backbone));