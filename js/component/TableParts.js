/**
 * Created by meathill on 15/3/7.
 */
'use strict';
(function (ns) {
  var DATE_FORMAT = 'YYYY-MM-DD'
    , spinner = '<i class="fa fa-spin fa-spinner"></i>';

  ns.Pager = Backbone.View.extend({
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
    clickHandler: function (event) {
      var target = $(event.currentTarget)
        , parent = target.parent();
      if (parent.hasClass('disabled') || parent.hasClass('active')) {
        return false;
      }
      var href = target.attr('href')
        , index = Number(href.substr(href.lastIndexOf('/') + 1));
      this.model.set('page', index);
      target.html(spinner);
      this.$el.children().addClass('disabled');
      event.preventDefault();
    }
  });

  ns.Ranger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function (options) {
      this.$('[type=date]').datetimepicker({format: DATE_FORMAT});
      this.render(options);
    },
    render: function (options) {
      // 默认显示一个月
      var range = _.extend({
        start: -31,
        end: 0
      }, _.pick(options, 'start', 'end'));
      range.start = moment().add(range.start, 'days').format(DATE_FORMAT);
      range.end = moment().add(range.end, 'days').format(DATE_FORMAT);
      this.model.set(range, {silent: true});
      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
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

  ns.Search = Backbone.View.extend({
    events: {
      'keydown': 'keydownHandler'
    },
    start: function () {
      this.$el.prop('readonly', false);
      this.spinner && this.spinner.remove();
    },
    keydownHandler: function (event) {
      if (event.keyCode === 13) {
        this.model.set({
          keyword: event.target.value,
          page: 0
        });
        this.$el.prop('readonly', true);
        this.spinner = this.spinner || $(spinner);
        this.spinner.insertAfter(this.$el);
      }
    }
  });
}(Nervenet.createNameSpace('tp.component.table')));