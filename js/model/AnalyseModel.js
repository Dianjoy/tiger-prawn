'use strict';
(function (ns) {
  ns.AnalyseModel = ns.ListCollection.prototype.model.extend({
    toJSON: function (options) {
      var json = ns.ListCollection.model.prototype.toJSON.call(this, options)
        , key = tp.PROJECT + '-invoice-list';
      if (options) { // from sync，因为{patch: true}
        return json;
      }

      var store = localStorage.getItem(key)
        , ad_id = json.id
        , start = $('#stat-range-start-date').val()
        , end = $('#stat-range-end-date').val();
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

      return json;
    }
  })
}(Nervenet.createNameSpace('tp.model')));