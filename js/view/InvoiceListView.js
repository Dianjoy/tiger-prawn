'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceListView = Backbone.View.extend({
    fragment: '',
    events: {
      'click .check-all': 'checkAll_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'success form': 'form_successHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.getInvoiceList();
    },
    refreshNumber: function () {
      var num = this.collection.length;
      this.$('.dropdown-toggle span:first-child').text(num ? '发票 ( ' + num + ' )' : '发票');
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        this.$('.settle-time-picker').after(this.fragment);
        this.refreshNumber();
        this.fragment = '';
        tp.component.Manager.check(this.$el);
      }
    },
    collection_removeHandler: function (model) {
      var store = localStorage.getItem(key)
        , invoiceList = JSON.parse(store)
        , item = this.$('#' + model.id)
        , channel = model.get('channel');
      invoiceList = _.filter(invoiceList, function (element) {
        return element.id !== model.id
      });
      localStorage.setItem(key, JSON.stringify(invoiceList));
      item.fadeOut(function () {
        if (_.where(invoiceList, {channel: channel}).length === 0) {
          $(this).prev().remove();
        }
        $(this).remove();
      });
      this.refreshNumber();
    },
    checkAll_clickHandler: function (event) {
      var siblings = $(event.target).parent().siblings('.channel, .ids');
      siblings.each(function () {
        var name = $(this).find(':checkbox').attr('name');
        if (_.isUndefined(name) || name != $(event.target).val()) {
          $(this).find(':checkbox').attr('checked', false);
        }
      });
      var action = '#/invoice/apply/:start/:end/:' + $(event.target).val();
      this.$('form').attr('action', action);
    },
    deleteButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定删除么？'
        , id = button.siblings().val()
        , model = this.collection.get(id);
      if (!confirm(msg)) {
        return;
      }
      button.spinner();
      this.collection.remove(model);
    },
    form_successHandler: function () {
      var checkAll = this.$('.check-all:checked')
        , channel = checkAll.val().slice(7)
        , models = this.collection.where({channel: channel});
      if (checkAll.length) {
        this.collection.remove(models);
        this.$('form').attr('action', '');
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));