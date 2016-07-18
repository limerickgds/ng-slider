'use strict';

/**
 *  ng轮播插件
 * 可以通过sliderOptions设置 各种配置项
 *         {
 *				has_title: false,    //是否显示标题
 *				has_trigger: true,   //是否显示trigger标记
 *				auto_translate: true, //是否自动轮播
 *				delay_time: 3000,     //轮播延时时间
 *				duration_time: 400,   //轮播动画时间
 *				pageShow: false       //是否显示page切换
 *			};
 *  tempalte
 *
 * <div class="slider-head">
 *		 <slider slider-list="vm.sliderList" slider-options="vm.sliderOptions">
 *		 </slider>
 *</div>
 *
 */

angular.module('slider',[])
.directive('slider', ['$timeout', function($timeout){
	// Runs during compile
	return {
		name: 'slider',
		priority: 1,
		scope: {
			sliderList: '=sliderList',
			sliderOptions: '=sliderOptions'
		},
		// controller: function($scope, $element, $attrs, $transclude) {},
		// require: 'ngModel', // Array = multiple requires, ? = optional, ^ = check parent elements
		restrict: 'AE', // E = Element, A = Attribute, C = Class, M = Comment
		template: '<div class="sliders">'
		        + '<ul class="slider-pic" ng-style="sliderPic.styles">'
		        + '<li class="pic-list" ng-repeat="item in sliders track by $index" ng-style="item.styles">'
		        + '<a ng-href="{{item.href}}">'
		        + '<img ng-src="{{item.src}}">'
		        + '</a>'
		        + '</li>'
		        + '</ul>'
		        + '<div class="slider-extra">'
		        + '<ul class="slider-trigger">'
		        + '<li class="slider-trigger-li" ng-repeat="ti in sliders track by $index" ng-show="ti.triggerShow" ng-class="{active:ti.active}">'
		        + '</li>'
		        + '</ul>'
		        + '</div>'
		        + '<div class="slider-page" ng-show="options.pageShow">'
		        + '<a class="page-pre" ng-click="onSwipeRight()"><</a>'
		        + '<a class="page-next" ng-click="onSwipeLeft()">></a>'
		        + '</div>'
		        + '</div>',
		replace: true,

		link: function(scope, iElm, iAttrs, controller) {
			var ParentElm = angular.element(iElm[0].parentElement),
				picElm = iElm[0].querySelector('.slider-pic'),
				ParentWidth = ParentElm[0].clientWidth,
			    ParentHeight = ParentElm[0].clientHeight;
			var sliderActive = 1;   //选中slider的id

			 //根据传入数据列表填充轮播列表元素
			scope.sliders = [];
            scope.sliderPic = {
            	styles: {
            	}
            };

            //默认配置
			var OPTIONS = scope.options = {
				has_title: false,    //是否显示标题
				has_trigger: true,   //是否显示trigger标记
				auto_translate: true, //是否自动轮播
				delay_time: 3000,     //轮播延时时间
				duration_time: 400,   //轮播动画时间
				pageShow: false       //是否显示page切换
			};


			//修改默认配置
			angular.extend(OPTIONS,scope.sliderOptions);



			/**
			 * [initDiv 根据父元素高宽，初始化每个slider的样式]
			 * @return {[type]} [description]
			 */
            function initDiv(){
            	    ParentWidth = ParentElm[0].clientWidth,
			        ParentHeight = ParentElm[0].clientHeight;
			    var picElmWidth = scope.sliders.length  * ParentWidth;
			    iElm.css({width:ParentWidth+'px', height: ParentHeight+'px'});

                console.log(ParentWidth);
			    scope.sliderPic.styles = {
					"width" : picElmWidth+"px",
					"height" : ParentHeight+"px",
					"transition-timing-function" : "cubic-bezier(0.1, 0.57, 0.1, 1)",
					"transition-duration" : "0ms",
					"transform" : "translate3d( -" + ParentWidth + "px, 0px, 0px)"
				};

				for(var i = 0,len = scope.sliders.length; i < len;i++){
					scope.sliders[i].styles = {
						"width" : ParentWidth+"px",
						"height" : ParentHeight+"px"
				    };
				};
            };

            //监听窗口变化
            window.addEventListener('resize',function(){
            	initDiv();
            },false);


            //监听touch
		    picElm.addEventListener('touchstart',picTouchStartFn,false);
		    function picTouchStartFn (e){
		    	var picBeginX = e.changedTouches[0].clientX;
		    	picElm.addEventListener('touchmove',move,false);
		    	picElm.addEventListener('touchend',end,false);

		    	/**
		    	 * [move 触摸移动]
		    	 * @param  {[type]} e [description]
		    	 * @return {[type]}   [description]
		    	 */
		    	function move(e){
		    		var beginLeft = -(sliderActive * ParentWidth),
			    	    clientX = e.changedTouches[0].clientX,
			    	    left = clientX - picBeginX + beginLeft;
			    	//移动距离，需要使用$apply()手动触发digest
			    	setSliderFloat(left,0);
			    	scope.$apply();
		    	}

		    	/**
		    	 * [end 触摸结束]
		    	 * @param  {[type]} e [description]
		    	 * @return {[type]}   [description]
		    	 */
		    	function end(e){
		    		var moveX = e.changedTouches[0].clientX - picBeginX;

		    		//设置的阀值超过 100px就移动
		    		if(moveX > 100){
			    		scope.onSwipeRight(sliderActive);
			    	}else if(moveX < -100){
			    		scope.onSwipeLeft(sliderActive);
			    	}else if(moveX >= -100 && moveX < 0){
			    		scope.onSwipeRight(sliderActive + 1);
			    	}else{
			    		scope.onSwipeLeft(sliderActive - 1);
			    	}
			    	scope.$apply();
			    	//结束监听
		    	    picElm.removeEventListener('touchmove',move,false);
		    	    picElm.removeEventListener('touchend',end,false);
		    	}
		    };

		    picElm.addEventListener('mousedown',picMouseDownFn,false);
		    function picMouseDownFn (e){
		    	var picBeginX = e.clientX;
		    	picElm.addEventListener('mousemove',move,false);
		    	picElm.addEventListener('mouseup',end,false);
		    	/**
		    	 * [move 触摸移动]
		    	 * @param  {[type]} e [description]
		    	 * @return {[type]}   [description]
		    	 */
		    	function move(e){
		    		var beginLeft = -(sliderActive * ParentWidth),
			    	    clientX = e.clientX,
			    	    left = clientX - picBeginX + beginLeft;
			    	//移动距离，需要使用$apply()手动触发digest
			    	setSliderFloat(left,0);
			    	scope.$apply();
		    	}

		    	/**
		    	 * [end 触摸结束]
		    	 * @param  {[type]} e [description]
		    	 * @return {[type]}   [description]
		    	 */
		    	function end(e){
		    		var moveX = e.clientX - picBeginX;

		    		//设置的阀值超过 100px就移动
		    		if(moveX > 100){
			    		scope.onSwipeRight(sliderActive);
			    	}else if(moveX < -100){
			    		scope.onSwipeLeft(sliderActive);
			    	}else if(moveX >= -100 && moveX < 0){
			    		scope.onSwipeRight(sliderActive + 1);
			    	}else{
			    		scope.onSwipeLeft(sliderActive - 1);
			    	}
			    	scope.$apply();
			    	//结束监听
		    	    picElm.removeEventListener('mousemove',move,false);
		    	    picElm.removeEventListener('mouseup',end,false);
		    	}
		    }


            /**
             * [onSwipeLeft 往左拉切换图片]
             * @param  {[type]} index [点击的元素]
             * @return {[type]}       [description]
             */
            scope.onSwipeLeft = function (index){
            	var item_left = -ParentWidth,
            	    len = scope.sliders.length,
            	    left = (index + 1) * item_left;
            	    sliderActive = index === len - 2 ? 1 : index + 1;
                setSliderFloat(left,OPTIONS.duration_time);
            	$timeout(function(){
                	setSliderFloat(sliderActive * item_left,0);
                	itemActive(sliderActive);
            	}, OPTIONS.duration_time);
            };

            /**
             * [onSwipeLeft 往右拉切换图片]
             * @param  {[type]} index [点击的元素]
             * @return {[type]}       [description]
             */
            scope.onSwipeRight = function (index){
            	var item_left = -ParentWidth,
            	    len = scope.sliders.length,
            	    left = (index - 1) * item_left;
            	    sliderActive = index === 1 ? len - 2 : index - 1;
                setSliderFloat(left,OPTIONS.duration_time);
            	$timeout(function(){
                	setSliderFloat(sliderActive * item_left,0);
                	itemActive(sliderActive);
            	}, OPTIONS.duration_time);
            };

            /**
             * [setSliderFloat 设置slider left]
             * @param {[type]} left     [translate left]
             * @param {[type]} duration [动画效果时间]
             */
            function setSliderFloat(left,duration){
            	scope.sliderPic.styles["transform"] = "translate3d( " + left + "px, 0px, 0px)";
            	scope.sliderPic.styles["transition-duration"] =  duration + "ms";
            };

            /**
             * [itemActive 修改被选中元素状态]
             * @param  {[type]} index [元素index]
             * @return {[type]}       [description]
             */
            function itemActive(index){
            	angular.forEach(scope.sliders,function(item){
            		item.active = false;
            	});
            	scope.sliders[index].active = true;
            };

            /**
             * [autoTranslate 自动轮播]
             * @param  {[type]} delay [延时时间]
             * @return {[type]}       [description]
             */
           function autoTranslate(delay){
            	var delay = delay || OPTIONS.delay_time;
            	$timeout(function(){
            		scope.onSwipeLeft(sliderActive++);
            		autoTranslate(delay + OPTIONS.delay_time);
            	},delay);
             };

			/**
			 * [init 启动函数]
			 * @return {[type]} [description]
			 */
			function init(){
                //初始化slider宽度
                initDiv();

				//初始化slider数组
                for(var i = 0,len = scope.sliders.length; i<len;i++){
				    scope.sliders[i].active = false;
                	if(i === 0 || i === scope.sliders.length - 1){
                		scope.sliders[i].triggerShow = false;
                	}else{
                		scope.sliders[i].triggerShow = true;
                	}
                }
                scope.sliders[sliderActive].active = true;
                //如果设置为自动轮播，则开始轮播
				if(OPTIONS.auto_translate){
					autoTranslate();
				}
			};

			//监控传入参数，当不是null时，开始加载
			scope.$watch('sliderList',function(s){
				if(s.length > 0){
					var firstItem = angular.copy(s[0]),
					    lastItem = angular.copy(s[s.length-1]);
				    scope.sliders = angular.copy(s);
		            scope.sliders.unshift(lastItem);
		            scope.sliders.push(firstItem);
					init();
				}
			});
		}
	};
}]);
