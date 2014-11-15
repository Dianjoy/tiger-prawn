;(function (ns) {
  'use strict';

  var init = {
    events: {
      'change .auto-submit': 'autoSubmit_Handler',
      'click .add-row-button': 'addRowButton_clickHandler'
    },
    initialize: function () {
      var cid = this.$el.data('collection-id');
      if (cid) {
        this.collection = dianjoy.model.ListCollection.createInstance(null, {
          id: cid
        });
      }

      this.render();
    },
    render: function () {
      this.$('.keyword-form').find('[name=query]').val(this.model.get('keyword'));
    },
    addRowButton_clickHandler: function (event) {
      this.collection.add({});
      event.preventDefault();
    },
    autoSubmit_Handler: function (event) {
      $(event.currentTarget).closest('form').submit();
    }
  };
  ns.SmartNavbar = Backbone.View.extend(init);
}(Nervenet.createNameSpace('tp.component')));
