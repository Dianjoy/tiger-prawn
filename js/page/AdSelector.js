'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.AdSelector = Backbone.View.extend({
    $invoiceList: null,
    events: {
      'submit': 'submitHandler'
    },
    submitHandler: function (event) {
      var id = this.$('table').data('collection-id')
        , store = localStorage.getItem(key)
        , ids = this.getValue(this.el.elements['ids'])
        , collection = tp.model.ListCollection.getInstance({collectionId: id})
        , checked = _.filter(collection.toJSON(), function (model) {
          return ids.indexOf(model.ad_id) !== -1;
        })
        , invoiceList = store ? _.union(JSON.parse(store), checked) : checked;

      invoiceList = _.chain(invoiceList)
        .sortBy('channel')
        .map(function (value, index) { value.id = index; return value; })
        .value();
      localStorage.setItem(key, JSON.stringify(invoiceList));
      _.each(invoiceList, function (element) {
        var adCollection = tp.model.ListCollection.getInstance({collectionId: 'admin-list'})
          , adModel = adCollection.get(element.ad_id);
        if (adModel) {
          adModel.set('is_selected', true);
        }
      });
      this.flyAnimation();
      event.preventDefault();
    },
    getValue: function (element) {
      if (element.value) {
        return $(element).is(':checked') ? [element.value] : [];
      }
      return _.chain(element)
        .filter(function (item) { return item.checked; })
        .map(function (item) { return item.value; })
        .value();
    },
    flyAnimation: function () {
      var modal = this.$el.parents('.modal')
        , self = this;
      modal.animate({
        position: 'absolute',
        top: '-10%',
        left: '90%',
        height: '0px',
        width: '0px'
      }, 1000, 'swing', function () {
        self.$invoiceList.fetch({reset: true});
        self.$el.trigger('success');
      });
    }
  })
}(Nervenet.createNameSpace('tp.page')));