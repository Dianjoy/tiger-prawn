'use strict';
(function (ns) {
  ns.InvoiceListView = Backbone.View.extend({
    fragment: '',
    events: {
      'click .check-all': 'checkAll_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.fetch();
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        this.$('.settle-time-picker').after(this.fragment);
        this.fragment = '';
        tp.component.Manager.check(this.$el);
      }
    },
    checkAll_clickHandler: function (event) {
      var siblings = $(event.target).parent().siblings('.channel,.ids');
      siblings.each(function () {
        var name = $(this).find(':checkbox').attr('name');
        if (_.isUndefined(name) || name != $(event.target).val()) {
          $(this).find(':checkbox').attr('checked', false);
        }
      });
      var action = '#/invoice/apply/:start/:end/:' + $(event.target).val();
      this.$('form').attr('action', action);
    },
    deleteButton_clickHandler: function(event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定删除么？'
        , id = button.siblings().val();
      if (!confirm(msg)) {
        return;
      }
      button.spinner();
      this.collection.get(id).destroy({
        fadeOut: true,
        wait: true,
        error: function (model, xhr) {
          var response = 'responseJSON' in xhr ? xhr.responseJSON : xhr;
          button.spinner(false);
          alert('删除失败');
        }
      });
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.view')));