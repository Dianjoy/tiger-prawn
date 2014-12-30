'use strict';
(function (ns) {
  var DATE_FORMAT = 'YYYY-MM-DD';

  var Pager = Backbone.View.extend({
    events: {
      'click a': 'clickHandler'
    },
    initialize: function (options) {
      var total = Math.ceil(options.length / options.pagesize);
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.total = total;
      this.pagesize = options.pagesize;
      this.render();
      this.displayPageNum();
    },
    render: function () {
      if (!this.template) {
        return;
      }
      var page = this.model.get('page')
        , arr = []
        , start = page - 5 > 0 ? page - 5 : 0
        , end = start + 10 < this.total ? start + 10 : this.total
        , length = end - start;
      for (var i = 0; i < length; i++) {
        arr[i] = {
          index: i + start,
          label: i + start + 1
        };
      }
      this.$el.html(this.template({
        pages: arr,
        prev: page - 1,
        next: page + 1
      }));
    },
    displayPageNum: function () {
      var page = this.model.get('page') || 0
        , total = this.total;
      this.$('[href="#/to/' + page + '"]').parent('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', page === 0)
          .end().last().toggleClass('disabled', page >= total - 1);
      });
    },
    setTotal: function (total) {
      this.total = Math.ceil(total / this.pagesize);
      this.render();
      this.displayPageNum();
    },
    clickHandler: function (event) {
      var target = $(event.currentTarget)
        , parent = target.parent();
      if (parent.hasClass('disabled') || parent.hasClass('active')) {
        return false;
      }
      var href = target.attr('href')
        , index = Number(href.substr(href.lastIndexOf('/') + 1));
      this.model.set('page', index);
      target.html('<i class="fa fa-spin fa-spinner"></i>');
      this.$el.children().addClass('disabled');
      event.preventDefault();
    }
  });

  var Ranger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function () {
      this.$('.date').datetimepicker({
        defaultDate: moment().format(DATE_FORMAT),
        pickTime: false
      });
    },
    remove: function () {
      this.stopListening();
      this.el = this.$el = this.model = null;
      return this;
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    range_clickHandler: function () {
      var start = this.$('[name=start]').val()
        , end = this.$('[name=end]').val();
      this.$('.shortcut').removeClass('active');
      this.$('.label').text(start + ' - ' + end);
      this.model.set({
        start: start,
        end: end
      });
    },
    shortcut_clickHandler: function (event) {
      var item = $(event.currentTarget)
        , start = item.data('start')
        , end = item.data('end');
      item.addClass('active')
        .siblings().removeClass('active');
      start = moment().add(start, 'days').format(DATE_FORMAT);
      end = moment().add(end, 'days').format(DATE_FORMAT);
      this.model.set({
        start: start,
        end: end
      });
      this.$('.label').text(item.text());
      event.preventDefault();
    }
  });

  var Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    start: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13 && event.target.value != '') {
        this.model.set({
          keyword: event.target.value,
          page: 0
        });
        this.$el.prop('readonly', true);
        this.spinner = $('<span class="fa fa-spin fa-spinner"></span>');
        this.spinner.insertAfter(this.$el);
      }
    }
  });

  ns.SmartTable = Backbone.View.extend({
    $context: null,
    fragment: '',
    events: {
      'click .add-row-button': 'addRowButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click .popup': 'popup_clickHandler',
      'change select.edit': 'select_changeHandler',
      'change .stars input': 'star_changeHandler',
      'change .status-button': 'statusButton_clickHandler',
      'sortupdate': 'sortUpdateHandler'
    },
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').html().replace(/\s{2,}|\n/g, ''));
      var init = this.$el.data();
      options = _.extend({pagesize: 10}, options, init, {url: init.url.replace('{{API}}', tp.API)});
      this.filter = tp.utils.decodeURLParam(init.filter);
      this.include = init.include ? init.include.split(',') : null; // 每个model应该继承的属性

      this.collection = tp.model.ListCollection.createInstance(null, options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);

      // 通过页面中介来实现翻页等功能
      this.model = this.model || new Backbone.Model();
      this.model.on('change', this.model_changeHandler, this);

      // 启用搜索
      if ('search' in init) {
        this.search = new Search({
          el: init.search,
          model: this.model
        });
      }

      // 翻页
      if ('pagesize' in init && init.pagesize > 0) {
        this.pagination = new Pager({
          el: 'pagination' in init ? init.pagination : this.$('.pager'),
          model: this.model,
          pagesize: options.pagesize
        });
      }

      // 调整每页数量
      if ('pagesizeController' in init) {
        this.pagesizeController = $(init.pagesizeController);
        this.pagesizeController.val(this.collection.pagesize);
        this.pagesizeController.on('change', _.bind(this.pagesize_changeHandler, this));
      }

      // 起止日期
      if ('ranger' in init) {
        this.ranger = new Ranger({
          el: init.ranger,
          model: this.model
        });
      }

      this.collection.fetch(_.extend(this.filter, this.model.pick('page', 'keyword')));
    },
    remove: function () {
      if (this.pagination) {
        this.pagination.remove();
      }
      if (this.pagesizeController) {
        this.pagesizeController.off('change');
      }
      if (this.ranger) {
        this.ranger.remove();
      }
      this.collection.off(null, null, this);
      this.model.off(null, null, this);
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').hide();
      this.$('tbody').append(this.fragment);
      this.fragment = '';
      if (this.search) {
        this.search.start();
      }
      if (this.pagination) {
        this.pagination.setTotal(this.collection.total);
      }
      this.$context.trigger('table-rendered');
    },
    saveModel: function (target, id, prop, value) {
      target.prop('disabled', true);
      this.collection.get(id).save(prop, value, {
        patch: true,
        wait: true,
        success: function () {
          target.prop('disabled', false);
        }
      });
    },
    addRowButton_clickHandler: function (event) {
      var prepend = $(event.currentTarget).data('prepend');
      this.collection.add(this.model.pick(this.include), {
        immediately: true,
        prepend: !!prepend
      });
    },
    collection_addHandler: function (model, collection, options) {
      this.fragment += this.template(model.toJSON());
      if (options.immediately) {
        var item = $(this.fragment);
        item.attr('id', model.id || model.cid);
        this.$('tbody')[options.prepend ? 'prepend' : 'append'](item);
        this.fragment = '';
      }
    },
    collection_changeHandler: function (model) {
      var changed = model.changed
        , tr = this.$('#' + ('id' in changed ? model.cid : model.id))
        , target;
      if ('id' in changed) {
        tr.replaceWith(this.template(model.toJSON()));
        return;
      }
      for (var prop in changed) {
        if (!changed.hasOwnProperty(prop)) {
          continue;
        }
        target = tr.find('[href=#' + prop + ']');
        if (target.data('refresh')) {
          var index = target.closest('td').index();
          tr = $(this.template(model.toJSON()));
          target.parent().replaceWith(tr.children().eq(index));
        } else if (target.children().is('img')) {
          target.children('img').attr('src', changed[prop]);
        } else if (target.is('.status-button')) {
          target.toggleClass('active', changed[prop]);
        } else {
          target.text(changed[target.data('display') ? target.data('display') : prop]);
        }
      }
    },
    collection_removeHandler: function (model, collection, options) {
      var item = this.$('#' + (model.id || model.cid));
      if (options.fadeOut) {
        item.fadeOut(function () {
          $(this).remove();
        })
      } else {
        item.remove();
      }
    },
    collection_syncHandler: function () {
      this.render();
    },
    deleteButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , msg = target.data('msg');
      msg = msg || '确定删除么？';
      if (!confirm(msg)) {
        return;
      }
      var id = target.closest('tr').attr('id');
      target.prop('disabled', true)
        .find('i').addClass('fa-spin fa-spinner');
      this.collection.get(id).destroy({
        fadeOut: true,
        wait: true,
        error: function (model, response) {
          target.prop('disabled', false)
            .find('i').removeClass('fa-spin fa-spinner');
          console.log(response.msg);
          alert('删除失败');
        }
      });
      event.preventDefault();
    },
    edit_clickHandler: function (event) {
      if (event.currentTarget.tagName.toLowerCase() === 'select') {
        return;
      }
      var target = $(event.currentTarget)
        , data = target.data()
        , index = target.closest('td').index()
        , prop = event.currentTarget.hash.substr(1)
        , id = target.closest('tr').attr('id')
        , model = this.collection.get(id)
        , options = _.extend({
          label: this.$('thead th').eq(index).text()
        }, data);
      options.type = data.type || 'short-text';
      this.$context.trigger('edit-model', model, prop, options);
      event.preventDefault();
    },
    model_changeHandler: function (model) {
      this.filter = _.extend(this.filter, model.changed);
      this.collection.fetch(this.filter);
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      this.collection.fetch(this.filter);
    },
    popup_clickHandler: function (event) {
      var id = $(event.currentTarget).closest('tr').attr('id')
        , model = this.collection.get(id);
      tp.popup.Manager.popup({
        title: '编辑',
        content: event.currentTarget.href,
        confirm: '修改',
        cancel: '取消',
        isRemote: true,
        model: model
      });
      event.preventDefault();
    },
    select_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id');
      this.saveModel(target, id, target.attr('name'), target.val());
    },
    star_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id');
      this.saveModel(target.add(target.siblings('.star')), id, target.attr('name'), target.val());
    },
    statusButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , data = _.extend({active: 1, deactive: 0}, target.data())
        , value = target.prop('checked') ? data.deactive : data.active
        , id = target.closest('tr').attr('id');
      this.saveModel(target, id, target.attr('name'), value);
    },
    sortUpdateHandler: function (event, ui) {
      var item = ui.item
        , index = item.index()
        , id = item.attr('id')
        , model = this.collection.get(id)
        , curr = this.collection.indexOf(model)
        , start = this.collection.pagesize * this.model.get('page') || 0;
      this.collection.models.splice(curr, 1);
      this.collection.models.splice(index, 0, model);
      this.collection.trigger('sort', model, index);
      this.collection.each(function (model, i) {
        if (model.changedAttributes({seq: start + i})) {
          model.save({seq: start + i}, {wait: true, patch: true});
        }
      });
    }
  });
}(Nervenet.createNameSpace('tp.component')));
