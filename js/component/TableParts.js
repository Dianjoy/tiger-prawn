/**
 * Created by meathill on 15/3/7.
 */
'use strict';
(function (ns, _, Backbone) {
  /**
   * @class
   */
  ns.Pager = Backbone.View.extend({
    events: {
      'click a': 'clickHandler'
    },
    initialize: function (options) {
      this.template = this.$('script').remove().html() || '';
      this.template = this.template ? Handlebars.compile(this.template) : false;
      this.pagesize = this.collection.pagesize;
      this.total = Math.ceil(options.length / this.pagesize);
      this.render();
      this.displayPageNum();
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.model = this.collection = null;
      Backbone.View.prototype.remove.call(this);
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
      this.$('[href="#/to/' + page + '"]').closest('.hidden-xs').addClass('active')
        .siblings().removeClass('active');
      this.$el.each(function () {
        $(this).children().first().toggleClass('disabled', page === 0)
          .end().last().toggleClass('disabled', page >= total - 1);
      });
    },
    setTotal: function (total, pagesize) {
      this.pagesize = pagesize || this.pagesize;
      this.total = Math.ceil(total / this.pagesize);
      this.render();
      this.displayPageNum();
    },
    collection_syncHandler: function () {
      this.setTotal(this.collection.total, this.collection.pagesize);
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
      target.html(tp.component.spinner);
      this.$el.children().addClass('disabled');
      event.preventDefault();
    }
  });

  /**
   * @class
   */
  ns.Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    initialize: function () {
      if (this.model.get('keyword')) {
        this.$el.val(this.model.get('keyword'));
      }
      if (this.el.value) {
        this.model.set('keyword', this.el.value, {silent: true});
      }
      this.model.on('change:keyword', this.model_changeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
    },
    remove: function () {
      this.model.off(null, null, this);
      this.collection.off(null, null, this);
      this.collection = this.model = null;
      Backbone.View.prototype.remove.call(this);
    },
    collection_syncHandler: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    model_changeHandler: function (model, keyword) {
      this.el.value = keyword || '';
      this.$el.prop('readonly', true);
      this.spinner = this.spinner || $(tp.component.spinner);
      this.spinner.insertAfter(this.$el);
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        event.preventDefault();
        var no_keyword = !event.target.value;
        this.model.unset('keyword', {silent: !no_keyword}); // 这次搜索之前要先把关键字删掉，保证触发change
        if (!no_keyword) {
          this.model.set({
            keyword: event.target.value,
            page: 0
          });
        }
      }
    }
  });

  /**
   * @class
   */
  ns.Filter = Backbone.View.extend({
    events: {
      'change': 'changeHandler',
      'dp.change .filter': 'changeHandler'
    },
    initialize: function () {
      this.model.on('change', this.model_changeHandler, this);
      this.collection.on('sync', this.collection_syncHandler, this);
      this.render();
    },
    render: function () {
      var data = this.model.toJSON();
      for (var prop in data) {
        var input = this.$('[name=' + prop + ']');
        if (input.is('select')) {
          input
            .val(data[prop])
            .data('value', data[prop]);
        } else if (input.is('[type=radio], [type=checkbox]')) {
          input.filter('[value="' + data[prop] + '"]').prop('checked', true)
            .parent('label').addClass('active')
            .siblings().removeClass('active');
        } else {
          input.val(data[prop]);
        }
      }
    },
    remove: function () {
      this.collection.off(null, null, this);
      this.collection = this.model = null;
      Backbone.View.prototype.remove.call(this);
    },
    collection_syncHandler: function () {
      this.$('.fa-spin').remove();
      this.$('select').prop('disabled', false);

      // 用options里的值填充select
      var options = this.collection.options;
      if (!options) {
        return;
      }
      this.$('select').each(function () {
        var self = $(this)
          , name = self.data('options');
        if (!(name in options) || self.hasClass('ready')) {
          return true;
        }
        var template = self.find('script').html()
          , fixed = self.find('.fixed');
        template = Handlebars.compile(template);
        self
          .addClass('ready')
          .html(template(options))
          .prepend(fixed)
          .val(self.data('value'));
      });
    },
    model_changeHandler: function () {
      this.$('select').prop('disabled', true);
    },
    changeHandler: function (event) {
      var target = event.target
        , name = target.name
        , value = target.value;
      if (!name) {
        return;
      }
      if (!value) {
        this.model.set('page', 0, {silent: true});
        this.model.unset(name, {reset: true});
      } else {
        var attr = {page: 0};
        attr[name] = value;
        this.model.set(attr, {
          reset: true
        });
      }
      $(target).after(tp.component.spinner);
    }
  });

  /**
   * @class
   */
  ns.FixedHeader = Backbone.View.extend({
    className: 'fixed-table-header',
    tagName: 'div',
    visible: false,
    events: {
      'click .filter,.order': 'button_clickHandler'
    },
    initialize: function (options) {
      this.target = options.target;
      this.target.on('table-rendered', this.render, this);
      this.top = this.target.$el.offset().top;
      this.scrollHandler = _.bind(this.scrollHandler, this);
      $(window).scroll(this.scrollHandler);
      this.$el.appendTo('body');
    },
    remove: function () {
      this.target = null;
      $(window).off('scroll', this.scrollHandler);
      Backbone.View.prototype.remove.call(this);
    },
    render: function () {
      var clone = this.target.$el.clone()
        , ths = clone.find('th');
      clone.find('tbody, tfoot').remove();
      this.target.$('th').each(function (i) {
        ths[i].width = this.offsetWidth;
      });
      this.$el.html(clone);
    },
    button_clickHandler: function (event) {
      var type = event.target.className.indexOf('filter') != -1 ? 'filter' : 'order';
      this.target.$('thead .' + type + '[href="' + event.target.hash + '"]').click();
      event.preventDefault();
    },
    scrollHandler: function () {
      var scroll = document.body.scrollTop + 70; // 50是topbar高度，20是间隙
      if (scroll > this.top) {
        if (!this.visible) {
          this.visible = true;
          this.$el.show();
        }
      } else {
        this.$el.hide();
        this.visible = false;
      }
    }
  });
}(Nervenet.createNameSpace('tp.component.table'), _, Backbone));