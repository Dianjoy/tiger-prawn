> smart-table是一个用来展示数据的具有交互性的表格组件，可以通过配置轻易地增加删选器、搜索和日期选择等功能，同时smart-table本身也内置了很多实用的功能，比如数据的删除和修改和排序等，而且只需编写相应的模版就可以实现。

# 实例
通过为一个标签设置 `.smart-table` 类就可以使用smart-table了，该标签不一定是`<table>`，但是待编译的handlebars模版代码则要求在`<tbody>`标签内，如下所示。

	<table class="smart-table">
	  <thead>
		<tr>
		  <th>First Name</th>
		  <th>Last Name</th>
		</tr>
	  </thead>
	  <tbody>
	  <script type="text/x-handlebars-template">
		<tr>
		  <td>{{first_name}}</td>
		  <td>{{last_name}}</td>
		</tr>
	  </script>
	  </tbody>
	</table>
	

# 属性配置
	
## URL
smart-table的数据通常来源于服务器端，可以为`<table>`设置`data-url`属性来取得对应接口的数据,其中`{{API}}`为可在`config.js`中配置的常量。当smart-table所在页面为hbs文件时，需要在该页面对应的路由中手动给`{{API}}`赋值。

	<table class="smart-table" data-url="{{API}}my_url/">...</table>
 
## 分页

