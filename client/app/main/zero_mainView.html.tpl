<!doctype html>
<html xmlns:ng="http://angularjs.org" id="ng-app" ng-app="zeroApp">
<head> 
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
	<link rel="stylesheet" type="text/css" href="/static/zeroApp/css/bootstrap.min.css"/>
	<link rel="stylesheet" type="text/css" href="/static/zeroApp/css/bootstrap-theme.css"/>
	<link rel="stylesheet" type="text/css" href="/static/zeroApp/css/select2.css"/>
	<link rel="stylesheet" type="text/css" href="/static/zeroApp/css/select2-bootstrap.css"/>
    <link href="/static/zeroApp/css/font-awesome.min.css" rel="stylesheet"/>
	<style>
		.selected {
			border-width: 1px;
			border-style: solid;
			border-color: #5cb85c;
			border-radius: 5px;
		}
	</style>
	 <!--[if lte IE 9]>
	 <script type="text/javascript" src="/static/explorerApp/js/vendor/es5-shim.js"></script>
	 <script type="text/javascript" src="/static/explorerApp/js/vendor/html5shiv.js"></script>
	 <script type="text/javascript" src="/static/explorerApp/js/vendor/augment.js"></script>
	 <script type="text/javascript" src="/static/explorerApp/js/vendor/json3.min.js"></script>
        <script>
          document.createElement('ng-include');
          document.createElement('ng-pluralize');
          document.createElement('ng-view');
          document.createElement('login-Toolbar');
          document.createElement('alert');
          document.createElement('ng-include');
	      document.createElement('accordion');
	      document.createElement('accordion-group');
	      document.createElement('accordion-heading');
	      document.createElement('ui-view');

          // Optionally these for CSS
          document.createElement('ng:include');
          document.createElement('ng:pluralize');
          document.createElement('ng:view');
          // getComputedStyle
        </script>
      <![endif]-->
</head>
<body>

	<nav class="navbar navbar-default" role="navigation">
		<div class="navbar-header">
			<a class="navbar-brand">ZERO</a>
		</div>
		<div class="collapse navbar-collapse">
			<ul class="nav navbar-nav">
			</ul>
		</div>
	</nav>

<div ui-view class="container view-frame"></div>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/jquery-1.11.1.min.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/angular/angular.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/angular/angular-ui-router.min.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/angular/angular-route.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/angular/angular-cookies.js"></script>

	<script type="text/javascript" src="/static/explorerApp/js/vendor/bootstrap/ui-bootstrap-custom-tpls-0.10.0.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/select2/select2.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/select2/angular-select2.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/angular/angular-touch.js"></script>

	<script type="text/javascript" src="/static/zeroApp/js/app/common/retryQueue.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/app/common/interceptor.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/app/common/authorization.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/app/common/security.js"></script>

	<script type="text/javascript" src="/static/zeroApp/js/vendor/blob/blob.js"></script>
	<script type="text/javascript" src="/static/zeroApp/js/vendor/blob/filesaver.js"></script>

	<script type="text/javascript" src="/static/zeroApp/js/app/main.js"></script>
</body>
</html>