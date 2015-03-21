'use strict';
(function (ns) {
  ns.SmartTable = Backbone.View.extend({
    $context: null,
    fragment: '',
    events: {
      'click .add-row-button': 'addRowButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click tbody .filter': 'tbodyFilter_clickHandler',
      'click thead .filter': 'theadFilter_clickHandler',
      'click .order': 'order_clickHandler',
      'change select.edit': 'select_changeHandler',
      'change .stars input': 'star_changeHandler',
      'change .status-button': 'statusButton_clickHandler',
      'sortupdate': 'sortUpdateHandler'
    },
    initialize: function (options) {
      this.template = Handlebars.compile(this.$('script').remove().html().replace(/\s{2,}|\n/g, ''));
      var init = this.$el.data();
      init.url = init.url.replace('{{API}}', tp.API);
      options = _.extend({
        pagesize: 10,
        autoFetch: true
      }, options, init);
      this.filter = tp.utils.decodeURLParam(init.filter);
      this.include = init.include ? init.include.split(',') : null; // 每个model应该继承的属性
      if (init.model) {
        options.model = Nervenet.parseNamespace(init.model);
      }

      this.collection = tp.model.ListCollection.createInstance(null, options);
      this.collection.on('add', this.collection_addHandler, this);
      this.collection.on('change', this.collection_changeHandler, this);
      this.collection.on('remove', this.collection_removeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);

      // 通过页面中介来实现翻页等功能
      this.model = this.model && this.model instanceof tp.model.TableMemento ? this.model : new tp.model.TableMemento();
      this.model.on('change', this.model_changeHandler, this);
      this.model.on('invalid', this.model_invalidHandler, this);

      // 启用搜索
      if ('search' in init) {
        this.search = new ns.table.Search({
          el: init.search,
          model: this.model
        });
      }

      // 翻页
      if ('pagesize' in init && init.pagesize > 0) {
        this.pagination = new ns.table.Pager(_.extend({}, options, {
          el: 'pagination' in init ? init.pagination : '.pager',
          model: this.model
        }));
      }

      // 调整每页数量
      if ('pagesizeController' in init) {
        this.pagesizeController = $(init.pagesizeController);
        this.pagesizeController.val(this.collection.pagesize);
        this.pagesizeController.on('change', _.bind(this.pagesize_changeHandler, this));
      }

      // 起止日期
      if ('ranger' in init) {
        this.ranger = new ns.table.Ranger(_.extend({}, options, {
          el: init.ranger,
          model: this.model
        }));
      }

      if (options.autoFetch) {
        this.filter = _.extend(this.filter, this.model.toJSON());
        this.collection.fetch({
          data: this.filter
        });
      }
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
      this.$el.removeClass('loading');
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
      var html = this.template(model.toJSON());
      this.$('#' + (model.id || model.cid)).replaceWith(html);
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
      this.model.waiting = false;
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
      this.filter = _.extend(this.filter, model.toJSON());
      this.collection.fetch({data: this.filter});
      this.$el.addClass('loading');
      model.warting = true;
      model.unset('keyword', {silent: true});
    },
    model_invalidHandler: function (model, error) {
      alert(error);
    },
    order_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , order = target.attr('href').substr(2);
      this.$('.order.active').not(target).removeClass('active inverse');
      target.toggleClass('inverse', target.hasClass('active') && !target.hasClass('inverse')).addClass('active');
      this.model.set({
        order: order,
        seq: target.hasClass('inverse') ? 'desc' : 'asc'
      });
      event.preventDefault();
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      this.collection.fetch(this.filter);
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
    tbodyFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , path = target.attr('href').split('/').slice(-2)
        , hasFilter = this.model.has(path[0]);
      this.model.set(path[0], path[1]);
      if (hasFilter) {
        this.$('.filters').find('[href="#/' + path[0] + '"]').replaceWith(target.clone());
      } else {
        this.$('.filters').append(target.clone());
      }
      event.preventDefault();
    },
    theadFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , path = target.attr('href').split('/').slice(-2);
      this.model.unset(path[0]);
      target.remove();
      event.preventDefault();
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