/**
 * Created by meathill on 14-9-17.
 */
'use strict';
(function (ns, $, _, moment, tp, Backbone) {
  var timeout;
  /**
   * @class
   * @property {object} options
   * @property {boolean} options.hasComponents 是否有组件需要初始化
   */
  var Editor = ns.Editor = tp.view.DataSyncView.extend({
    $context: null,
    form: null,
    events: {
      'hidden.bs.modal': 'hiddenHandler',
      'keydown': 'keydownHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler'
    },
    initialize: function (options) {
      this.submit = this.$('.btn-primary');
      this.options = options;
      var type = options.type || 'short-text'
        , template = options.template ? 'page/' + options.template : (tp.path + 'template/popup-' + type);
      $.get(template + '.hbs', _.bind(this.loadCompleteHandler, this), 'html');

      // 补充信息
      var info = $('.editor-info');
      if (info.length) {
        info = Handlebars.compile(info.html());
        this.$('.info').html(info(_.defaults({}, this.model.toJSON(), options)));
      }
      this.$el.modal(options);
    },
    render: function (template) {
      template = Handlebars.compile(template);
      this.$('.loading').remove();
      this.form = new tp.component.SmartForm({
        tagName: 'form',
        id: 'prop-editor',
        className: 'editor-form model-editor',
        model: this.model
      });
      var html = template(_.extend(this.model.toJSON(), this.options));
      this.form.$el.html(html).insertAfter(this.$('.alert-msg'));
      this.form.on('success', this.form_successHandler, this);
      this.form.on('error', this.form_errorHandler, this);

      var dateFields = this.$('.datetimepicker');
      if (dateFields.length) {
        dateFields.each(function () {
          $(this).datetimepicker($(this).data());
        });
      }

      if (this.options.hasComponents) {
        tp.component.Manager.check(this.form.$el);
      }

      this.submit.prop('disabled', false);
    },
    createTemplate: function () {
      var html = this.$('script').remove().html();
      if (html) {
        this.template = Handlebars.compile(html);
      }
    },
    hide: function (delay) {
      delay = delay === undefined ? 3000 : delay;
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, delay);
    },
    form_errorHandler: function (xhr, status, error) {
      this.displayResult(false, error.message, 'frown-o');
      this.trigger('error', xhr, status, error);
    },
    form_successHandler: function (response) {
      this.displayResult(true, response.msg, 'smile-o');
      this.trigger('success', response);
      this.hide();
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.form.$el.submit();
        event.preventDefault();
      }
    },
    loadCompleteHandler: function (response) {
      this.render(response);
    },
    hiddenHandler: function () {
      this.form.remove();
      if (this.collection && this.collection instanceof Backbone.Collection) {
        this.collection.off(null, null, this);
      }
      clearTimeout(timeout);
      this.remove();
      this.trigger('hidden');
    }
  });

  /**
   * @class
   */
  ns.SearchEditor = Editor.extend({
    fragment: '',
    item: '{{label}}',
    events: _.extend(Editor.prototype.events, {
      'click .search-button': 'searchButton_clickHandler'
    }),
    /**
     * @param {object} options
     * @param {string} options.itemLabel 选项label的模板
     * @param {string} options.url 搜索接口
     */
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      var item = options.itemLabel || this.item;
      if (item) {
        Handlebars.registerPartial('item', item);
      }
      this.collection = tp.model.ListCollection.getInstance();
      this.collection.url = tp.API + options.url;
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.collection.off();
      Handlebars.unregisterPartial('item');
      Backbone.View.prototype.remove.call(this);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
      this.createTemplate();
    },
    search: function () {
      var keyword = this.$('[type=search]').val();
      if (!keyword) {
        return;
      }
      this.collection.fetch({data: {keyword: keyword}});
      this.$('[type=search]').prop('disabled', true);
      this.$('.search-button').spinner();
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(_.extend(model.toJSON(), this.options));
    },
    collection_syncHandler: function () {
      this.fragment = this.fragment || '没有与此关键词接近的结果。';
      this.$('.search-result').html(this.fragment);
      this.$('[type=search]').prop('disabled', false);
      this.$('.search-button').spinner(false);
      this.fragment = '';
    },
    searchButton_clickHandler: function () {
      this.search();
    },
    keydownHandler: function (event) {
      Editor.prototype.keydownHandler.call(this, event);
      if (event.keyCode === 13 && event.target.type === 'search' && event.target.value != '') {
        this.search();
        event.preventDefault();
      }
    }
  });

  /**
   * @class
   */
  ns.TagsEditor = Editor.extend({
    events: _.extend(Editor.prototype.events, {
      'click .add-button': 'addButton_clickHandler'
    }),
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      this.collection.on('add', this.collection_addHandler, this);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
      if (this.options.tag && this.collection) {
        var prop = this.options.tag;
        this.collection.map(function (model) {
          model.set('tag', model.get(prop));
        });
      }
      this.createTemplate();
      this.$('.tags').html(this.template({value: this.collection.toJSON()}));
    },
    add: function () {
      var value = this.$('[name=query]').val().replace(/^\s+|\s+$/, '');
      if (value && !this.collection.find({tag: value})){
        this.$('[name=query], .add-button').prop('disabled', true);
        this.$('.add-button i').addClass('fa-spin fa-spinner');
        this.collection.create({tag: value}, {wait: true});
      }
    },
    addButton_clickHandler: function () {
      this.add();
    },
    collection_addHandler: function (model) {
      var data = model.toJSON();
      data.index = this.collection.length - 1;
      $(this.template({value: [data], append: true})).insertBefore(this.$('hr'));
      this.$('[name=query],.add-button').prop('disabled', false).val('');
      this.$('.add-button i').removeClass('fa-spin fa-spinner');
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.target.value != '') {
        this.add();
        event.preventDefault();
      }
    }
  });

  /**
   * @class
   * @property {object} options
   * @property {boolean} options.addNew
   */
  ns.SelectEditor = Editor.extend({
    render: function (response) {
      if (this.options.options) {
        if (this.model.options) {
          this.options.options = this.model.options[this.options.options];
        } else if (this.model.collection.options) {
          this.options.options = this.model.collection.options[this.options.options];
        }
      }
      Editor.prototype.render.call(this, response);

      var select = this.$('[name="' + this.options.prop + '"]');
      if (this.options.addNew) {
        var collection = new tp.model.ListCollection.getInstance({
            collectionId: this.options.prop,
            url: tp.API + this.options.url
          });
        select = new tp.component.CollectionSelect({
          el: select,
          collection: collection
        });
        collection.reset(this.options.options);
      } else if (this.options.list) {
        select.html($(this.options.list).html());
      }

      select.val(this.options.value)
    }
  });

  /**
   * @class
   */
  ns.NumberEditor = Editor.extend({
    initialize: function (options) {
      options.range = options.type === 'range';
      options.type = 'number';
      Editor.prototype.initialize.call(this, options);
    }
  });

  /**
   * @class
   */
  ns.FileEditor = Editor.extend({
    events: _.extend({
      'click [data-dismiss]': 'clickHandler'
    }, Editor.prototype.events),
    initialize: function (options) {
      options.isImage = /image\/\*/.test(options.accept);
      options.API = tp.API;
      if (options.multiple) {
        options.items = _.isArray(options.value) ? options.value : options.value.split(',');
      }
      // 防止误触导致退出窗体
      options.backdrop = 'static';
      options.keyboard = false;
      Editor.prototype.initialize.call(this, options);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
      this.form.initUploader();
    },
    clickHandler: function (e) {
      var label = '您有文件正在上传，关闭窗口将导致上传失败。您确认要继续关闭窗口么？';
      if (this.form.$el.hasClass('loading') && !confirm(label)) {
        e.stopPropagation();
      }
    }
  });

  /**
   * @class
   */
  ns.SwitchEditor = Editor.extend({
    initialize: function (options) {
      var defaults = {
        open: 1,
        close: 0,
        readonly: false
      };
      options = _.extend(defaults, options);
      options.value = this.model.get(options.prop) != options.open;
      Editor.prototype.initialize.call(this, options);
    }
  });

  ns.CheckboxEditor = Editor.extend({
    render: function (response) {
      if (this.options.options) {
        if (this.model.options) {
          this.options.options = this.model.options[this.options.options];
        } else {
          this.options.options = this.model.collection.options[this.options.options];
        }
      }
      Editor.prototype.render.call(this, response);
    }
  });

  ns.DateTimeEditor = Editor.extend({
    initialize: function (options) {
      options.format = moment[options.type.toUpperCase() + '_FORMAT'];
      options.realType = options.type;
      options.type = 'datetime';
      Editor.prototype.initialize.call(this, options);
    }
  });
}(Nervenet.createNameSpace('tp.popup'), jQuery, _, moment, tp, Backbone));