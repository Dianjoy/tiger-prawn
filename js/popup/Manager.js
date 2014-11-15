/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
'use strict';
(function (ns) {
  'use strict';
  var popup
    , editor;

  var Klass = Backbone.View.extend({
    events: {
      'click .popup': 'popup_clickHandler',
      'show.bs.modal .modal': 'popup_showHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('#popup').remove().html());
    },
    postConstruct: function () {
      if (popup) {
        this.$context.inject(popup);
      }
    },
    popup: function (options) {
      var popup = $(this.template(options));
      this.$el.append(popup);
      popup = this.$context.createInstance(ns.Base, _.extend({
        el: popup
      }, options));
    },
    popupEditor: function (model, options, collection) {
      if (editor) {
        if (editor.collection) {
          editor.collection.off(null, null, editor);
        }
        editor.model = model;
        editor.collection = collection;
      } else {
        editor = this.$context.createInstance(ns.Editor, {
          el: '#edit-popup',
          model: model,
          collection: collection
        });
      }
      editor.initUI(options);
      editor.$el.modal('show');
      return editor;
    },
    removePopup: function () {
      popup && popup.remove();
    },
    popup_clickHandler: function (event) {
      var target = $(this),
        data = target.data(),
        hasConfirm = 'confirm' in data ? data.confirm : true,
        hasCancel = 'cancel' in data ? data.cancel : true;
      ns.Manager.popup({
        title: this.title || target.text(),
        content: this.href,
        hasConfirm: hasConfirm,
        hasCancel: hasCancel,
        isRemote: true
      });
      ga('send', 'event', 'popup', 'popup', event.currentTarget.href);
      event.preventDefault();
    },
    popup_showHandler: function (event) {
      popup = popup || this.$context.createInstance(ns.Base, {
        el: event.currentTarget
      });
    }
  });

  var manager = ns.Manager = new Klass({
    el: 'body'
  });
}(Nervenet.createNameSpace('tp.popup')));
