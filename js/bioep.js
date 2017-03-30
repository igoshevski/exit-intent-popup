;(window.bioEp = function (window, undefined) {
	'use strict';

	var bioEp = function () {
			var self = this;

			// Private variables
			self.bgEl = {};
			self.popupEl = {};
			self.popupElContainer = {};
			self.closeBtnEl = {};
			self.shown = false;
			self.overflowDefault = "visible";
			self.transformDefault = "";
			self.uid = '';
			
			// Popup options
			self.width = 400;
			self.height = 220;
			self.html = "";
			self.css = "";
			self.fonts = [];
			self.delay = 5;
			self.showOnDelay = false;
			self.cookieExp = 0;
			self.showOncePerSession = false;
			self.onPopup = null;
			
			// Object for handling cookies, taken from QuirksMode
			// http://www.quirksmode.org/js/cookies.html
			self.cookieManager = {
				// Create a cookie
				create: function(name, value, days, sessionOnly) {
					var expires = "";
					
					if(sessionOnly)
						expires = "; expires=0"
					else if(days) {
						var date = new Date();
						date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
						expires = "; expires=" + date.toGMTString();
					}
					
					document.cookie = name + "=" + value + expires + "; path=/";
				},
				
				// Get the value of a cookie
				get: function(name) {
					var nameEQ = name + "=";
					var ca = document.cookie.split(";");
					
					for(var i = 0; i < ca.length; i++) {
						var c = ca[i];
						while (c.charAt(0) == " ") c = c.substring(1, c.length);
						if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
					}
					
					return null;
				},
				
				// Delete a cookie
				erase: function(name) {
					this.create(name, "", -1);
				}
			};
			
			// Handle the bioep_shown cookie
			// If present and true, return true
			// If not present or false, create and return false
			self.checkCookie = function() {
				// Handle cookie reset
				if(self.cookieExp <= 0) {
					// Handle showing pop up once per browser session.
					if(self.showOncePerSession && self.cookieManager.get("bioep_shown_session_" + self.uid) == "true")
						return true;

					self.cookieManager.erase("bioep_shown_" + self.uid);
					return false;
				}

				// If cookie is set to true
				if(self.cookieManager.get("bioep_shown_" + self.uid) == "true")
					return true;

				return false;
			};

			// Add font stylesheets and CSS for the popup
			self.addCSS = function() {
				// Add font stylesheets
				for(var i = 0; i < self.fonts.length; i++) {
					var font = document.createElement("link");
					font.href = self.fonts[i];
					font.type = "text/css";
					font.rel = "stylesheet";
					document.head.appendChild(font);
				}

				// Base CSS styles for the popup
				var css = document.createTextNode(
					"#bio_ep_bg {display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: #000; opacity: 0.3; z-index: 10001;}" +
					//"#bio_ep {display: none; position: fixed; width: " + self.width + "px; height: " + self.height + "px; font-family: 'Titillium Web', sans-serif; font-size: 16px; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); -webkit-transform: translateX(-50%) translateY(-50%); -ms-transform: translateX(-50%) translateY(-50%); background-color: #fff; box-shadow: 0px 1px 4px 0 rgba(0,0,0,0.5); z-index: 10002;}" +
					"#bio_ep {display: none; position: fixed; left: 50%; top: 50%; transform: translateX(-50%) translateY(-50%); -webkit-transform: translateX(-50%) translateY(-50%); -ms-transform: translateX(-50%) translateY(-50%); background-color: #fff; box-shadow: 0px 1px 4px 0 rgba(0,0,0,0.5); z-index: 10002;}" +
					"#bio_ep_close {position: absolute; right: -10px; top: 0; margin: -8px 0 0 -12px; width: 20px; height: 20px; color: #fff; font-size: 12px; font-weight: bold; text-align: center; border-radius: 50%; background-color: #5c5c5c; cursor: pointer;}" +
					self.css
				);

				// Create the style element
				var style = document.createElement("style");
				style.type = "text/css";
				style.appendChild(css);

				// Insert it before other existing style
				// elements so user CSS isn't overwritten
				document.head.insertBefore(style, document.getElementsByTagName("style")[0]);
			};

			// Add the popup to the page
			self.addPopup = function() {
				self.bgEl = document.getElementById("bio_ep_bg");
				self.popupEl = document.getElementById("bio_ep");
				self.closeBtnEl = document.getElementById("bio_ep_close");

				// Add the background div
				if(!self.bgEl) {
					self.addCSS();

					self.bgEl = document.createElement("div");
					self.bgEl.id = "bio_ep_bg";
					document.body.appendChild(self.bgEl);
				}

				// Add the popup
				if(!self.popupEl) {
					self.popupEl = document.createElement("div");
					self.popupEl.id = "bio_ep";
					self.popupEl.style.display = 'none';

					// Add the close button
					self.closeBtnEl = document.createElement("div");
					self.closeBtnEl.id = "bio_ep_close";
					self.closeBtnEl.appendChild(document.createTextNode("X"));
					
					self.popupElContainer = document.createElement('div');

					self.popupEl.appendChild(self.closeBtnEl);
					self.popupEl.appendChild(self.popupElContainer);

					document.body.appendChild(self.popupEl);
				} else {
					self.popupElContainer = self.popupEl.childNodes[1];
				}
			};

			// Show the popup
			self.showPopup = function() {
				if(self.shown) return;

				self.loadContent(self.html, function(content) {
					self.popupEl.style.transform = '';

					self.popupElContainer.innerHTML = content;

					self.bgEl.style.display = "block";
					self.popupEl.style.display = "block";

					// Handle scaling
					self.scalePopup();

					// Save body overflow value and hide scrollbars
					self.overflowDefault = document.body.style.overflow;
					document.body.style.overflow = "hidden";

					self.shown = true;
					
					if('' != self.uid) {
						self.cookieManager.create("bioep_shown_session_" + self.uid, "true", 0, true);
						self.cookieManager.create("bioep_shown_" + self.uid, "true", self.cookieExp, false);
					}
					
					if(typeof self.onPopup === "function") {
						self.onPopup();
					}
				});
			};

			// Hide the popup
			self.hidePopup = function() {
				self.bgEl.style.display = "none";
				self.popupEl.style.display = "none";

				// Set body overflow back to default to show scrollbars
				document.body.style.overflow = self.overflowDefault;
			};

			// Handle scaling the popup
			self.scalePopup = function() {
				var margins = { width: 40, height: 40 };
				var popupSize = { width: self.popupEl.offsetWidth, height: self.popupEl.offsetHeight };
				var windowSize = { width: window.innerWidth, height: window.innerHeight };
				var newSize = { width: 0, height: 0 };
				var aspectRatio = popupSize.width / popupSize.height;

				// First go by width, if the popup is larger than the window, scale it
				if(popupSize.width > (windowSize.width - margins.width)) {
					newSize.width = windowSize.width - margins.width;
					newSize.height = newSize.width / aspectRatio;

					// If the height is still too big, scale again
					if(newSize.height > (windowSize.height - margins.height)) {
						newSize.height = windowSize.height - margins.height;
						newSize.width = newSize.height * aspectRatio;
					}
				}

				// If width is fine, check for height
				if(newSize.height === 0) {
					if(popupSize.height > (windowSize.height - margins.height)) {
						newSize.height = windowSize.height - margins.height;
						newSize.width = newSize.height * aspectRatio;
					}
				}

				// Set the scale amount
				var scaleTo = newSize.width / popupSize.width;

				// If the scale ratio is 0 or is going to enlarge (over 1) set it to 1
				if(scaleTo <= 0 || scaleTo > 1) scaleTo = 1;

				// Save current transform style
				if(self.transformDefault === "")
					self.transformDefault = window.getComputedStyle(self.popupEl, null).getPropertyValue("transform");

				// Apply the scale transformation
				self.popupEl.style.transform = self.transformDefault + " scale(" + scaleTo + ")";
			};

			// Event listener initialisation for all browsers
			self.addEvent = function (obj, event, callback) {
				if(obj.addEventListener)
					obj.addEventListener(event, callback, false);
				else if(obj.attachEvent)
					obj.attachEvent("on" + event, callback);
			};

			// Load event listeners for the popup
			self.loadEvents = function() {
				// Track mouseout event on document
				self.addEvent(document, "mouseout", function(e) {
					e = e ? e : window.event;

					// If this is an autocomplete element.
					if(e.target.tagName.toLowerCase() == "input")
						return;

					// Get the current viewport width.
					var vpWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);

					// If the current mouse X position is within 50px of the right edge
					// of the viewport, return.
					if(e.clientX >= (vpWidth - 50))
						return;

					// If the current mouse Y position is not within 50px of the top
					// edge of the viewport, return.
					if(e.clientY >= 50)
						return;

					// Reliable, works on mouse exiting window and
					// user switching active program
					var from = e.relatedTarget || e.toElement;
					
					if(!from) {
						self.showPopup();
					}
				});

				// Handle the popup close button
				self.addEvent(self.closeBtnEl, "click", function() {
					self.hidePopup();
				});

				// Handle window resizing
				self.addEvent(window, "resize", function() {
					self.scalePopup();
				});
			};

			// Set user defined options for the popup
			self.setOptions = function(opts) {
				self.width = (typeof opts.width === 'undefined') ? self.width : opts.width;
				self.height = (typeof opts.height === 'undefined') ? self.height : opts.height;
				self.html = (typeof opts.html === 'undefined') ? self.html : opts.html;
				self.css = (typeof opts.css === 'undefined') ? self.css : opts.css;
				self.fonts = (typeof opts.fonts === 'undefined') ? self.fonts : opts.fonts;
				self.delay = (typeof opts.delay === 'undefined') ? self.delay : opts.delay;
				self.showOnDelay = (typeof opts.showOnDelay === 'undefined') ? self.showOnDelay : opts.showOnDelay;
				self.cookieExp = (typeof opts.cookieExp === 'undefined') ? self.cookieExp : opts.cookieExp;
				self.showOncePerSession = (typeof opts.showOncePerSession === 'undefined') ? self.showOncePerSession : opts.showOncePerSession;
				self.onPopup = (typeof opts.onPopup === 'undefined') ? self.onPopup : opts.onPopup;
				self.uid = (typeof opts.uid === 'undefined') ? self.uid : opts.uid;
			};

			// Ensure the DOM has loaded
			self.domReady = function(callback) {
				(document.readyState === "interactive" || document.readyState === "complete") ? callback() : self.addEvent(document, "DOMContentLoaded", callback);
			};

			self.loadContent = function(url, callback) {
				var xhr = new XMLHttpRequest();

				xhr.open('GET', url);
				xhr.onload = function() {
					if (xhr.status === 200) {
						if(callback && typeof callback == 'function') {
							callback(xhr.responseText);
						}
					}
					else {
						console.log('Request failed.  Returned status of ' + xhr.status);
					}
				};
				xhr.send();
			};

			// Initialize
			self.init = function(opts) {
				// Handle options
				if(typeof opts !== 'undefined') {
					self.setOptions(opts);
				}

				// Once the DOM has fully loaded
				self.domReady(function() {
					// Handle the cookie
					if(self.checkCookie()) {
						return;
					}

					// Add the popup
					self.addPopup();

					// Load events
					setTimeout(function() {					
						self.loadEvents();

						if(self.showOnDelay) {
							self.showPopup();
						}
					}, self.delay * 1000);
				});
			};
		},

		init = function (opts) {
			var b = new bioEp();
			b.init(opts);

			return b;
		};

	return {
		init: init
	}

}(window));