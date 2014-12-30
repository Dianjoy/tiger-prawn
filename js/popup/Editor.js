/**
 * Created by meathill on 14-9-17.
 */
;(function (ns) {
  'use strict';

  var timeout;
  // TODO 找时间改成工厂模式
  ns.Editor = tp.view.DataSyncView.extend({
    $context: null,
    form: null,
    events: {
      'show.bs.modal': 'showHandler',
      'hidden.bs.modal': 'hiddenHandler',
      'keydown': 'keydownHandler',
      'click .btn-primary': 'submitButton_clickHandler',
      'click .search-button': 'searchButton_clickHandler',
      'click .add-button': 'addButton_clickHandler',
      'mousedown .input-group': 'inputGroup_mouseDownHandler'
    },
    render: function (options) {
      if (options) {
        this.options = options;
        var template = options.form ? 'page/' + options.form : ('template/popup-' + options.type);
        $.get(template + '.hbs', _.bind(this.loadCompleteHandler, this));
      }

      // 补充信息
      var info = $('#editor-info');
      if (info.length) {
        info = Handlebars.compile(info.html());
        this.$('.info').html(info(this.model.toJSON()));
      }

      this.submit = this.$('.btn-primary');
      this.$('.modal-body').append('<p align="center"><i class="fa fa-spin fa-spinner fa-4x"></i></p>');
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
    add: function () {
      var value = this.$('[name=query]').val().replace(/^\s+|\s+$/, '');
      if (value && !this.collection.findWhere({tag: value})){
        this.$('[name=query], .add-button').prop('disabled', true);
        this.$('.add-button i').addClass('fa-spin fa-spinner');
        this.collection.create({tag: value}, {wait: true});
      }
    },
    save: function () {
      if ($(this.el.elements).filter('[type=submit], button').not('button[type]').prop('disabled')) {
        return;
      }
      this.trigger('submit', this.getValue());
    },
    search: function () {
      var keyword = this.$('[type=search]').val();
      if (!keyword) {
        return;
      }
      this.collection.fetch({keyword: keyword, from: 'editor'});
      this.$('[type=search], .search-button').prop('disabled', true);
    },
    getMessage: function () {
      return this.$('[name=message]').val();
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
    addButton_clickHandler: function () {
      this.add();
    },
    collection_addHandler: function (model) {
      var data = model.toJSON();
      data.index = this.collection.length - 1;
      $(this.item({value: [data], append: true})).insertBefore(this.$('hr'));
      this.$('[name=query],.add-button').prop('disabled', false).val('');
      this.$('.add-button i').removeClass('fa-spin fa-spinner');
    },
    collection_resetHandler: function () {
      var html = this.item({list: this.collection.toJSON()});
      this.$('.search-result').html(html + '<hr />');
      this.$('[type=search], .search-button').prop('disabled', false);
    },
    inputGroup_mouseDownHandler: function (event) {
      $(event.currentTarget).find('[type=radio]').prop('checked', true);
    },
    searchButton_clickHandler: function () {
      this.search();
    },
    submitButton_clickHandler: function (event) {
      this.save();
      event.preventDefault();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        var target = event.target;
        if (target.type === 'search' && target.value != '') { // search
          this.search();
          event.preventDefault();
        }
        if (this.options.type === 'tags' && target.value != '') {
          this.add();
          event.preventDefault();
        }
        if (event.ctrlKey) { // ctrl+enter
          this.save();
          event.preventDefault();
        }
      }
    },
    loadCompleteHandler: function (data) {
      this.template = Handlebars.compile(data);
      this.$('p').remove();
      var form = $('<form class="editor fake" id="prop-editor"></form>').insertAfter(this.$('.alert-msg'));
      form.html(this.template(this.options));

      var html = this.$('.item-grid').html();
      if (html) {
        html = html.replace(/\${([#@\-\w\s\/]+)}/g, '{{$1}}');
        this.item = Handlebars.compile(html);
        this.$('.item-grid').empty();
      }

      if (this.options.type === 'search') {
        this.collection.on('reset', this.collection_resetHandler, this);
      }
      if (this.options.type === 'tags') {
        if (this.options.tag && this.collection) {
          var prop = this.options.tag;
          this.collection.map(function (model) {
            model.set('tag', model.get(prop));
          });
        }
        this.collection.on('add', this.collection_addHandler, this);
        this.$('.item-grid').html(this.item({value: this.collection.toJSON()}));
      }
      if (this.options.type === 'select') {
        if (this.options.options.length === 0) {
          this.$('select')
            .prop('disabled', true)
            .html('<option>&lt;没有结果&gt;</option>');
        } else {
          this.$('select').val(this.options.value)
        }
      }

      // 用组件适配用户操作
      this.$('[type=datetime]').datetimepicker();
      tp.component.Manager.check(this.$el, this.model);
    },
    hiddenHandler: function () {
      tp.component.Manager.clear(this.$el);
      this.trigger('hidden');
      clearTimeout(timeout);
    },
    showHandler: function () {
      this.$('.btn-primary').prop('disabled', false);
      this.$('.alert-msg').hide();
    }
  });
}(Nervenet.createNameSpace('tp.popup')));