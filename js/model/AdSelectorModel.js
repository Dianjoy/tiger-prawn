'use strict';
(function (ns) {
  ns.AdSelectorModel = ns.Model.extend({
    toJSON: function (options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options)
        , key = tp.PROJECT + '-invoice-list';
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var previous = this.previousAttributes();
      if (!_.isEmpty(previous)) {
        json.previous = previous;
      }
      var store = localStorage.getItem(key)
        , ad_id = json.ad_id
        , start = $('#settle-start-date').val()
        , end = $('#settle-end-date').val();
      json.start = start;
      json.end = end;
      this.defaults = {start: start, end: end};
      if (store) {
        var invoiceList = JSON.parse(store)
          , isSelected = _.findWhere(invoiceList, {
            ad_id: ad_id,
            start: start,
            end: end
          });
        json.is_selected = !_.isUndefined(isSelected);
      }

      return _.extend(json, this.options, this.collection ? this.collection.options : null);
    }
  })
}(Nervenet.createNameSpace('tp.model')));