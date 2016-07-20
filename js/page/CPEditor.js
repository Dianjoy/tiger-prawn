/**
 * Created by meathill on 15/9/8.
 */
'use strict';
(function (ns, _, Backbone) {
  /**
   * @class
   * @type Backbone.View
   */
  var Model = Backbone.Model.extend({
      toJSON: function () {
        var json = Backbone.Model.prototype.toJSON.call(this);
        json.cid = this.cid;
        return json;
      }
    })
    , Collection = Backbone.Collection.extend({
      model: Model
    });

  ns.CPEditor = Backbone.View.extend({
    $context: null,
    events: {
      'click .add-button': 'addButton_clickHandler',
      'click .delete-button': 'deleteButton_clickHandler',
      'change .num': 'num_changeHandler'
    },
    initialize: function () {
      this.model = this.$context.getValue('diy');
      this.model.on('change:id', this.createdHandler, this);
      this.plans = new Collection();
      this.plans.on('add', this.plan_addHandler, this);
      this.plans.on('remove', this.plan_removeHandler, this);

      this.template = Handlebars.compile(this.$('script').remove().html());
      if (!this.$el.hasClass('renew') && !this.$el.hasClass('edit')) {
        var model = new Model();
        this.plans.add(model);
      }
      if (this.model.has('plans')) {
        this.plans.set(this.model.get('plans'));
      }
      this.countDown = _.bind(this.countDown, this);
    },
    countDown: function () {
      this.$('.success-info span').text(this.count);
      this.count -= 1;
      if (this.count === 0) {
        location.hash = '#/diy/';
      } else {
        setTimeout(this.countDown, 1000);
      }
    },
    addButton_clickHandler: function (event) {
      this.plans.add(new Model());
      event.stopPropagation();
    },
    num_changeHandler: function () {
      var total = _.reduce(this.$('.num'), function (memo, input) {
        return memo + Number(input.value);
      }, 0);
      this.$('[name=total_num]').val(total);
    },
    plan_addHandler: function (model) {
      this.$('tbody').append(this.template(model.toJSON()));
      this.$('#' + model.cid + ' .datetimepicker').datetimepicker({
        'minDate': new moment(),
        'format': moment.DATETIME_FORMAT
      });
    },
    plan_removeHandler: function (model) {
      this.$('#' + model.cid).remove();
    },
    deleteButton_clickHandler: function (event) {
      var model = this.plans.get($(event.currentTarget).closest('tr').attr('id'));
      this.plans.remove(model);
    },
    createdHandler: function (model, id) {
      if (id) {
        this.$('.success-info')
          .html(function (i, html) {
            return html.replace('{{id}}', id);
          })
          .removeClass('hide');
        this.count = 3;
        this.countDown();
      }
    }
  });
}(Nervenet.createNameSpace('tp.page'), _, Backbone));