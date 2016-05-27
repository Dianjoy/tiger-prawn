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
        , ad_id = json.ad_id
        , start = json.ad_notice ? $('#settle-start-date').val() : $('#stat-range-start-date').val()
        , end = json.ad_notice ? $('#settle-end-date').val() : $('#stat-range-end-date').val() ;
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