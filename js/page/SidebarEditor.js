'use strict';
(function (ns) {
  var key = tp.PROJECT + '-menu-list'
    , eyesSelector = '.sidebar-nav-item, .sidebar-nav-item ul li'
    , buttonSelector = '#menu-collapse, #menu-edit, #menu-search-button';
  ns.SidebarEditor = Backbone.View.extend({
    events: {
      'click #eye-edit-button': 'eyeEditButton_clickHandler',
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
      this.manageSidebar();
    },
    eyeEditButton_clickHandler: function (event) {
      $(event.currentTarget).toggleClass('slash');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      $('body').addClass('sidebar-editing');
      $(eyesSelector).removeClass('hidden').find('.collapse').collapse('show');
      $('#menu-collapse, #menu-search').fadeOut(function () {
        $('#edit-confirm, #edit-cancel').fadeIn();
      });
    },
    editConfirmButton_clickHandler: function () {
      var store = localStorage.getItem(key)
        , menuList = JSON.parse(store);
      $('body').removeClass('sidebar-editing');
      $('#edit-confirm, #edit-cancel').fadeOut(function () {
        $('#menu-collapse, #menu-search').fadeIn();
      });
      $(eyesSelector).each(function () {
        var eye = $(this).find('#eye-edit-button')
          , item = $(this).attr('id');
        if (eye.hasClass('slash')) {
          if (menuList.indexOf(item) === -1) {
            menuList.push(item);
          }
        } else if (menuList.indexOf(item) !== -1) {
          menuList.splice(menuList.indexOf(item), 1);
        }
      });
      localStorage.setItem(key, JSON.stringify(menuList));
      this.manageSidebar();
    },
    editCancelButton_clickHandler: function () {
      $('body').removeClass('sidebar-editing');
      $('#edit-confirm, #edit-cancel').fadeOut(function () {
        $('#menu-collapse, #menu-search').fadeIn();
      });
      this.manageSidebar();
    },
    menuSearchButton_clickHandler: function () {
      $(buttonSelector).fadeOut(function () {
        $('#menu-search form').fadeIn(function () {
          $('#menu-search').css('width', '100%').find('input').focus();
        });
      });
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        $('#menu-search form').fadeOut(function () {
          $('#menu-search').css('width', '30%');
          $(buttonSelector).fadeIn();
        });
      }
    },
    searchClearButton_clickHandler: function () {
      $('#menu-search-input').val('').focus().trigger('keyup');
    },
    menuSearchInput_keyupHandler: function (event) {
      var val = $(event.currentTarget).val() || '\\S'
        , reg = new RegExp(val + '+');
      $('.sidebar-nav-item ul').collapse('show');
      $(eyesSelector).each(function () {
        var title = $(this).find('.title').text()
          , isSlash = $(this).find('#eye-edit-button').hasClass('slash');
        if (!isSlash) {
          reg.test(title) ? $(this).removeClass('hidden') : $(this).addClass('hidden');
        }
      });
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      $('#menu-search, #menu-edit').toggleClass('hidden');
      $('.sidebar-nav-item > a').each(function () {
        $(this).attr('data-toggle') ? $(this).removeAttr('data-toggle') : $(this).attr('data-toggle', 'collapse');
        $(this).siblings('.nav').removeAttr('style');
      });
      if ($('body').hasClass('sidebar-collapsed')) {
        $('.sidebar-nav-item').hover(
          function () {
            $(this).find('.nav').addClass('hover');
          },
          function () {
            $(this).find('.nav').removeClass('hover');
          }
        );
      }
    },
    manageSidebar: function () {
      var store = localStorage.getItem(key);
      if (store) {
        var menuList = JSON.parse(store);
        $(eyesSelector).each(function () {
          var eye = $(this).find('#eye-edit-button')
            , item = $(this).attr('id')
            , isExist = menuList.indexOf(item);
          isExist === -1 ? eye.removeClass('slash') : $(this).addClass('hidden').find('#eye-edit-button').addClass('slash');
        });
      } else { localStorage.setItem(key, JSON.stringify([])); }
    }
  });
}(Nervenet.createNameSpace('tp.page')));