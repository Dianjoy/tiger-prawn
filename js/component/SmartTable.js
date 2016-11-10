'use strict';
(function (ns, _) {
  var filterLabel = Handlebars.compile('<a href="#/{{key}}/{{value}}" class="filter label label-{{key}}">{{#if label}}{{label}}{{else}}{{value}}{{/if}}</a>');

  /**
   * @class
   */
  ns.SmartTable = ns.BaseList.extend({
    $context: null,
    $ranger: null,
    autoFetch: true,
    events: {
      'click .archive-button': 'archiveButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'click .refresh-button': 'refreshButton_clickHandler',
      'click .edit': 'edit_clickHandler',
      'click tbody .filter': 'tbodyFilter_clickHandler',
      'click thead .filter': 'theadFilter_clickHandler',
      'click .order': 'order_clickHandler',
      'change select.edit': 'select_changeHandler',
      'change .stars input': 'star_changeHandler',
      'change .status-button': 'statusButton_changeHandler'
    },
    initialize: function (options) {
      var data = this.$el.data()
        , autoFetch = 'autoFetch' in data ? data.autoFetch : this.autoFetch
        , typeahead = 'typeahead' in data ? data.typeahead : true;
      ns.BaseList.prototype.initialize.call(this, _.extend(options, {
        autoFetch: false,
        container: 'tbody',
        reset: true
      }));

      // 通过页面中介来实现翻页等功能
      this.model = this.model && this.model instanceof tp.model.TableMemento ? this.model : new tp.model.TableMemento(this.params, {tableId: this.el.id});
      this.model.on('change', this.model_changeHandler, this);
      this.model.on('invalid', this.model_invalidHandler, this);
      if (options.tags) {
        this.model.tags = options.tags.split(',');
      }
      if (this.model.has('start')) {
        if (this.collection.model && !_.isString(this.collection.model)) {
          _.extend(this.collection.model.prototype.defaults, this.model.pick('start', 'end'));
        }
      }
      this.renderHeader();

      // 启用搜索
      if ('search' in options) {
        this.search = new ns.table.Search({
          el: options.search,
          model: this.model,
          collection: this.collection
        });
      }

      // 翻页
      if ('pagesize' in options && options.pagesize > 0) {
        this.pagination = new ns.table.Pager(_.extend({}, options, {
          el: 'pagination' in options ? options.pagination : '.pager',
          model: this.model,
          collection: this.collection
        }));
      }

      // 调整每页数量
      if ('pagesizeController' in options) {
        this.pagesizeController = $(options.pagesizeController);
        this.pagesizeController.val(this.collection.pagesize);
        this.pagesizeController.on('change', _.bind(this.pagesize_changeHandler, this));
      }

      // 起止日期
      if ('ranger' in options) {
        if (!this.model.has('start')) {
          this.model.set(_.pick(options, 'start', 'end'), {silent: true});
        }
        if ('dateFormat' in options) {
          this.model.set('dateFormat', options.dateFormat, {silent: true});
        }
        this.$ranger.use(this.model);
      }

      // 删选器
      if ('filter' in options) {
        this.filter = new ns.table.Filter({
          el: options.filter,
          model: this.model,
          collection: this.collection
        });
      }
      
      // 导出按钮
      if ('exportButton' in options) {
        this.exportButton = new tp.component.ExportButton({
          model: this.model,
          el: options.exportButton
        });
      }

      // 桌面默认都固定表头
      if (document.body.clientWidth >= 768 && this.$el.closest('modal').length === 0 && typeahead) {
        this.header = new ns.table.FixedHeader({
          target: this
        });
      }

      if (autoFetch) {
        this.refresh(options);
      }
      this.options = options;
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
      if (this.header) {
        this.header.remove();
      }
      if (this.exportButton) {
        this.exportButton.remove();
      }
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      tp.model.ListCollection.destroyInstance(this.$el.data('collection-id'));
      ns.BaseList.prototype.remove.call(this);
    },
    render: function () {
      ns.BaseList.prototype.render.call(this);
      this.$context.trigger('table-rendered', this);
      this.trigger('table-rendered', this);
      // 排序
      if ('order' in this.model.changed || 'seq' in  this.model.changed) {
        var container = this.container;
        this.collection.each(function (model) {
          container.append(container.find('#' + model.id));
        });
      }
    },
    refresh: function (options) {
      options = options || {};
      options.data = _.extend(this.model.toJSON(), options.data);
      this.collection.fetch(options);
    },
    renderHeader: function () {
      // 排序
      var order = this.model.get('order')
        , seq = this.model.get('seq')
        , status = this.model.getTags()
        , labels = _.chain(status)
          .omit(function (value, key) {
            return key.match(/_label$/);
          })
          .map(function (value, key) {
            var attr = {key: key, value: value};
            if (status[key + '_label']) {
              attr['label'] = status[key + '_label'];
            }
            return filterLabel(attr);
          })
          .value();
      if (order) {
        this.$('.order').removeClass('active inverse');
        this.$('.order[href="#' + order + '"]').addClass('active').toggleClass('inverse', seq == 'desc');
      }
      this.$('.filters').append(labels.join(''));
    },
    saveModel: function (button, id, prop, value, options) {
      button.spinner();
      this.collection.get(id).save(prop, value, {
        patch: true,
        wait: true,
        context: this,
        success: function () {
          button.spinner(false);
          if (options && options.remove) {
            this.collection.remove(id, {fadeOut: true});
          }
        }
      });
    },
    archiveButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , msg = button.data('msg') || '确定归档么？';
      if (!confirm(msg)) {
        return;
      }
      var id = button.closest('tr').attr('id');
      this.saveModel(button, id, button.attr('name'), button.val(), {remove: true});
    },
    collection_errorHandler: function (collection, response) {
      this.$('.waiting td').html(ns.Manager.createErrorMsg(response));
    },
    collection_syncHandler: function () {
      ns.BaseList.prototype.collection_syncHandler.call(this);
      this.model.waiting = false;
      if (this.options.amount) {
        var data = this.collection.getAmount(this.options.omits);
        this.$('.amount').remove();
        this.collection_addHandler(data, null, {immediately: true});
      }
    },
    deleteButton_clickHandler: function (event) {
      var button = $(event.currentTarget)
        , id = button.closest('tr').attr('id')
        , data = button.data()
        , msg = data.msg || '确定删除么？'
        , hasPopup = data.hasPopup
        , destroy = function (popup) {
          var param = {};
          if (!popup && !confirm(msg)) {
            return;
          }
          if (popup) {
            _.each(popup.$el.find('form').serializeArray(), function(element) {
              param[element.name] = element.value
            });
          }
          button.spinner();
          this.collection.get(id).destroy({
            fadeOut: true,
            data: JSON.stringify(param),
            contentType: 'application/json',
            wait: true,
            error: function (model, xhr) {
              var response = 'responseJSON' in xhr ? xhr.responseJSON : xhr;
              button.spinner(false);
              alert(response.msg || '删除失败');
            }
          });
        };
      if (hasPopup) {
        if (data.collectionId) {
          var collection = tp.model.ListCollection.getInstance(data);
          data.model = collection.get(data.id);
        }
        var popup = tp.popup.Manager.popup(_.extend({
          isRemote: true,
          content: button.attr('href')
        }, data));
        popup.on('confirm', destroy, this);
      } else {
        destroy();
      }
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
        , tr = target.closest('tr')
        , id = tr.attr('id')
        , options = _.extend({
          label: this.$('thead th').eq(index).text()
        }, data);
      if (!id) {
        var relate = tr.attr('class').match(/\brelate-to-(\w+)\b/);
        id = relate ? relate[1] : false;
      }
      if (!id) {
        alert('未查询到对象id，无法启动编辑。');
        return;
      }
      var model = this.collection.get(id);
      options.type = data.type || 'short-text';
      this.$context.trigger('edit-model', model, prop, options);
      event.stopPropagation();
      event.preventDefault();
    },
    model_changeHandler: function (model, options) {
      options = _.omit(options, 'unset') || {};
      this.refresh(options);

      if (this.collection.model && ('start' in model.changed || 'end' in model.changed)) {
        _.extend(this.collection.model.prototype.defaults, _.pick(model.changed, 'start', 'end'));
      }
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
      }, {reset: true});
      event.preventDefault();
    },
    pagesize_changeHandler: function (event) {
      this.collection.setPagesize(event.target.value);
      if (this.model.get('page') === 0) {
        this.model.trigger('change', this.model);
      } else {
       this.model.set('page', 0);
      }
    },
    refreshButton_clickHandler: function (event) {
      this.refresh();
      $(event.currentTarget).spinner();
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
    statusButton_changeHandler: function (event) {
      var target = $(event.currentTarget)
        , data = _.extend({active: 1, deactive: 0}, target.data())
        , value = target.prop('checked') ? data.active : data.deactive
        , id = target.closest('tr').attr('id')
        , button = $(target[0].labels).filter('.btn');
      this.saveModel(button, id, target.attr('name'), value);
    },
    tbodyFilter_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , label = target.text()
        , path = target.attr('href').split('/').slice(-2)
        , hasFilter = this.model.has(path[0])
        , attr = { page: 0 }; // 要自动切回第一页
      attr[path[0]] = path[1];
      if (path[0] != label) {
        attr[path[0] + '_label'] = label;
      }
      this.model.set(attr, {reset: true});
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
      this.model.set('page', 0, {silent: true}) // 自动切回第一页
        .unset(path[0], {reset: true});
      target.remove();
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component'), _));