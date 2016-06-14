'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceListView = tp.component.BaseList.extend({
    events: {
      'click .check-all': 'checkAll_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .clear-button': 'clearButton_clickHandler',
      'success form': 'form_successHandler'
    },
    render: function () {
      if (this.fragment) {
        this.$('.divider').before(this.fragment);
        this.fragment = '';
        tp.component.Manager.check(this.$el);
      }
      this.refreshNumber();
    },
    refreshNumber: function () {
      var num = this.collection.length
        , checked = this.$('.check-all:checked').length;
      this.$('.dropdown-toggle span:first-child').text(num ? '发票 ( ' + num + ' )' : '发票');
      this.$('.apply .btn').attr('disabled', num === 0 || checked === 0);
    },
    collection_resetHandler: function () {
      this.$('.ids, .channel').remove();
      this.collection.each(function (model) {
        this.collection_addHandler(model);
      }, this);
    },
    collection_removeHandler: function (model) {
      var invoiceList = JSON.parse(localStorage.getItem(key))
        , id = model.get('id')
        , ad_id = model.get('ad_id')
        , start = model.get('start')
        , end = model.get('end')
        , adCollection = tp.model.ListCollection.getInstance({collectionId: 'admin-list'})
        , adModel = adCollection.get(ad_id)
        , item = this.$('#' + id)
        , channel = model.get('channel');
      invoiceList = _.filter(invoiceList, function (element) { return element.id !== id });
      localStorage.setItem(key, JSON.stringify(invoiceList));
      if (adModel) {
        adModel.set('is_selected', false);
      }
      item.fadeOut(function () {
        if (_.every(invoiceList, function (element) { return element.channel !== channel; })) {
          $(this).prev().remove();
        }
        $(this).remove();
      });
      this.refreshNumber();
    },
    checkAll_clickHandler: function (event) {
      var target = $(event.target)
        , val = target.val()
        , siblings = target.parents('.channel').siblings('.channel, .ids')
        , action = target.is(':checked') ? '#/invoice/apply/:c_' + val.slice(8) + '/:' + val : '';
      siblings.each(function () {
        var name = $(this).find(':checkbox').attr('name');
        if (!name || name !== target.val()) {
          $(this).find(':checkbox').attr('checked', false);
        }
      });
      this.refreshNumber();
      this.$('form').attr('action', action);
    },
    deleteButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定删除么？'
        , id = button.parent().attr('id')
        , model = this.collection.get(id);
      if (!confirm(msg)) {
        return;
      }
      button.spinner();
      this.collection.remove(model);
    },
    clearButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定删除么？'
        , channel = button.parent().find('.check-all').val().slice(8)
        , models = this.collection.where({channel: Number(channel) || channel.toString()});
      if (!confirm(msg)) {
        return;
      }
      button.spinner();
      this.collection.remove(models);
    },
    form_successHandler: function () {
      this.$('.check-all').attr('checked', false);
      this.$('form').removeAttr('action');
      this.$el.removeClass('open');
      this.refreshNumber();
    }
  });
  var invoiceListView = function () {
    if (this.$me.isCP()) {
      $('.invoice-list').remove();
    } else if (tp.model.InvoiceList) {
      var invoiceList = new tp.model.InvoiceList();
      if (!this.$context.hasValue('invoiceList')) {
        this.$context.createInstance(ns.InvoiceListView, {
          el: '.invoice-list',
          collection: invoiceList
        });
        this.$context.mapValue('invoiceList', invoiceList);
      }
    }
  };
  tp.component.Manager.registerComponent(invoiceListView);
}(Nervenet.createNameSpace('tp.view')));