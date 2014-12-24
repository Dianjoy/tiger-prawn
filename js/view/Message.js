/**
 * Created by meathill on 14/12/23.
 */
'use strict';
(function (ns) {
  ns.Message = Backbone.View.extend({
    fragment: '',
    events: {
      'click input': 'input_clickHandler',
      'change [name=check]': 'check_changeHandler',
      'animationend': 'animationEndHandler',
      'webkitAnimationEnd': 'animationEndHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').remove().html());
      this.list = this.$('.message-list');
      this.button = this.$('.dropdown-toggle');

      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
    },
    refreshNumber: function () {
      var total = this.$('input:not(:checked)').length;
      if (this.label) {
        this.label.remove();
      }
      if (total !== 0) {
        this.label = $('<span>' + (total > 10 ? '10+' : total) + '</span>').appendTo(this.button);
        this.button.find('i').addClass('animated swing');
      }
    },
    animationEndHandler: function (event) {
      $(event.target).removeClass('animated swing');
    },
    check_changeHandler: function (event) {
      var id = event.target.value;
      this.collection.get(id).destroy();
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_removeHandler: function (model) {
      var item = this.$('#msg-' + model.id);
      this.refreshNumber();
      setTimeout(function () {
        item.fadeOut(function () {
          $(this).remove();
        });
      }, 3000);
    },
    collection_syncHandler: function () {
      if (this.fragment) {
        this.list.append(this.fragment);
        this.refreshNumber();
        this.fragment = '';
      }
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    }
  });
}(Nervenet.createNameSpace('tp.view')));