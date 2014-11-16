;(function (ns) {
  'use strict';

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

  var DATE_FORMAT = 'YYYY-MM-DD';
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

  ns.SmartTable = Backbone.View.extend({
    $context: null,
    $router: null,
    events: {
      'click .add-row-button': 'addRowButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .status-button': 'statusButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'change .edit': 'edit_changeHandler',
      'change .stars input': 'star_changeHandler',
      'sortupdate': 'sortUpdateHandler'
    },
    initialize: function () {
      this.template = Handlebars.compile(this.$('script').html().replace(/\s{2,}|\n/g, ''));
      var init = this.$el.data()
        , options = {
          url: init.url.replace('{{API}}', tp.API),
          pagesize: init.pagesize || 10
        };
      this.filter = tp.utils.decodeURLParam(init.filter);
      this.include = init.include ? init.include.split(',') : null; // 每个model应该继承的属性
      if ('id' in init) {
        options.model = tp.model.ListCollection.prototype.model.extend({idAttribute: init.id});
      }
      if ('collectionId' in init) {
        options.id = init.collectionId;
      }
      this.collection = tp.model.ListCollection.createInstance(null, options);
      this.collection.on('reset', this.collection_resetHandler, this);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);

      // 通过页面中介来实现翻页等功能
      this.model = new Backbone.Model();
      this.model.on('change', this.model_changeHandler, this);

      // 启用搜索
      this.$context.mapEvent('search', this.searchHandler, this);

      // 翻页
      if ('pagesize' in init && init.pagesize > 0) {
        this.pagination = new Pager({
          el: init && 'pagination' in init ? init.pagination : this.$('.pager'),
          model: this.model,
          pagesize: init.pagesize
        });
      }

      // 允许对表格排序
      if (this.$el.hasClass('sortable')) {
        this.$('tbody').sortable();
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
        this.pagination.off();
        this.pagination.remove();
      }
      if (this.pagesizeController) {
        this.pagesizeController.off('change');
      }
      if (this.ranger) {
        this.ranger.remove();
      }
      this.collection.off();
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      this.model.off(null, null, this);
      this.$context.removeEvent('search', this.searchHandler);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      this.$('.waiting').hide();
      this.$('tbody').html(this.template({list: this.collection.toJSON()}));
      var items = this.$('tbody').children();
      this.collection.each(function (model, i) {
        if (i > items.length - 1) {
          return;
        }
        if (!model.id) {
          items[i].id = model.cid;
        }
      });
      // TODO: 暂时没有想到更好的办法，将来用handlebars的helper来处理表单的选中吧
      this.$('.stars').each(function () {
        $(this).find('input[value=' + $(this).data('value') + ']').prop('checked', true);
      });
      this.$('select.edit').val(function () {
        return $(this).attr('value');
      });
      if (this.pagination) {
        this.pagination.setTotal(this.collection.total);
      }
      this.$context.trigger('table-rendered');
    },
    addRowButton_clickHandler: function () {
      this.collection.add(this.model.pick(this.include));
    },
    collection_addHandler: function (model) {
      var item = $(this.template({list: [model.toJSON()]}));
      item.attr('id', function () {
        return model.id || model.cid;
      }).addClass('animated flash');
      this.$('tbody')[this.$('.add-row-button').length ? 'append' : 'prepend'](item);
    },
    collection_changeHandler: function (model) {
      var changed = model.changed
        , tr = this.$('#' + ('id' in changed ? model.cid : model.id))
        , target;
      if ('id' in changed) {
        tr.replaceWith(this.template({list: [model.toJSON()]}));
        return;
      }
      for (var prop in changed) {
        target = tr.find('[href=#' + prop + ']');
        if (target.data('refresh')) {
          var tr = $(this.template({list: [model.toJSON()]}))
            , index = target.closest('td').index();
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
    collection_removeHandler: function (model) {
      this.$('#' + (model.id || model.cid)).fadeOut(function () {
        $(this).remove();
      })
    },
    collection_resetHandler: function () {
      this.render();
      this.$context.trigger('table-ready');
    },
    deleteButton_clickHandler: function (event) {
      if (!confirm('确定删除么？')) {
        return;
      }
      var target = $(event.currentTarget)
        , tr = target.closest('tr');
      target.prop('disabled', true)
        .find('i').addClass('fa-spin fa-spinner');
      this.collection.get(tr.attr('id')).destroy({
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
    edit_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id')
        , prop = target.attr('name');
      this.collection.get(id).save(prop, target.val(), {
        patch: true
      });
    },
    model_changeHandler: function (model) {
      this.filter = _.extend(this.filter, model.changed);
      this.collection.fetch(this.filter);
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      this.collection.fetch(this.filter);
    },
    star_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , id = target.closest('tr').attr('id')
        , model = this.collection.get(id);
      model.save({
        remark: target.val()
      }, {
        wait: true,
        patch: true
      });
    },
    statusButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , prop = event.currentTarget.hash.substr(1)
        , data = _.extend({active: 1, deactive: 0}, target.data())
        , value = target.hasClass('active') ? data.deactive : data.active
        , id = target.closest('tr').attr('id');
      this.collection.get(id).save(prop, value, {patch: true});
      event.preventDefault();
    },
    searchHandler: function (keyword) {
      this.filter.page = 0;
      this.filter.keyword = keyword;
      this.model.set({
        page: 0,
        keyword: keyword
      });
      this.collection.fetch(this.filter);
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
