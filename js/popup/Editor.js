/**
 * Created by meathill on 14-9-17.
 */
;(function (ns) {
  'use strict';

  var timeout;
  // TODO 找时间改成工厂模式
  var Editor = ns.Editor = tp.view.DataSyncView.extend({
    $context: null,
    form: null,
    events: {
      'hidden.bs.modal': 'hiddenHandler',
      'keydown': 'keydownHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler',
      'submit': 'form_submitHandler'
    },
    initialize: function (options) {
      this.submit = this.$('.btn-primary');
      this.options = options;
      var type = options.type || 'short-text'
        , template = options.form ? 'page/' + options.form : ('template/popup-' + type);
      $.get(template + '.hbs', _.bind(this.loadCompleteHandler, this), 'html');

      // 补充信息
      var info = $('.editor-info');
      if (info.length) {
        info = Handlebars.compile(info.html());
        this.$('.info').html(info(this.model.toJSON()));
      }
      this.$el.modal('show');
    },
    render: function (template) {
      template = Handlebars.compile(template);
      this.$('.loading').remove();
      var form = $('<form class="editor-form" id="prop-editor"></form>').insertAfter(this.$('.alert-msg'));
      form.html(template(this.options));

      var html = this.$('.item-grid').html();
      if (html) {
        this.template = Handlebars.compile(html);
        this.$('.item-grid').empty();
      }
    },
    hide: function (delay) {
      delay = delay === undefined ? 3000 : delay;
      var modal = this.$el;
      timeout = setTimeout(function () {
        modal.modal('hide');
      }, delay);
    },
    reset: function () {
      this.$('.btn-primary').prop('disabled', false)
        .find('i').removeClass('fa-spin fa-spinner');
    },
    save: function () {
      if (this.submit.prop('disabled')) {
        return;
      }
      this.trigger('submit', this.form.serializeArray());
    },
    getValue: function () {
      // 由radio确定从哪里取值
      var radio = this.$('[name=prop-radio]')
        , value;
      if (radio.length) {
        return this.$('[name=prop-' + radio.filter(':checked').val() + ']').val();
      }
      // 开关
      // 开关基本只用0，1，但有些时候0表示开，有些时候1表示开……比如广告在线情况
      // 所以这里根据checkbox的值，取反
      if (this.options.type === 'status') {
        var checkbox = this.$('input');
        value = Number(checkbox.val());
        return Number(checkbox.prop('checked') ? value : !value);
      }
      // 正常取值
      var items = this.$('[name=prop], [name="prop[]"]');
      if (items.length === 1) {
        return items.val();
      }
      value = [];
      items.filter(':checked').each(function () {
        value.push(this.value);
      });
      return value.join('|');
    },
    form_submitHandler: function (event) {
      this.save();
      event.preventDefault();
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.ctrlKey) {
        this.save();
        event.preventDefault();
      }
    },
    loadCompleteHandler: function (response) {
      this.render(response);
    },
    hiddenHandler: function () {
      this.trigger('hidden');
      clearTimeout(timeout);
    }
  });

  ns.SearchEditor = Editor.extend({
    fragment: '',
    events: _.extend(Editor.prototype.events, {
      'click .search-button': 'searchButton_clickHandler'
    }),
    initialize: function (options) {
      Editor.prototype.initialize.call(this, options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    render: function (response) {
      Editor.prototype.render.call(this, response);
    },
    search: function () {
      var keyword = this.$('[type=search]').val();
      if (!keyword) {
        return;
      }
      this.collection.fetch({data: {keyword: keyword}});
      this.$('[type=search], .search-button').prop('disabled', true);
    },
    collection_addHandler: function (model) {
      this.fragment += this.template(model.toJSON());
    },
    collection_syncHandler: function () {
      this.$('.search-result').html(this.fragment + '<hr />');
      this.$('[type=search], .search-button').prop('disabled', false);
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
      this.$('.item-grid').html(this.template({value: this.collection.toJSON()}));
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

  ns.SelectEditor = Editor.extend({
    render: function (response) {
      Editor.prototype.render.call(this, response);

      if (this.options.options.length === 0) {
        this.$('select')
          .prop('disabled', true)
          .html('<option>&lt;没有结果&gt;</option>');
      } else {
        this.$('select').val(this.options.value)
      }
    }
  });


}(Nervenet.createNameSpace('tp.popup')));