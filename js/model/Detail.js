/**
 * Created by chensheng on 15/6/24.
 */
(function (ns) {
  ns.Detail = Backbone.Model.extend({
      parse: function (response, options) {
        if (response.options) {
          this.options = response.options;
          this.options.API = tp.API;
          this.options.UPLOAD = tp.UPLOAD;
        }
        return response.list;
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
        return _.extend(json, this.options);
      }
    }
  );
}(Nervenet.createNameSpace('tp.model')));