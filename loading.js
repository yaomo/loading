;(function(){
	function Loading(parentDom,ajaxObj) {
		var self = Loading.prototype;
		self.init(parentDom,ajaxObj);
		self.update();
		self.scrollScreen();
	}
	Loading.prototype = {
		constructor: Loading,
		loading: null,//wrapper div
		canvas: null,//画板
		context: null,//画板上下文
		ea: 0,//弧线结束角度
		sa: 0,//弧线开始角度
		size: {r: 40,width: 0,height: 0},//r圆弧直径,width/height 整体宽高
		offset: {x: 0,y: 0,maxY: 85,realY: 0},//y:上下偏移量,maxY 最大偏移量 realY实时偏移量
		self: Loading.prototype,
		isAutoRunBack: false,//是否自动转动返回
		isAutoRun: false,//是否转动
		isAutoRunOut: false,//是否自动消失
		textDom: document.querySelector('.text'),
		ajaxObj: null,

		init: function(parentDom,ajaxObj) {
			var self = Loading.prototype;

			self.loading = document.createElement('div');//canvas wrapper
			self.canvas = document.createElement('canvas');//canvas
			self.canvas.setAttribute('id','pannel');
			self.loading.appendChild(self.canvas);
			parentDom.appendChild(self.loading);
			self.context = self.canvas.getContext('2d');

			self.canvas.width = self.size.r + 16;
			self.canvas.height = self.size.r + 16;//linewidth*2 + jiantou_R * 2 = 6*2+2*2
			self.offset.y = -self.canvas.height;
			self.size.width = self.canvas.width;
			self.size.height = self.canvas.height;
			self.loading.style.webkitTransform = 'translate3d(0,' + self.offset.y + 'px,0)';
			self.loading.setAttribute('class','loading');
			self.ajaxObj = ajaxObj;
			// self.loading.style.transition = 'all 1s';
		},

		draw: function(startAngle,endAngle) {
			var self = Loading.prototype,
				showArrow = self.sa >= self.ea - 7*Math.PI/4 ? false : true;
			self.context.lineWidth = 6;
			self.context.strokeStyle = '#1ba9ba';

			self.context.beginPath();
			self.context.arc(self.canvas.width/2,self.canvas.height/2,self.size.r/2,startAngle,endAngle);
			self.context.stroke();
			if (showArrow) {
				self.context.beginPath();
				self.context.lineWidth = 6;
				self.context.strokeStyle = '#1ba9ba';
				self.context.moveTo(self.canvas.width/2+(self.size.r/2)*Math.cos(endAngle),self.canvas.height/2+(self.size.r/2)*Math.sin(endAngle));
				self.context.lineTo(self.canvas.width/2+(self.size.r/2-2)*Math.cos(endAngle-0.1),self.canvas.height/2+(self.size.r/2-2)*Math.sin(endAngle-0.1));
				self.context.lineTo(self.canvas.width/2+(self.size.r/2+2)*Math.cos(endAngle-0.1),self.canvas.height/2+(self.size.r/2+2)*Math.sin(endAngle-0.1));
				self.context.closePath();
			}
			self.context.stroke();
		},

		update: function() {
			var self = Loading.prototype;
			var requestAnimationFrame = (function() {
					return  window.requestAnimationFrame || 
							window.mozRequestAnimationFrame || 
							window.webkitRequestAnimationFrame || 
							window.msRequestAnimationFrame || 
							window.oRequestAnimationFrame || 
							function(callback) { setTimeout(callback, 1000 / 60); };
				}());
			if (self.isAutoRunBack) {
				// self.ea += Math.PI/10;
				// if (self.ea - self.sa > 9*Math.PI/5) {
				// 	self.sa = self.ea - 9*Math.PI/5;
				// }
				self.offset.realY = self.getRealOffset().top;

				self.ea =  self.ea < 0 ? 0 : (self.size.height + self.offset.realY)*Math.PI/60;
				self.sa = self.ea - self.sa > 9*Math.PI/5 ? self.ea - 9*Math.PI/5 : self.sa;
				self.sa = self.ea > self.sa ? self.sa : self.ea;
				
			}else if (self.isAutoRun) {
				self.ea += Math.PI/10;
				if (self.ea - self.sa > 9*Math.PI/5) {
					self.sa = self.ea - 9*Math.PI/5;
				}
			}else if (self.isAutoRunOut) {
				self.ea += Math.PI/10;
				if (self.ea - self.sa > 9*Math.PI/5) {
					self.sa = self.ea - 9*Math.PI/5;
				}
				self.loading.style.opacity = 0;
				self.loading.style.transition = 'all 2s';

			}

			self.context.clearRect(0,0,self.canvas.width,self.canvas.height);
			self.draw(self.sa,self.ea);
			requestAnimationFrame(self.update);
		},

		scrollScreen: function() {
			var body = document.querySelector('body'),
				startX,
				startY,
				self = Loading.prototype;
			body.addEventListener('touchstart',function(e) {
				self.loading.style.transition = '';
				startX = e.touches[0].pageX;
				startY = e.touches[0].pageY;
				self.isAutoRunBack = false;
				self.isAutoRun = false;
				self.isAutoRunOut = false;
				self.ea = 0;
				self.sa = 0;
			})
			body.addEventListener('touchmove',function(e) {

				self.offset.x = e.touches[0].pageX - startX;
				self.offset.realY = e.touches[0].pageY - startY - self.size.height;
				self.offset.y = self.offset.realY;
				self.offset.y = self.offset.y > self.offset.maxY ? self.offset.maxY : self.offset.y;
				if (self.offset.y > -self.size.height && window.scrollY == 0) {
					e.preventDefault();
					self.loading.style.webkitTransform = 'translate3d(0,' + self.offset.y + 'px,0)';
					self.ea =  self.ea < 0 ? 0 : (self.size.height + self.offset.y)*Math.PI/60;
					self.sa = self.ea - self.sa > 9*Math.PI/5 ? self.ea - 9*Math.PI/5 : self.sa;
					self.sa = self.ea > self.sa ? self.sa : self.ea;
					//透明度设置
					self.loading.style.opacity = self.getOpacity();
					console.log(self.offset.y);
				}
			
			});
			body.addEventListener('touchend',function(e){
				if(self.offset.y < 60) {
					self.offset.y = -self.size.height;
					self.loading.style.webkitTransform = 'translate3d(0,' + self.offset.y + 'px,0)';
					self.loading.style.opacity = 0;
					self.loading.style.transition = 'all 1s';
					self.isAutoRunBack = true;
					setTimeout(function() {
						self.isAutoRunBack = false;
					},1000);
				}else {
					self.isAutoRun = true;
					self.getData(self.ajaxObj);
				}
			});
		},

		getOpacity: function() {
			var self = Loading.prototype;

			return (self.offset.realY+self.size.height)/(self.size.height+self.offset.maxY);
		},

		getRealOffset: function() {
			var self = Loading.prototype;
				// offsetReg=/\-?[0-9]+\.?[0-9]*/g;
			
			// return self.loading.style.webkitTransform.match(offsetReg);
			return self.loading.getBoundingClientRect();
		},

		getData: function(ajaxObj) {
			var self = Loading.prototype,
				srcObj = {
					url: undefined,
					data: null,
					type: 'get',
					success: function() {},
					fail: function() {}
				}
			self.extendObj(srcObj,ajaxObj);
			self.simpleAjax(srcObj);

		},

		extendObj: function(src,tar) {
			if (typeof src === "object") {
				for(key in tar) {
					src[key] = tar[key];
				}
			}
		},

		simpleAjax: function(ajaxObj) {
			var 
				self = Loading.prototype,
				ajax = {
					createXHR: function() {
						if (window.XMLHttpRequest) {
							var ajax = new XMLHttpRequest();
						} else if (window.ActiveXObject) {
							try {
								var ajax = new ActiveXObject("Msxml2.XMLHTTP");
							} catch (e) {
								try {
									var ajax = new ActiveXObject("Microsoft.XMLHTTP");
								} catch (e) {}
							}
						}
						if (!ajax) {
							console.log('createXHR failed');
							return false;
						}
						return ajax;
					},

					setParams: function (obj) {
						if (typeof obj === 'object') {
							var str = '';
							for (val in obj) {
								str += val + '=' + obj[val] + '&';
							}
							return str.substr(0,str.length-1);

						}else {
							return obj;
						}
					},

					get: function (url) {
						xhr.open('get',url,true);
						xhr.onreadystatechange = ajax.handler;
						xhr.send(null);
					},

					post: function (url,content) {
						xhr.open('post',url,true);
						xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded');
						xhr.onreadystatechange = ajax.handler;
						xhr.send(ajax.setParams());
					},

					handler: function() {
						if (xhr.readyState === 4) {
							self.isAutoRunOut = true;
							self.isAutoRun = false;
							if (xhr.status === 200 || xhr.status/100 === 3) {
								ajaxObj.success();
							}else  {
								ajaxObj.fail();
							}
						}
					}
				},
				xhr = ajax.createXHR();
				if (ajaxObj.type === 'get') {
					ajax.get(ajaxObj.url);
				}else {
					ajax.post(ajaxObj.url,ajaxObj.data);
				}
		}
		
	}
	window.Loading = Loading;
}());