'use strict';
(function (ns) {
  var key = tp.PROJECT + '-menu-list'
    , eyesSelector = '.sidebar-nav-item, .sidebar-nav-item ul li';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click .eye-edit-button': 'eyeEditButton_clickHandler',
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
      this.store = localStorage.getItem(key);
    },
    manageSidebar: function () {
      if (this.store) {
        var menuList = JSON.parse(this.store);
        this.$(eyesSelector).each(function () {
          var item = $(this).attr('id');
          if (menuList.indexOf(item) === -1) {
            $(this).removeClass('slash');
          } else {
            $(this).addClass('slash');
          }
        });
      } else { localStorage.setItem(key, JSON.stringify([])); }
    },
    changeButton: function (show, hide) {
      this.$(hide).hide();
      this.$(show).show();
    },
    eyeEditButton_clickHandler: function (event) {
      var target = $(event.currentTarget)
        , parents = target.hasClass('first-level') ? '.sidebar-nav-item' : '.second-level';
      target.parents(parents).toggleClass('slash');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      this.$el.addClass('sidebar-editing');
      $(eyesSelector).find('.collapse').collapse('show');
      this.changeButton('.edit-btn-group', '.menu-operation');
    },
    editConfirmButton_clickHandler: function () {
      var menuList = [];
      this.$el.removeClass('sidebar-editing');
      this.changeButton('.menu-operation', '.edit-btn-group');
      this.$('.slash').each(function () {
        menuList.push($(this).attr('id'));
      });
      localStorage.setItem(key, JSON.stringify(menuList));
    },
    editCancelButton_clickHandler: function () {
      this.$el.removeClass('sidebar-editing');
      this.$(eyesSelector).find('.collapse').collapse('hide');
      this.changeButton('.menu-operation', '.edit-btn-group');
      this.manageSidebar();
    },
    menuSearchButton_clickHandler: function () {
      this.$el.addClass('sidebar-search');
      this.$('#menu-search-input').focus();
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        this.$el.removeClass('sidebar-search');
      }
    },
    searchClearButton_clickHandler: function () {
      $('#menu-search-input').val('').focus();
      this.menuSearchInput_keyupHandler();
    },
    menuSearchInput_keyupHandler: function (event) {
      var val = $(event.currentTarget).val().trim()
        , isSlash = $(this).hasClass('slash');
      if (val) {
        var str = '.*' + val.split('').join('.*') + '.*'
          , reg = new RegExp(str);
        this.$('.sidebar-nav-item ul').collapse('show');
        this.$(eyesSelector).each(function () {
          if (!isSlash) { reg.test($(this).find('.title').text()) ? $(this).show() : $(this).hide(); }
        });
      } else {
        this.$(eyesSelector).each(function () {
          if (!isSlash) { $(this).show(); }
        });
      }
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      this.$('#menu-search, #menu-edit').toggleClass('hidden');
      $('.sidebar-nav-item > a').each(function () {
        $(this).attr('data-toggle') ? $(this).removeAttr('data-toggle') : $(this).attr('data-toggle', 'collapse');
        $(this).siblings('.nav').removeAttr('style');
      });
      if ($('body').hasClass('sidebar-collapsed')) {
        this.$('.sidebar-nav-item').unbind('click').click(function (event) {
            $(event.currentTarget).find('.nav').toggleClass('visible');
          });
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));