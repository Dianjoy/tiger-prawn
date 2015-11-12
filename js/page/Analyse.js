'use strict';
(function (ns) {
  var filterLabel = Handlebars.compile('<a href="#/{{key}}/{{value}}" class="filter label label-{{key}}">{{#if label}}{{label}}{{else}}{{value}}{{/if}}</a>')
    , key = tp.PROJECT + '-invoice-list';
  function createAnalyse (options) {
    return tp.component.SmartTable.extend({
      collection_addHandler: function (model, collection) {
        var store = localStorage.getItem(key)
          , ranger = this.$el.data('ranger')
          , ad_id = ranger === '.date-range' ? model.get('id') : model.get('ad_id')
          , start = ranger === '.date-range' ? $('#stat-range-start-date').val() : $('#settle-start-date').val()
          , end = ranger === '.date-range' ? $('#stat-range-end-date').val() : $('#settle-end-date').val();
        if (ranger === '.date-range') {
          model.set({
            start: start,
            end: end
          });
        }
        if (store) {
          var invoiceList = JSON.parse(store)
            , isSelected = _.findWhere(invoiceList, {
              ad_id: ad_id,
              start: start,
              end: end
            });
          model.set('is_selected', !_.isUndefined(isSelected));
        }
        tp.component.BaseList.prototype.collection_addHandler.call(this, model, collection, options);
      }
    });
  }
  ns.Analyse = function (options) {
    if (tp.component.SmartTable) {
      this.createRealAnalyse(options);
    } else {
      tp.component.Manager.loadMediatorClass([], 'tp.component.SmartTable', null, null, _.bind(function () {
        this.createRealAnalyse(options);
      }, this));
    }
  };
  ns.Analyse.prototype.createRealAnalyse = function (options) {
    var klass = createAnalyse(options);
    this.mediator = tp.component.Manager.$context.createInstance(klass, options);
  };
}(Nervenet.createNameSpace('tp.page')));
