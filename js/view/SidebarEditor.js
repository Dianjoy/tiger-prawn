'use strict';
(function (ns, $, _, Backbone) {
  var HIDDEN_ITEMS = tp.PROJECT + '-hidden-items'
    , COLLAPSED_STATUS = tp.PROJECT + '-sidebar-collapsed';
  /**
   * @class
   */
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click .eye-edit-button': 'eyeEditButton_clickHandler',
      'click .accordion-toggle': 'accordionToggle_clickHandler',
      'click #menu-edit-button': 'menuEditButton_clickHandler',
      'click #edit-confirm-button': 'editConfirmButton_clickHandler',
      'click #edit-cancel-button': 'editCancelButton_clickHandler',
      'click #menu-search-button': 'menuSearchButton_clickHandler',
      'click #search-clear-button': 'searchClearButton_clickHandler',
      'click #menu-collapse-button': 'menuCollapseButton_clickHandler',
      'blur #menu-search-input': 'menuSearchInput_blurHandler',
      'keyup #menu-search-input': 'menuSearchInput_keyupHandler'
    },
    initialize: function () {
      this.is_collapsed = !!localStorage.getItem(COLLAPSED_STATUS);
      this.hiddenItems = JSON.parse(localStorage.getItem(HIDDEN_ITEMS)) || [];
      this.template = Handlebars.compile(this.$('#navbar-side-inner').find('script').remove().html());
      this.breadcrumbContainer = $('#breadcrumb-container');
      this.breadcrumb = Handlebars.compile(this.breadcrumbContainer.find('.breadcrumb-items').remove().html());
    },
    render: function () {
      this.$('.sidebar-nav-item').remove();
      var role = this.model.get('sidebar') ? this.model.get('sidebar') : 'default';
      $.getJSON('page/sidebar/' + role + '.json', _.bind(function (response) {
        _.each(response, function (parent) {
          var item = parent['link'] || parent['sub-id'];
          parent.invisible = this.hiddenItems.indexOf('parent-' + item) !== -1;
          if (parent.sub)  {
            _.each(parent.sub, function (child) {
              child.invisible = this.hiddenItems.indexOf(child.link) !== -1;
            }, this);
          }
        }, this);
        response = _.reject(response, function (item) {
          return item.only && !_.contains(item.only.split(','), this.model.get('id'));
        }, this);
        this.sidebarItems = response;
        if (this.refreshBreadcrumb) {
          this.setBreadcrumb();
        }
        var html = this.template({list: response});
        this.$('#navbar-side-inner').append(html);
        $('body').toggleClass('sidebar-collapsed', this.is_collapsed);
      }, this));
    },
    getBreadcrumb: function () {
      if (this.sidebarItems) {
        this.setBreadcrumb();
      } else {
        this.refreshBreadcrumb = true;
      }
    },
    setBreadcrumb: function () {
      var items = [];
      _.each(this.sidebarItems, function (parent) {
        if (parent.link) {
          items = this.setBreadcrumbTitle(items, [parent], parent.link);
        } else {
          _.each(parent.sub, function (child) {
            items = this.setBreadcrumbTitle(items, [parent, child], child.link);
          }, this);
        }
      }, this);
      items.unshift({title: '首页'});
      items[items.length - 1].active = true;
      this.breadcrumbContainer.find('.breadcrumb-item').remove();
      this.breadcrumbContainer.prepend(this.breadcrumb({breadcrumb: items}));
    },
    setBreadcrumbTitle: function (items, breadcrumb, link) {
      var hash = location.hash
        , itemsLink = items.length ? items[items.length - 1].link : '';
      if (hash.indexOf(link) !== -1 && itemsLink.length < link.length) {
        items = _.map(breadcrumb, function (element) {
          return {
            title: element.title,
            link: element.link
          }
        });
      }
      return items;
    },
    eyeEditButton_clickHandler: function (event) {
      var li = $(event.currentTarget).closest('li');
      li.toggleClass('hidden');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      this.$('.collapse').collapse('show');
    },
    editConfirmButton_clickHandler: function () {
      var hiddenItems = _.map(this.$('.hidden'), function (node) {
        return node.id;
      });
      this.$el.removeClass('sidebar-editing');
      this.hiddenItems = hiddenItems;
      localStorage.setItem(HIDDEN_ITEMS, JSON.stringify(hiddenItems));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$('.collapse').collapse('hide');
      this.render();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('.collapse').collapse('show');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      if (!event.target.value.trim()) {
        this.$('.collapse').collapse('hide');
        this.$el.removeClass('sidebar-search');
        this.$('#navbar-side-inner').removeClass('search-typing');
      }
    },
    searchClearButton_clickHandler: function () {
      this.$('#menu-search-input').val('').focus();
    },
    menuSearchInput_keyupHandler: function (event) {
      var self = this
        , val = event.target.value.trim();
      this.$('#navbar-side-inner').addClass('search-typing');
      if (val) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(function () {
          var str = '.*' + val.split('').join('.*') + '.*'
            , reg = new RegExp(str);
          self.$('a[href^="#/"]').each(function () {
            var isMatch = reg.test(this.innerText.toLowerCase());
            $(this).closest('li').toggleClass('mismatch', !isMatch);
          })
        }, 500);
      }
    },
    menuCollapseButton_clickHandler: function () {
      this.is_collapsed = $('body').toggleClass('sidebar-collapsed').hasClass('sidebar-collapsed');
      if (this.is_collapsed) {
        localStorage.setItem(COLLAPSED_STATUS, this.is_collapsed);
      } else {
        localStorage.removeItem(COLLAPSED_STATUS);
      }
    },
    accordionToggle_clickHandler: function (event) {
      var body = $('body')
        , self = this;
      if (body.hasClass('sidebar-collapsed')) {
        body.one('click', _.bind(this.items_hideHandler, this));
        this.$('.accordion-toggle').each(function () {
          var ul = $(this).siblings('ul');
          if (this === event.currentTarget) {
            ul.toggleClass('view').height('auto');
            self.$el.addClass('view');
          } else {
            ul.removeClass('view');
          }
        });
        event.preventDefault();
        event.stopPropagation();
      }
    },
    items_hideHandler: function () {
      this.$el.removeClass('view');
      this.$('.view').removeClass('view');
    }
  });
}(Nervenet.createNameSpace('tp.view'), jQuery, _, Backbone));