在后端提供了相应的接口时，smart-table可以方便地将数据分页显示。通过给`<table>`设置`data-pagination`属性，可以给smart-table增加页码选择功能，其值为对应的页码选择器的类选择器。`data-pagesize-controller`属性可以为smart-table每页的数据展示量提供选择，其值为对应的`<select>`的id选择器。`data-pagesize`属性则可以设置每页的默认数据展示量。以下为相应的页面模版。

	<div class="form-group">
      <label for="pagesize">每页显示：</label>
      <select id="pagesize">
        <option>10</option>
        <option>20</option>
        <option>50</option>
      </select>
    </div>
    <table class="smart-table" data-pagination=".pagination" data-pagesize-controller="#pagesize" data-pagesize="10">...</table>
    <nav class="pull-right">
	  <ul class="pagination">
        <script type="text/x-handlebars-template">
          <li><a href="#/to/{{prev}}"><i class="fa fa-chevron-left"></i></a></li>
      	  {{#each pages}}
          <li class="hidden-xs"><a href="#/to/{{index}}">{{label}}</a></li>
          {{/each}}
          <li><a href="#/to/{{next}}"><i class="fa fa-chevron-right"></i></a></li>
        </script>
      </ul>
    </nav>
    
## 搜索
同样当后端提供了搜索的接口时，只需在页面添加一个搜索框，并设置`<table>`的`data-search`属性为搜索框的id选择器就可以了，smart-table会自动将在`<input>`内的文字作为关键字参数发送请求。

	<div class="form-group">
      <label for="search-query">搜索：</label>
      <input type="search" id="search-query">
    </div>
    <table class="smart-table" data-search="#search-query">...</table>
    
## 删选器
在页面中加入一个或多个`<select>`，`<select>`的`name`属性为待筛选的字段名，`<option>`内为对应字段值，包含`<select>`的容器为`.table-header`，设置`<table>`的`data-filter`属性为`.table-header`，smart-table就会随着筛选发送不同的请求，返回不同的数据。

	<div class="form-inline table-header">
	  <div class="form-group">
    	<label for="property">每页显示：</label>
    	<select class="form-control" id="property" name="property">
      	  <option value="1">Yes</option>
      	  <option value="0">No</option>
    	</select>
      </div>
	</div>
	<table class="smart-table" data-filter=".table-header">...</table>
	
## 日期选择
在页面对应的路由文件中进行配置之后，页面会出现一个日期选择组件，smart-table可以通过该组件选择起止日期来发送请求，从而返回对应起止日期内的数据。通过给`<table>`设置`data-range`为`.date-range`可使用此功能。此外还可以设置`data-format`来改变日期的格式，目前仅支持到具体日期和月份。`data-start`和`data-end`则可以设置默认的起止日期。

	<table class="smart-table" data-range=".date-range" data-format="YYYY-MM" data-start="-1" data-end="0">...</table>
	
## 总计
可以在表格的最后增加一行总计，将你所需要的具体某一列的数据的当前页的总数统计出来。使用时只需设置`<table>`的`data-amount`为`true`，并设置`data-omits`为不需进行统计的字段名，如有多个字段，则用空格隔开。

## 固定表头
表格太长下拉时导致分不清每一列数据分别代表什么？固定表头可以很好的解决这个问题，smart-table默认开启这个功能，如果你想关闭这个功能，可以设置`<table>`的`data-typeahead`属性为`false`

## 自动获取数据
smart-table默认自动将从服务器获取数据填入表格，如果你想禁用此功能，可以可以设置`<table>`的`data-auto-fetch`属性为`false`

## 默认请求参数
`data-params`可以设置从服务器获取数据时的默认参数，其值的形式为`first_param=1&second_param=2`。这样smart-table发送请求时就会带上相应的参数。

## model相关参数
从服务器获取的一个字段名为`list`的数组内的数据将会被放进一个`collection`内，而每一行数据又会存放在一个`model`里面。下面这些属性都是和`model`或`collection`相关的。

### data-id-attribute
`data-id-attribute`可以修改`model`的`idAttribute`属性。

### data-defaults
`data-defaults`则可以设置`model`的`defaults`属性，其值的形式和`data-params`相同。

### data-collection-id
设置`data-collection-id`可以将含有表格数据的`collection`保存起来，在这之后实例化的smart-table中设置相同的`data-collection-id`时，该smart-table就可以直接使用这个`collection`中的数据，而不必再发起服务器端请求。

### data-model与data-collection-type
smart-table使用默认的`model`和`collection`， `data-model`和`data-collection-type`可以允许你使用自己重写的`model`和`collection`。其值的形式为`project.directory.file`。`project`是项目名称，可以在config.js中进行配置，`directory`为js目录下`model`所在文件夹名字，`file`为该`model`文件名。

# 内置功能

## 数据删除
smart-table可以方便地删除一行数据，只要在该行为一个标签设置`.delete－button`类，并设置该行`<tr>`的id为此`model`的id，点击该按钮，smart-table就会自动发送删除此行数据的请求。

	<table class="smart-table">
	  <thead>
		<tr>
		  <th>First Name</th>
		  <th>Last Name</th>
		  <th>delete</th>
		</tr>
	  </thead>
	  <tbody>
	  <script type="text/x-handlebars-template">
		<tr id="{{id}}">
		  <td>{{first_name}}</td>
		  <td>{{last_name}}</td>
		  <td><button class="btn btn-danger delete-button" title="删除"></button></td>
		</tr>
	  </script>
	  </tbody>
	</table>
	
## 数据修改
smart-table可以删除数据，当然也可以修改数据。在该行内为一个`<a>`标签设置`.edit`类，并设置该标签的href为需要修改的字段。此外，还可以在该标签添加`data-type`来设置修改的数据类型。目前总共有`short-text`,`checkbox`,`datetime`,`file`,`long-text`,`number`,`search`,`select`,`status`,`tag`等10种类型，`data-type`默认为`short-text`。

	<table class="smart-table">
	  <thead>
		<tr>
		  <th>First Name</th>
		  <th>Last Name</th>
		</tr>
	  </thead>
	  <tbody>
	  <script type="text/x-handlebars-template">
		<tr id="{{id}}">
		  <td><a href="#first_name" class="edit">{{first_name}}</a></td>
		  <td><a href="#last_name" class="edit" data-type="short-text">{{last_name}}</a></td>
		</tr>
	  </script>
	  </tbody>
	</table>
	
## 筛选
除了上面的删选器，表格内部也提供了相似的筛选功能。如下所示为`<th>`设置`.filters`类，为`<a>`标签设置`.filter`类，`<a>`标签的href属性如下，第一个`/`后为需要筛选的字段名，第二个`/`后为筛选的值。在`<td>`内点击相应的标签发送筛选请求之后，会返回相应数据，该标签也会出现在`<th>`中，再次点击就可以再次发送请求撤销相应筛选。

	<table class="smart-table">
	  <thead>
		<tr>
		  <th class="filters">First Name</th>
		  <th>Last Name</th>
		</tr>
	  </thead>
	  <tbody>
	  <script type="text/x-handlebars-template">
		<tr id="{{id}}">
		  <td><a href="#/first_name/{{first_name}}" class="filter label">{{first_name}}</a></td>
		  <td>{{last_name}}</td>
		</tr>
	  </script>
	  </tbody>
	</table>	
	
## 排序
smart-table同样可以轻易地为表格数据排序，只需要在`<th>`中设置`.order`类，href内是作为排序依据的字段名，点击该`<th>`便可以发送排序请求，`<th>`设置`.inverse`类可使得第一次点击发送的请求为倒序。

	<table class="smart-table">
	  <thead>
		<tr>
		  <th><a class="order inverse" href="#first_name">First Name</th>
		  <th>Last Name</th>
		</tr>
	  </thead>
	  <tbody>
	  <script type="text/x-handlebars-template">
		<tr id="{{id}}">
		  <td>{{first_name}}</td>
		  <td>{{last_name}}</td>
		</tr>
	  </script>
	  </tbody>
	</table>