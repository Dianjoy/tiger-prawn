'use strict';
(function (ns) {
  var key = tp.PROJECT + '-menu-list'
    , eyesSelector = '.sidebar-nav-item, .sidebar-nav-item ul li'
    , buttonSelector = '#menu-collapse, #menu-edit, #menu-search-button';
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
      this.manageSidebar();      //初始化就可以get local
      this.store = localStorage.getItem(key);
    },
    manageSidebar: function () {
      if (this.store) {
        var menuList = JSON.parse(store);
        $(eyesSelector).each(function () {
          var eye = $(this).find('#eye-edit-button')
            , item = $(this).attr('id')
            , isExist = menuList.indexOf(item);
          isExist === -1 ? eye.removeClass('slash') : $(this).addClass('hidden').find('#eye-edit-button').addClass('slash');
        });
      } else { localStorage.setItem(key, JSON.stringify([])); }
    },
    eyeEditButton_clickHandler: function (event) {
      $(event.currentTarget).toggleClass('slash');
      event.preventDefault();
      event.stopPropagation();
    },
    menuEditButton_clickHandler: function () {
      $('body').addClass('sidebar-editing');   //$尽量不要用全局的
      $(eyesSelector).removeClass('hidden').find('.collapse').collapse('show');//mark
      $('#menu-collapse, #menu-search, #menu-edit').hide();
      $('#edit-confirm, #edit-cancel').show();
    },
    editConfirmButton_clickHandler: function () {
      if (this.store) {
        var menuList = JSON.parse(this.store);   //mark
        $('body').removeClass('sidebar-editing');
        $('#edit-confirm, #edit-cancel').hide();
        $('#menu-collapse, #menu-search, #menu-edit').show();
        $(eyesSelector).each(function () {                  //mark
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
      }
    },
    editCancelButton_clickHandler: function () {
      $('body').removeClass('sidebar-editing');
      $(eyesSelector).find('.collapse').collapse('hide');
      $('#edit-confirm, #edit-cancel').css('display', 'none');
      $('#menu-collapse, #menu-search, #menu-edit').css('display', 'block');
      this.manageSidebar();
    },
    menuSearchButton_clickHandler: function () {
      $(buttonSelector).hide();
      $('#menu-search form').show();
      $('#menu-search').animate({        //no animate just toggleclass then css
        width: '100%'
      }, 'fast', 'linear', function () {
        $(this).find('input').focus();
      });
    },
    menuSearchInput_blurHandler: function (event) {
      var val = $(event.currentTarget).val();
      if (!val) {
        $('#menu-search').animate({
          width: '33%'
        }, 'fast', 'linear', function () {
          $('#menu-search form').css('display', 'none');
          $(buttonSelector).css('display', 'block');
        });
      }
    },
    searchClearButton_clickHandler: function () {
      $('#menu-search-input').val('').focus();
      this.menuSearchInput_keyupHandler();
    },
    menuSearchInput_keyupHandler: function (event) {
      var val = $(event.currentTarget).val()//打断，然后.*连接
        , reg = new RegExp(val + '+');
      if (val) {
        var arr =
        $('.sidebar-nav-item ul').collapse('show');
        $(eyesSelector).each(function () {
          var title = $(this).find('.title').text()
            , isSlash = $(this).find('#eye-edit-button').hasClass('slash');
          if (!isSlash) {
            reg.test(title) ? $(this).removeClass('hidden') : $(this).addClass('hidden');
          }
        });
      } else {
        //展示全部
      }
    },
    menuCollapseButton_clickHandler: function () {
      $('body').toggleClass('sidebar-collapsed');
      $('#menu-search, #menu-edit').toggleClass('hidden');
      $('.sidebar-nav-item > a').each(function () {
        $(this).attr('data-toggle') ? $(this).removeAttr('data-toggle') : $(this).attr('data-toggle', 'collapse');
        $(this).siblings('.nav').removeAttr('style');
      });
      if ($('body').hasClass('sidebar-collapsed')) {   // no hover
        $('.sidebar-nav-item').hover(
          function () {
            $(this).find('.nav').addClass('hover');
          },
          function () {
            $(this).find('.nav').removeClass('hover');
          }
        );
      }
    }
  });
}(Nervenet.createNameSpace('tp.view')));