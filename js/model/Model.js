/**
 * Created by meathill on 16/1/6.
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  ns.Model = Backbone.Model.extend({
    parse: function (response) {
      var key = this.key || (this.collection ? this.collection.key : 'data');
      if ('code' in response && 'msg' in response && key in response) {
        return response[key];
      }
      return response;
    },
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var previous = this.previousAttributes();
      if (!_.isEmpty(previous)) {
        json.previous = previous;
      }
      return _.extend(this.collection ? this.collection.options : null, this.options, json);
    }
  })
}(Nervenet.createNameSpace('tp.model')));