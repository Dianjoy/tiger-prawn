'use strict';
(function (ns) {
  var filterLabel = Handlebars.compile('<a href="#/{{key}}/{{value}}" class="filter label label-{{key}}">{{value}}</a>');

  ns.SmartTable = ns.BaseList.extend({
    $context: null,
    events: {
      'click .add-row-button': 'addRowButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click tbody .filter': 'tbodyFilter_clickHandler',
      'click thead .filter': 'theadFilter_clickHandler',
      'click .order': 'order_clickHandler',
      'change select.edit': 'select_changeHandler',
      'change .stars input': 'star_changeHandler',
      'change .status-button': 'statusButton_clickHandler'
    },
    initialize: function (options) {
      var init = this.$el.data();
      init.url = init.url.replace('{{API}}', tp.API);
      options = _.extend({
        pagesize: 10,
        autoFetch: true
      }, options, init);
      if (init.model) {
        options.model = Nervenet.parseNamespace(init.model);
      }
      // 特定的过滤器
      this.params = tp.utils.decodeURLParam(init.params);

      this.collection = tp.model.ListCollection.getInstance(options);
      ns.BaseList.prototype.initialize.call(this, {container: 'tbody'});

      // 通过页面中介来实现翻页等功能
      this.model = this.model && this.model instanceof tp.model.TableMemento ? this.model : new tp.model.TableMemento();
      this.model.on('change', this.model_changeHandler, this);
      this.model.on('invalid', this.model_invalidHandler, this);
      this.renderHeader();

      // 启用搜索
      if ('search' in init) {
        this.search = new ns.table.Search({
          el: init.search,
          model: this.model,
          collection: this.collection
        });
      }

      // 翻页
      if ('pagesize' in init && init.pagesize > 0) {
        this.pagination = new ns.table.Pager(_.extend({}, options, {
          el: 'pagination' in init ? init.pagination : '.pager',
          model: this.model,
          collection: this.collection
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

      // 删选器
      if ('filter' in init) {
        this.filter = new ns.table.Filter({
          el: init.filter,
          model: this.model,
          collection: this.collection
        });
      }

      if (options.autoFetch) {
        this.collection.fetch({
          data: _.extend(this.model.toJSON(), this.params)
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
      if (this.filter) {
        this.filter.remove();
      }
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      ns.BaseList.prototype.remove.call(this);
    },
    render: function () {
      ns.BaseList.prototype.render.call(this);
      this.$context.trigger('table-rendered');
      // 排序
      if ('order' in this.model.changed || 'seq' in  this.model.changed) {
        var container = this.container;
        this.collection.each(function (model) {
          container.append(container.find('#' + model.id));
        });
      }
    },
    renderHeader: function () {
      // 排序
      var order = this.model.get('order')
        , seq = this.model.get('seq')
        , status = this.model.omit('keyword', 'order', 'seq')
        , labels = '';
      if (order) {
        this.$('.order').removeClass('active inverse');
        this.$('.order[href=#' + order + ']').addClass('active').toggleClass('inverse', seq == 'desc');
      }
      _.each(status, function (value, key) {
        labels += filterLabel({key: key, value: value});
      });
      this.$('.filters').append(labels);
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
      this.collection.add(null, {
        immediately: true,
        prepend: !!prepend
      });
    },
    collection_syncHandler: function () {
      ns.BaseList.prototype.collection_syncHandler.call(this);
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
        error: function (model, xhr) {
          var response = 'responseJSON' in xhr ? xhr.responseJSON : xhr;
          target.prop('disabled', false)
            .find('i').removeClass('fa-spin fa-spinner');
          console.log(response.msg);
          alert(response.msg || '删除失败');
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
      event.stopPropagation();
      event.preventDefault();
    },
    model_changeHandler: function (model, options) {
      options = _.omit(options, 'unset') || {};
      options.data = _.extend(model.toJSON(), this.params);
      this.collection.fetch(options);
      this.$el.addClass('loading');
      model.warting = true;
    },
    model_invalidHandler: function (model, error) {
      alert(error);
    },
    order_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , order = target.attr('href').substr(1);
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
      this.collection.fetch({data: _.extend(model.toJSON(), this.params)});
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
    }
  });
}(Nervenet.createNameSpace('tp.component')));