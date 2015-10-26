'use strict';
(function (ns) {
  var key = tp.PROJECT + '-invoice-list';
  ns.InvoiceListView = tp.component.BaseList.extend({
    events: {
      'click .check-all': 'checkAll_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'success form': 'form_successHandler'
    },
    render: function () {
      if (this.fragment) {
        this.$('.apply').before(this.fragment);
        this.refreshNumber();
        this.fragment = '';
        tp.component.Manager.check(this.$el);
      }
    },
    refreshNumber: function () {
      var num = this.collection.length;
      this.$('.dropdown-toggle span:first-child').text(num ? '发票 ( ' + num + ' )' : '发票');
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
        , item = this.$('#' + id)
        , channel = model.get('channel');
      invoiceList = _.filter(invoiceList, function (element) {return element.id !== id});
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
      var target = $(event.target)
        , siblings = target.parent().siblings('.channel, .ids')
        , action = target.is(':checked') ? '#/invoice/apply/:channel/:' + target.val() : '';
      siblings.each(function () {
        var name = $(this).find(':checkbox').attr('name');
        if (_.isUndefined(name) || name !== target.val()) {
          $(this).find(':checkbox').attr('checked', false);
        }
      });
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
    form_successHandler: function () {
      this.$('form').attr('action', '');
    }
  });
}(Nervenet.createNameSpace('tp.view')));