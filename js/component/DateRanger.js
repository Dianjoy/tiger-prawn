/**
 * Created by meathill on 15/11/16.
 */
'use strict';
(function (ns) {
  ns.DateRanger = Backbone.View.extend({
    events: {
      'click .shortcut': 'shortcut_clickHandler',
      'click .range input': 'input_clickHandler',
      'click .range button': 'range_clickHandler'
    },
    initialize: function () {
      this.$('[type=date]').datetimepicker({format: moment.DATE_FORMAT});
      this.template = this.$('script').html();
    },
    render: function (options) {
      // 默认显示一个月
      var range = _.extend({
        start: -31,
        end: 0
      }, _.pick(options, 'start', 'end'));

      if (!isNaN(range.start)) {
        range.start = moment().add(range.start, 'days').format(moment.DATE_FORMAT);
      }
      if (!isNaN(range.end)) {
        range.end = moment().add(range.end, 'days').format(moment.DATE_FORMAT);
      }

      this.$('[name=start]').val(range.start);
      this.$('[name=end]').val(range.end);
      return range;
    },
    trigger: function (range, options) {
      options = options || {};
      options.reset = true;
      this.model.set(range, options);
    },
    use: function (model) {
      this.model = model;
      var range = this.render(model.pick('start', 'end'));
      this.trigger(range, {silent: true});
    },
    input_clickHandler: function (event) {
      event.stopPropagation();
    },
    range_clickHandler: function () {
      var start = this.$('[name=start]').val()
        , end = this.$('[name=end]').val();
      this.$('.shortcut').removeClass('active');
      this.$('.label').text(start + ' - ' + end);
      this.trigger({
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
      this.$('.label').text(item.text());
      var range = this.render({start: start, end: end});
      this.trigger(range);
      event.preventDefault();
    }
  });
}(Nervenet.createNameSpace('tp.component')));