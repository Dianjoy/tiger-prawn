'use strict';
(function (ns) {
  ns.AnalyseModel = ns.Model.extend({
    idAttribute: 'ad_id',
    toJSON: function (options) {
      var json = ns.Model.prototype.toJSON.call(this, options)
        , key = tp.PROJECT + '-invoice-list';
      if (options) { // from sync，因为{patch: true}
        return json;
      }
      var store = localStorage.getItem(key)
        , ad_id = json.id || json.ad_id
        , start = json.id ? $('#stat-range-start-date').val() : $('#settle-start-date').val()
        , end = json.id ? $('#stat-range-end-date').val() : $('#settle-end-date').val();
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