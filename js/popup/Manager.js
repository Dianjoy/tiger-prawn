/**
 * @overview 窗体管理器
 * @author Meathill (lujia.zhai@dianjoy.com)
 * @since 1.3
 */
'use strict';
(function (ns) {
  /**
   * @class
   */
  var Klass = Backbone.View.extend({
    $context: null,
    postConstruct: function () {
      var popup = this.$('#popup').remove().html()
        , editor = this.$('#editor-popup').remove().html();
      if (popup) {
        this.template = Handlebars.compile(popup);
      }
      if (editor) {
        this.editor = Handlebars.compile(editor);
      }
      this.$el.on('click', '.popup', _.bind(this.popupButton_clickHandler, this))
    },
    popup: function (options) {
      var popup = $(this.template(options))
        , klass = Nervenet.parseNamespace(options.popup) || ns.Base;
      this.$el.append(popup);
      popup = this.$context.createInstance(klass, _.extend({
        el: popup
      }, options));
      return popup;
    },
    popupEditor: function (options) {
      var editor = options.el = $(this.editor(options));
      this.$el.append(editor);
      editor = EditorFactory.createEditor(this.$context, options);
      return editor;
    },
    popupButton_clickHandler: function (event) {
      var target = event.currentTarget
        , options = $(target).data();
      if (options.collectionId) {
        var collection = tp.model.ListCollection.getInstance(options);
        options.model = collection.get(options.id);
      }
      if (target.tagName.toLowerCase() === 'a') {
        options.content = target.href;
        options.isRemote = true;
      }
      if ('model' in options && options.model === '' && options.url) {
        options.model = new tp.model.Model();
        options.model.urlRoot = tp.API + options.url;
        options.autoFetch = true;
      }
      options.title = options.title || target.title;
      this.popup(options);
      event.preventDefault();
    }
  });

  var EditorFactory = {
    createEditor: function (context, options) {
      var popup;
      switch (options.type) {
        case 'file':
          popup = context.createInstance(ns.FileEditor, options);
          break;

        case 'number':
        case 'range':
          popup = context.createInstance(ns.NumberEditor, options);
          break;

        case 'search':
          popup = context.createInstance(ns.SearchEditor, options);
          break;

        case 'select':
          popup = context.createInstance(ns.SelectEditor, options);
          break;

        case 'tags':
          popup = context.createInstance(ns.TagsEditor, options);
          break;

        case 'status':
          popup = context.createInstance(ns.SwitchEditor, options);
          break;

        case 'checkbox':
          popup = context.createInstance(ns.CheckboxEditor, options);
          break;

        case 'date':
        case 'time':
        case 'datetime':
          popup = context.createInstance(ns.DateTimeEditor, options);
          break;

        default:
          popup = context.createInstance(ns.Editor, options);
          break;
      }
      return popup;
    }
  };

  var manager = ns.Manager = new Klass({
    el: 'body'
  });
}(Nervenet.createNameSpace('tp.popup')));
