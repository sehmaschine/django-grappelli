(function(win) {
	var whiteSpaceRe = /^\s*|\s*$/g,
		undefined;

	var tinymce = {
		majorVersion : '3',

		minorVersion : '3.9',

		releaseDate : '2010-09-08',

		_init : function() {
			var t = this, d = document, na = navigator, ua = na.userAgent, i, nl, n, base, p, v;

			t.isOpera = win.opera && opera.buildNumber;

			t.isWebKit = /WebKit/.test(ua);

			t.isIE = !t.isWebKit && !t.isOpera && (/MSIE/gi).test(ua) && (/Explorer/gi).test(na.appName);

			t.isIE6 = t.isIE && /MSIE [56]/.test(ua);

			t.isGecko = !t.isWebKit && /Gecko/.test(ua);

			t.isMac = ua.indexOf('Mac') != -1;

			t.isAir = /adobeair/i.test(ua);

			t.isIDevice = /(iPad|iPhone)/.test(ua);

			// TinyMCE .NET webcontrol might be setting the values for TinyMCE
			if (win.tinyMCEPreInit) {
				t.suffix = tinyMCEPreInit.suffix;
				t.baseURL = tinyMCEPreInit.base;
				t.query = tinyMCEPreInit.query;
				return;
			}

			// Get suffix and base
			t.suffix = '';

			// If base element found, add that infront of baseURL
			nl = d.getElementsByTagName('base');
			for (i=0; i<nl.length; i++) {
				if (v = nl[i].href) {
					// Host only value like http://site.com or http://site.com:8008
					if (/^https?:\/\/[^\/]+$/.test(v))
						v += '/';

					base = v ? v.match(/.*\//)[0] : ''; // Get only directory
				}
			}

			function getBase(n) {
				if (n.src && /tiny_mce(|_gzip|_jquery|_prototype|_full)(_dev|_src)?.js/.test(n.src)) {
					if (/_(src|dev)\.js/g.test(n.src))
						t.suffix = '_src';

					if ((p = n.src.indexOf('?')) != -1)
						t.query = n.src.substring(p + 1);

					t.baseURL = n.src.substring(0, n.src.lastIndexOf('/'));

					// If path to script is relative and a base href was found add that one infront
					// the src property will always be an absolute one on non IE browsers and IE 8
					// so this logic will basically only be executed on older IE versions
					if (base && t.baseURL.indexOf('://') == -1 && t.baseURL.indexOf('/') !== 0)
						t.baseURL = base + t.baseURL;

					return t.baseURL;
				}

				return null;
			};

			// Check document
			nl = d.getElementsByTagName('script');
			for (i=0; i<nl.length; i++) {
				if (getBase(nl[i]))
					return;
			}

			// Check head
			n = d.getElementsByTagName('head')[0];
			if (n) {
				nl = n.getElementsByTagName('script');
				for (i=0; i<nl.length; i++) {
					if (getBase(nl[i]))
						return;
				}
			}

			return;
		},

		is : function(o, t) {
			if (!t)
				return o !== undefined;

			if (t == 'array' && (o.hasOwnProperty && o instanceof Array))
				return true;

			return typeof(o) == t;
		},

		each : function(o, cb, s) {
			var n, l;

			if (!o)
				return 0;

			s = s || o;

			if (o.length !== undefined) {
				// Indexed arrays, needed for Safari
				for (n=0, l = o.length; n < l; n++) {
					if (cb.call(s, o[n], n, o) === false)
						return 0;
				}
			} else {
				// Hashtables
				for (n in o) {
					if (o.hasOwnProperty(n)) {
						if (cb.call(s, o[n], n, o) === false)
							return 0;
					}
				}
			}

			return 1;
		},


		trim : function(s) {
			return (s ? '' + s : '').replace(whiteSpaceRe, '');
		},

		create : function(s, p) {
			var t = this, sp, ns, cn, scn, c, de = 0;

			// Parse : <prefix> <class>:<super class>
			s = /^((static) )?([\w.]+)(:([\w.]+))?/.exec(s);
			cn = s[3].match(/(^|\.)(\w+)$/i)[2]; // Class name

			// Create namespace for new class
			ns = t.createNS(s[3].replace(/\.\w+$/, ''));

			// Class already exists
			if (ns[cn])
				return;

			// Make pure static class
			if (s[2] == 'static') {
				ns[cn] = p;

				if (this.onCreate)
					this.onCreate(s[2], s[3], ns[cn]);

				return;
			}

			// Create default constructor
			if (!p[cn]) {
				p[cn] = function() {};
				de = 1;
			}

			// Add constructor and methods
			ns[cn] = p[cn];
			t.extend(ns[cn].prototype, p);

			// Extend
			if (s[5]) {
				sp = t.resolve(s[5]).prototype;
				scn = s[5].match(/\.(\w+)$/i)[1]; // Class name

				// Extend constructor
				c = ns[cn];
				if (de) {
					// Add passthrough constructor
					ns[cn] = function() {
						return sp[scn].apply(this, arguments);
					};
				} else {
					// Add inherit constructor
					ns[cn] = function() {
						this.parent = sp[scn];
						return c.apply(this, arguments);
					};
				}
				ns[cn].prototype[cn] = ns[cn];

				// Add super methods
				t.each(sp, function(f, n) {
					ns[cn].prototype[n] = sp[n];
				});

				// Add overridden methods
				t.each(p, function(f, n) {
					// Extend methods if needed
					if (sp[n]) {
						ns[cn].prototype[n] = function() {
							this.parent = sp[n];
							return f.apply(this, arguments);
						};
					} else {
						if (n != cn)
							ns[cn].prototype[n] = f;
					}
				});
			}

			// Add static methods
			t.each(p['static'], function(f, n) {
				ns[cn][n] = f;
			});

			if (this.onCreate)
				this.onCreate(s[2], s[3], ns[cn].prototype);
		},

		walk : function(o, f, n, s) {
			s = s || this;

			if (o) {
				if (n)
					o = o[n];

				tinymce.each(o, function(o, i) {
					if (f.call(s, o, i, n) === false)
						return false;

					tinymce.walk(o, f, n, s);
				});
			}
		},

		createNS : function(n, o) {
			var i, v;

			o = o || win;

			n = n.split('.');
			for (i=0; i<n.length; i++) {
				v = n[i];

				if (!o[v])
					o[v] = {};

				o = o[v];
			}

			return o;
		},

		resolve : function(n, o) {
			var i, l;

			o = o || win;

			n = n.split('.');
			for (i = 0, l = n.length; i < l; i++) {
				o = o[n[i]];

				if (!o)
					break;
			}

			return o;
		},

		addUnload : function(f, s) {
			var t = this;

			f = {func : f, scope : s || this};

			if (!t.unloads) {
				function unload() {
					var li = t.unloads, o, n;

					if (li) {
						// Call unload handlers
						for (n in li) {
							o = li[n];

							if (o && o.func)
								o.func.call(o.scope, 1); // Send in one arg to distinct unload and user destroy
						}

						// Detach unload function
						if (win.detachEvent) {
							win.detachEvent('onbeforeunload', fakeUnload);
							win.detachEvent('onunload', unload);
						} else if (win.removeEventListener)
							win.removeEventListener('unload', unload, false);

						// Destroy references
						t.unloads = o = li = w = unload = 0;

						// Run garbarge collector on IE
						if (win.CollectGarbage)
							CollectGarbage();
					}
				};

				function fakeUnload() {
					var d = document;

					// Is there things still loading, then do some magic
					if (d.readyState == 'interactive') {
						function stop() {
							// Prevent memory leak
							d.detachEvent('onstop', stop);

							// Call unload handler
							if (unload)
								unload();

							d = 0;
						};

						// Fire unload when the currently loading page is stopped
						if (d)
							d.attachEvent('onstop', stop);

						// Remove onstop listener after a while to prevent the unload function
						// to execute if the user presses cancel in an onbeforeunload
						// confirm dialog and then presses the browser stop button
						win.setTimeout(function() {
							if (d)
								d.detachEvent('onstop', stop);
						}, 0);
					}
				};

				// Attach unload handler
				if (win.attachEvent) {
					win.attachEvent('onunload', unload);
					win.attachEvent('onbeforeunload', fakeUnload);
				} else if (win.addEventListener)
					win.addEventListener('unload', unload, false);

				// Setup initial unload handler array
				t.unloads = [f];
			} else
				t.unloads.push(f);

			return f;
		},

		removeUnload : function(f) {
			var u = this.unloads, r = null;

			tinymce.each(u, function(o, i) {
				if (o && o.func == f) {
					u.splice(i, 1);
					r = f;
					return false;
				}
			});

			return r;
		},

		explode : function(s, d) {
			return s ? tinymce.map(s.split(d || ','), tinymce.trim) : s;
		},

		_addVer : function(u) {
			var v;

			if (!this.query)
				return u;

			v = (u.indexOf('?') == -1 ? '?' : '&') + this.query;

			if (u.indexOf('#') == -1)
				return u + v;

			return u.replace('#', v + '#');
		}

		};

	// Initialize the API
	tinymce._init();

	// Expose tinymce namespace to the global namespace (window)
	win.tinymce = win.tinyMCE = tinymce;
})(window);

(function($, tinymce) {
	var is = tinymce.is, attrRegExp = /^(href|src|style)$/i, undefined;

	// jQuery is undefined
	if (!$)
		return alert("Load jQuery first!");

	// Stick jQuery into the tinymce namespace
	tinymce.$ = $;

	// Setup adapter
	tinymce.adapter = {
		patchEditor : function(editor) {
			var fn = $.fn;

			// Adapt the css function to make sure that the _mce_style
			// attribute gets updated with the new style information
			function css(name, value) {
				var self = this;

				// Remove _mce_style when set operation occurs
				if (value)
					self.removeAttr('_mce_style');

				return fn.css.apply(self, arguments);
			};

			// Apapt the attr function to make sure that it uses the _mce_ prefixed variants
			function attr(name, value) {
				var self = this;

				// Update/retrive _mce_ attribute variants
				if (attrRegExp.test(name)) {
					if (value !== undefined) {
						// Use TinyMCE behavior when setting the specifc attributes
						self.each(function(i, node) {
							editor.dom.setAttrib(node, name, value);
						});

						return self;
					} else
						return self.attr('_mce_' + name);
				}

				// Default behavior
				return fn.attr.apply(self, arguments);
			};

			function htmlPatchFunc(func) {
				// Returns a modified function that processes
				// the HTML before executing the action this makes sure
				// that href/src etc gets moved into the _mce_ variants
				return function(content) {
					if (content)
						content = editor.dom.processHTML(content);

					return func.call(this, content);
				};
			};

			// Patch various jQuery functions to handle tinymce specific attribute and content behavior
			// we don't patch the jQuery.fn directly since it will most likely break compatibility
			// with other jQuery logic on the page. Only instances created by TinyMCE should be patched.
			function patch(jq) {
				// Patch some functions, only patch the object once
				if (jq.css !== css) {
					// Patch css/attr to use the _mce_ prefixed attribute variants
					jq.css = css;
					jq.attr = attr;

					// Patch HTML functions to use the DOMUtils.processHTML filter logic
					jq.html = htmlPatchFunc(fn.html);
					jq.append = htmlPatchFunc(fn.append);
					jq.prepend = htmlPatchFunc(fn.prepend);
					jq.after = htmlPatchFunc(fn.after);
					jq.before = htmlPatchFunc(fn.before);
					jq.replaceWith = htmlPatchFunc(fn.replaceWith);
					jq.tinymce = editor;

					// Each pushed jQuery instance needs to be patched
					// as well for example when traversing the DOM
					jq.pushStack = function() {
						return patch(fn.pushStack.apply(this, arguments));
					};
				}

				return jq;
			};

			// Add a $ function on each editor instance this one is scoped for the editor document object
			// this way you can do chaining like this tinymce.get(0).$('p').append('text').css('color', 'red');
			editor.$ = function(selector, scope) {
				var doc = editor.getDoc();

				return patch($(selector || doc, doc || scope));
			};
		}
	};

	// Patch in core NS functions
	tinymce.extend = $.extend;
	tinymce.extend(tinymce, {
		map : $.map,
		grep : function(a, f) {return $.grep(a, f || function(){return 1;});},
		inArray : function(a, v) {return $.inArray(v, a || []);}

		/* Didn't iterate stylesheets
		each : function(o, cb, s) {
			if (!o)
				return 0;

			var r = 1;

			$.each(o, function(nr, el){
				if (cb.call(s, el, nr, o) === false) {
					r = 0;
					return false;
				}
			});

			return r;
		}*/
	});

	// Patch in functions in various clases
	// Add a "#ifndefjquery" statement around each core API function you add below
	var patches = {
		'tinymce.dom.DOMUtils' : {
			/*
			addClass : function(e, c) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');
				return (e && $(is(e, 'string') ? '#' + e : e)
					.addClass(c)
					.attr('class')) || false;
			},

			hasClass : function(n, c) {
				return $(is(n, 'string') ? '#' + n : n).hasClass(c);
			},

			removeClass : function(e, c) {
				if (!e)
					return false;

				var r = [];

				$(is(e, 'string') ? '#' + e : e)
					.removeClass(c)
					.each(function(){
						r.push(this.className);
					});

				return r.length == 1 ? r[0] : r;
			},
			*/

			select : function(pattern, scope) {
				var t = this;

				return $.find(pattern, t.get(scope) || t.get(t.settings.root_element) || t.doc, []);
			},

			is : function(n, patt) {
				return $(this.get(n)).is(patt);
			}

			/*
			show : function(e) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				$(is(e, 'string') ? '#' + e : e).css('display', 'block');
			},

			hide : function(e) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				$(is(e, 'string') ? '#' + e : e).css('display', 'none');
			},

			isHidden : function(e) {
				return $(is(e, 'string') ? '#' + e : e).is(':hidden');
			},

			insertAfter : function(n, e) {
				return $(is(e, 'string') ? '#' + e : e).after(n);
			},

			replace : function(o, n, k) {
				n = $(is(n, 'string') ? '#' + n : n);

				if (k)
					n.children().appendTo(o);

				n.replaceWith(o);
			},

			setStyle : function(n, na, v) {
				if (is(n, 'array') && is(n[0], 'string'))
					n = n.join(',#');

				$(is(n, 'string') ? '#' + n : n).css(na, v);
			},

			getStyle : function(n, na, c) {
				return $(is(n, 'string') ? '#' + n : n).css(na);
			},

			setStyles : function(e, o) {
				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');
				$(is(e, 'string') ? '#' + e : e).css(o);
			},

			setAttrib : function(e, n, v) {
				var t = this, s = t.settings;

				if (is(e, 'array') && is(e[0], 'string'))
					e = e.join(',#');

				e = $(is(e, 'string') ? '#' + e : e);

				switch (n) {
					case "style":
						e.each(function(i, v){
							if (s.keep_values)
								$(v).attr('_mce_style', v);

							v.style.cssText = v;
						});
						break;

					case "class":
						e.each(function(){
							this.className = v;
						});
						break;

					case "src":
					case "href":
						e.each(function(i, v){
							if (s.keep_values) {
								if (s.url_converter)
									v = s.url_converter.call(s.url_converter_scope || t, v, n, v);

								t.setAttrib(v, '_mce_' + n, v);
							}
						});

						break;
				}

				if (v !== null && v.length !== 0)
					e.attr(n, '' + v);
				else
					e.removeAttr(n);
			},

			setAttribs : function(e, o) {
				var t = this;

				$.each(o, function(n, v){
					t.setAttrib(e,n,v);
				});
			}
			*/
		}

/*
		'tinymce.dom.Event' : {
			add : function (o, n, f, s) {
				var lo, cb;

				cb = function(e) {
					e.target = e.target || this;
					f.call(s || this, e);
				};

				if (is(o, 'array') && is(o[0], 'string'))
					o = o.join(',#');
				o = $(is(o, 'string') ? '#' + o : o);
				if (n == 'init') {
					o.ready(cb, s);
				} else {
					if (s) {
						o.bind(n, s, cb);
					} else {
						o.bind(n, cb);
					}
				}

				lo = this._jqLookup || (this._jqLookup = []);
				lo.push({func : f, cfunc : cb});

				return cb;
			},

			remove : function(o, n, f) {
				// Find cfunc
				$(this._jqLookup).each(function() {
					if (this.func === f)
						f = this.cfunc;
				});

				if (is(o, 'array') && is(o[0], 'string'))
					o = o.join(',#');

				$(is(o, 'string') ? '#' + o : o).unbind(n,f);

				return true;
			}
		}
*/
	};

	// Patch functions after a class is created
	tinymce.onCreate = function(ty, c, p) {
		tinymce.extend(p, patches[c]);
	};
})(window.jQuery, tinymce);



tinymce.create('tinymce.util.Dispatcher', {
	scope : null,
	listeners : null,

	Dispatcher : function(s) {
		this.scope = s || this;
		this.listeners = [];
	},

	add : function(cb, s) {
		this.listeners.push({cb : cb, scope : s || this.scope});

		return cb;
	},

	addToTop : function(cb, s) {
		this.listeners.unshift({cb : cb, scope : s || this.scope});

		return cb;
	},

	remove : function(cb) {
		var l = this.listeners, o = null;

		tinymce.each(l, function(c, i) {
			if (cb == c.cb) {
				o = cb;
				l.splice(i, 1);
				return false;
			}
		});

		return o;
	},

	dispatch : function() {
		var s, a = arguments, i, li = this.listeners, c;

		// Needs to be a real loop since the listener count might change while looping
		// And this is also more efficient
		for (i = 0; i<li.length; i++) {
			c = li[i];
			s = c.cb.apply(c.scope, a);

			if (s === false)
				break;
		}

		return s;
	}

	});

(function() {
	var each = tinymce.each;

	tinymce.create('tinymce.util.URI', {
		URI : function(u, s) {
			var t = this, o, a, b;

			// Trim whitespace
			u = tinymce.trim(u);

			// Default settings
			s = t.settings = s || {};

			// Strange app protocol or local anchor
			if (/^(mailto|tel|news|javascript|about|data):/i.test(u) || /^\s*#/.test(u)) {
				t.source = u;
				return;
			}

			// Absolute path with no host, fake host and protocol
			if (u.indexOf('/') === 0 && u.indexOf('//') !== 0)
				u = (s.base_uri ? s.base_uri.protocol || 'http' : 'http') + '://mce_host' + u;

			// Relative path http:// or protocol relative //path
			if (!/^\w*:?\/\//.test(u))
				u = (s.base_uri.protocol || 'http') + '://mce_host' + t.toAbsPath(s.base_uri.path, u);

			// Parse URL (Credits goes to Steave, http://blog.stevenlevithan.com/archives/parseuri)
			u = u.replace(/@@/g, '(mce_at)'); // Zope 3 workaround, they use @@something
			u = /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(u);
			each(["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"], function(v, i) {
				var s = u[i];

				// Zope 3 workaround, they use @@something
				if (s)
					s = s.replace(/\(mce_at\)/g, '@@');

				t[v] = s;
			});

			if (b = s.base_uri) {
				if (!t.protocol)
					t.protocol = b.protocol;

				if (!t.userInfo)
					t.userInfo = b.userInfo;

				if (!t.port && t.host == 'mce_host')
					t.port = b.port;

				if (!t.host || t.host == 'mce_host')
					t.host = b.host;

				t.source = '';
			}

			//t.path = t.path || '/';
		},

		setPath : function(p) {
			var t = this;

			p = /^(.*?)\/?(\w+)?$/.exec(p);

			// Update path parts
			t.path = p[0];
			t.directory = p[1];
			t.file = p[2];

			// Rebuild source
			t.source = '';
			t.getURI();
		},

		toRelative : function(u) {
			var t = this, o;

			if (u === "./")
				return u;

			u = new tinymce.util.URI(u, {base_uri : t});

			// Not on same domain/port or protocol
			if ((u.host != 'mce_host' && t.host != u.host && u.host) || t.port != u.port || t.protocol != u.protocol)
				return u.getURI();

			o = t.toRelPath(t.path, u.path);

			// Add query
			if (u.query)
				o += '?' + u.query;

			// Add anchor
			if (u.anchor)
				o += '#' + u.anchor;

			return o;
		},
	
		toAbsolute : function(u, nh) {
			var u = new tinymce.util.URI(u, {base_uri : this});

			return u.getURI(this.host == u.host && this.protocol == u.protocol ? nh : 0);
		},

		toRelPath : function(base, path) {
			var items, bp = 0, out = '', i, l;

			// Split the paths
			base = base.substring(0, base.lastIndexOf('/'));
			base = base.split('/');
			items = path.split('/');

			if (base.length >= items.length) {
				for (i = 0, l = base.length; i < l; i++) {
					if (i >= items.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (base.length < items.length) {
				for (i = 0, l = items.length; i < l; i++) {
					if (i >= base.length || base[i] != items[i]) {
						bp = i + 1;
						break;
					}
				}
			}

			if (bp == 1)
				return path;

			for (i = 0, l = base.length - (bp - 1); i < l; i++)
				out += "../";

			for (i = bp - 1, l = items.length; i < l; i++) {
				if (i != bp - 1)
					out += "/" + items[i];
				else
					out += items[i];
			}

			return out;
		},

		toAbsPath : function(base, path) {
			var i, nb = 0, o = [], tr, outPath;

			// Split paths
			tr = /\/$/.test(path) ? '/' : '';
			base = base.split('/');
			path = path.split('/');

			// Remove empty chunks
			each(base, function(k) {
				if (k)
					o.push(k);
			});

			base = o;

			// Merge relURLParts chunks
			for (i = path.length - 1, o = []; i >= 0; i--) {
				// Ignore empty or .
				if (path[i].length == 0 || path[i] == ".")
					continue;

				// Is parent
				if (path[i] == '..') {
					nb++;
					continue;
				}

				// Move up
				if (nb > 0) {
					nb--;
					continue;
				}

				o.push(path[i]);
			}

			i = base.length - nb;

			// If /a/b/c or /
			if (i <= 0)
				outPath = o.reverse().join('/');
			else
				outPath = base.slice(0, i).join('/') + '/' + o.reverse().join('/');

			// Add front / if it's needed
			if (outPath.indexOf('/') !== 0)
				outPath = '/' + outPath;

			// Add traling / if it's needed
			if (tr && outPath.lastIndexOf('/') !== outPath.length - 1)
				outPath += tr;

			return outPath;
		},

		getURI : function(nh) {
			var s, t = this;

			// Rebuild source
			if (!t.source || nh) {
				s = '';

				if (!nh) {
					if (t.protocol)
						s += t.protocol + '://';

					if (t.userInfo)
						s += t.userInfo + '@';

					if (t.host)
						s += t.host;

					if (t.port)
						s += ':' + t.port;
				}

				if (t.path)
					s += t.path;

				if (t.query)
					s += '?' + t.query;

				if (t.anchor)
					s += '#' + t.anchor;

				t.source = s;
			}

			return t.source;
		}
	});
})();

(function() {
	var each = tinymce.each;

	tinymce.create('static tinymce.util.Cookie', {
		getHash : function(n) {
			var v = this.get(n), h;

			if (v) {
				each(v.split('&'), function(v) {
					v = v.split('=');
					h = h || {};
					h[unescape(v[0])] = unescape(v[1]);
				});
			}

			return h;
		},

		setHash : function(n, v, e, p, d, s) {
			var o = '';

			each(v, function(v, k) {
				o += (!o ? '' : '&') + escape(k) + '=' + escape(v);
			});

			this.set(n, o, e, p, d, s);
		},

		get : function(n) {
			var c = document.cookie, e, p = n + "=", b;

			// Strict mode
			if (!c)
				return;

			b = c.indexOf("; " + p);

			if (b == -1) {
				b = c.indexOf(p);

				if (b != 0)
					return null;
			} else
				b += 2;

			e = c.indexOf(";", b);

			if (e == -1)
				e = c.length;

			return unescape(c.substring(b + p.length, e));
		},

		set : function(n, v, e, p, d, s) {
			document.cookie = n + "=" + escape(v) +
				((e) ? "; expires=" + e.toGMTString() : "") +
				((p) ? "; path=" + escape(p) : "") +
				((d) ? "; domain=" + d : "") +
				((s) ? "; secure" : "");
		},

		remove : function(n, p) {
			var d = new Date();

			d.setTime(d.getTime() - 1000);

			this.set(n, '', d, p, d);
		}
	});
})();

tinymce.create('static tinymce.util.JSON', {
	serialize : function(o) {
		var i, v, s = tinymce.util.JSON.serialize, t;

		if (o == null)
			return 'null';

		t = typeof o;

		if (t == 'string') {
			v = '\bb\tt\nn\ff\rr\""\'\'\\\\';

			return '"' + o.replace(/([\u0080-\uFFFF\x00-\x1f\"])/g, function(a, b) {
				i = v.indexOf(b);

				if (i + 1)
					return '\\' + v.charAt(i + 1);

				a = b.charCodeAt().toString(16);

				return '\\u' + '0000'.substring(a.length) + a;
			}) + '"';
		}

		if (t == 'object') {
			if (o.hasOwnProperty && o instanceof Array) {
					for (i=0, v = '['; i<o.length; i++)
						v += (i > 0 ? ',' : '') + s(o[i]);

					return v + ']';
				}

				v = '{';

				for (i in o)
					v += typeof o[i] != 'function' ? (v.length > 1 ? ',"' : '"') + i + '":' + s(o[i]) : '';

				return v + '}';
		}

		return '' + o;
	},

	parse : function(s) {
		try {
			return eval('(' + s + ')');
		} catch (ex) {
			// Ignore
		}
	}

	});

tinymce.create('static tinymce.util.XHR', {
	send : function(o) {
		var x, t, w = window, c = 0;

		// Default settings
		o.scope = o.scope || this;
		o.success_scope = o.success_scope || o.scope;
		o.error_scope = o.error_scope || o.scope;
		o.async = o.async === false ? false : true;
		o.data = o.data || '';

		function get(s) {
			x = 0;

			try {
				x = new ActiveXObject(s);
			} catch (ex) {
			}

			return x;
		};

		x = w.XMLHttpRequest ? new XMLHttpRequest() : get('Microsoft.XMLHTTP') || get('Msxml2.XMLHTTP');

		if (x) {
			if (x.overrideMimeType)
				x.overrideMimeType(o.content_type);

			x.open(o.type || (o.data ? 'POST' : 'GET'), o.url, o.async);

			if (o.content_type)
				x.setRequestHeader('Content-Type', o.content_type);

			x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');

			x.send(o.data);

			function ready() {
				if (!o.async || x.readyState == 4 || c++ > 10000) {
					if (o.success && c < 10000 && x.status == 200)
						o.success.call(o.success_scope, '' + x.responseText, x, o);
					else if (o.error)
						o.error.call(o.error_scope, c > 10000 ? 'TIMED_OUT' : 'GENERAL', x, o);

					x = null;
				} else
					w.setTimeout(ready, 10);
			};

			// Syncronous request
			if (!o.async)
				return ready();

			// Wait for response, onReadyStateChange can not be used since it leaks memory in IE
			t = w.setTimeout(ready, 10);
		}
	}
});

(function() {
	var extend = tinymce.extend, JSON = tinymce.util.JSON, XHR = tinymce.util.XHR;

	tinymce.create('tinymce.util.JSONRequest', {
		JSONRequest : function(s) {
			this.settings = extend({
			}, s);
			this.count = 0;
		},

		send : function(o) {
			var ecb = o.error, scb = o.success;

			o = extend(this.settings, o);

			o.success = function(c, x) {
				c = JSON.parse(c);

				if (typeof(c) == 'undefined') {
					c = {
						error : 'JSON Parse error.'
					};
				}

				if (c.error)
					ecb.call(o.error_scope || o.scope, c.error, x);
				else
					scb.call(o.success_scope || o.scope, c.result);
			};

			o.error = function(ty, x) {
				ecb.call(o.error_scope || o.scope, ty, x);
			};

			o.data = JSON.serialize({
				id : o.id || 'c' + (this.count++),
				method : o.method,
				params : o.params
			});

			// JSON content type for Ruby on rails. Bug: #1883287
			o.content_type = 'application/json';

			XHR.send(o);
		},

		'static' : {
			sendRPC : function(o) {
				return new tinymce.util.JSONRequest().send(o);
			}
		}
	});
}());
(function(tinymce) {
	// Shorten names
	var each = tinymce.each,
		is = tinymce.is,
		isWebKit = tinymce.isWebKit,
		isIE = tinymce.isIE,
		blockRe = /^(H[1-6R]|P|DIV|ADDRESS|PRE|FORM|T(ABLE|BODY|HEAD|FOOT|H|R|D)|LI|OL|UL|CAPTION|BLOCKQUOTE|CENTER|DL|DT|DD|DIR|FIELDSET|NOSCRIPT|MENU|ISINDEX|SAMP)$/,
		boolAttrs = makeMap('checked,compact,declare,defer,disabled,ismap,multiple,nohref,noresize,noshade,nowrap,readonly,selected'),
		mceAttribs = makeMap('src,href,style,coords,shape'),
		encodedChars = {'&' : '&amp;', '"' : '&quot;', '<' : '&lt;', '>' : '&gt;'},
		encodeCharsRe = /[<>&\"]/g,
		simpleSelectorRe = /^([a-z0-9],?)+$/i,
		tagRegExp = /<(\w+)((?:\s+\w+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)(\s*\/?)>/g,
		attrRegExp = /(\w+)(?:\s*=\s*(?:(?:"((?:\\.|[^"])*)")|(?:'((?:\\.|[^'])*)')|([^>\s]+)))?/g;

	function makeMap(str) {
		var map = {}, i;

		str = str.split(',');
		for (i = str.length; i >= 0; i--)
			map[str[i]] = 1;

		return map;
	};

	tinymce.create('tinymce.dom.DOMUtils', {
		doc : null,
		root : null,
		files : null,
		pixelStyles : /^(top|left|bottom|right|width|height|borderWidth)$/,
		props : {
			"for" : "htmlFor",
			"class" : "className",
			className : "className",
			checked : "checked",
			disabled : "disabled",
			maxlength : "maxLength",
			readonly : "readOnly",
			selected : "selected",
			value : "value",
			id : "id",
			name : "name",
			type : "type"
		},

		DOMUtils : function(d, s) {
			var t = this, globalStyle;

			t.doc = d;
			t.win = window;
			t.files = {};
			t.cssFlicker = false;
			t.counter = 0;
			t.boxModel = !tinymce.isIE || d.compatMode == "CSS1Compat"; 
			t.stdMode = d.documentMode === 8;

			t.settings = s = tinymce.extend({
				keep_values : false,
				hex_colors : 1,
				process_html : 1
			}, s);

			// Fix IE6SP2 flicker and check it failed for pre SP2
			if (tinymce.isIE6) {
				try {
					d.execCommand('BackgroundImageCache', false, true);
				} catch (e) {
					t.cssFlicker = true;
				}
			}

			// Build styles list
			if (s.valid_styles) {
				t._styles = {};

				// Convert styles into a rule list
				each(s.valid_styles, function(value, key) {
					t._styles[key] = tinymce.explode(value);
				});
			}

			tinymce.addUnload(t.destroy, t);
		},

		getRoot : function() {
			var t = this, s = t.settings;

			return (s && t.get(s.root_element)) || t.doc.body;
		},

		getViewPort : function(w) {
			var d, b;

			w = !w ? this.win : w;
			d = w.document;
			b = this.boxModel ? d.documentElement : d.body;

			// Returns viewport size excluding scrollbars
			return {
				x : w.pageXOffset || b.scrollLeft,
				y : w.pageYOffset || b.scrollTop,
				w : w.innerWidth || b.clientWidth,
				h : w.innerHeight || b.clientHeight
			};
		},

		getRect : function(e) {
			var p, t = this, sr;

			e = t.get(e);
			p = t.getPos(e);
			sr = t.getSize(e);

			return {
				x : p.x,
				y : p.y,
				w : sr.w,
				h : sr.h
			};
		},

		getSize : function(e) {
			var t = this, w, h;

			e = t.get(e);
			w = t.getStyle(e, 'width');
			h = t.getStyle(e, 'height');

			// Non pixel value, then force offset/clientWidth
			if (w.indexOf('px') === -1)
				w = 0;

			// Non pixel value, then force offset/clientWidth
			if (h.indexOf('px') === -1)
				h = 0;

			return {
				w : parseInt(w) || e.offsetWidth || e.clientWidth,
				h : parseInt(h) || e.offsetHeight || e.clientHeight
			};
		},

		getParent : function(n, f, r) {
			return this.getParents(n, f, r, false);
		},

		getParents : function(n, f, r, c) {
			var t = this, na, se = t.settings, o = [];

			n = t.get(n);
			c = c === undefined;

			if (se.strict_root)
				r = r || t.getRoot();

			// Wrap node name as func
			if (is(f, 'string')) {
				na = f;

				if (f === '*') {
					f = function(n) {return n.nodeType == 1;};
				} else {
					f = function(n) {
						return t.is(n, na);
					};
				}
			}

			while (n) {
				if (n == r || !n.nodeType || n.nodeType === 9)
					break;

				if (!f || f(n)) {
					if (c)
						o.push(n);
					else
						return n;
				}

				n = n.parentNode;
			}

			return c ? o : null;
		},

		get : function(e) {
			var n;

			if (e && this.doc && typeof(e) == 'string') {
				n = e;
				e = this.doc.getElementById(e);

				// IE and Opera returns meta elements when they match the specified input ID, but getElementsByName seems to do the trick
				if (e && e.id !== n)
					return this.doc.getElementsByName(n)[1];
			}

			return e;
		},

		getNext : function(node, selector) {
			return this._findSib(node, selector, 'nextSibling');
		},

		getPrev : function(node, selector) {
			return this._findSib(node, selector, 'previousSibling');
		},


		add : function(p, n, a, h, c) {
			var t = this;

			return this.run(p, function(p) {
				var e, k;

				e = is(n, 'string') ? t.doc.createElement(n) : n;
				t.setAttribs(e, a);

				if (h) {
					if (h.nodeType)
						e.appendChild(h);
					else
						t.setHTML(e, h);
				}

				return !c ? p.appendChild(e) : e;
			});
		},

		create : function(n, a, h) {
			return this.add(this.doc.createElement(n), n, a, h, 1);
		},

		createHTML : function(n, a, h) {
			var o = '', t = this, k;

			o += '<' + n;

			for (k in a) {
				if (a.hasOwnProperty(k))
					o += ' ' + k + '="' + t.encode(a[k]) + '"';
			}

			if (tinymce.is(h))
				return o + '>' + h + '</' + n + '>';

			return o + ' />';
		},

		remove : function(node, keep_children) {
			return this.run(node, function(node) {
				var parent, child;

				parent = node.parentNode;

				if (!parent)
					return null;

				if (keep_children) {
					while (child = node.firstChild) {
						// IE 8 will crash if you don't remove completely empty text nodes
						if (!tinymce.isIE || child.nodeType !== 3 || child.nodeValue)
							parent.insertBefore(child, node);
						else
							node.removeChild(child);
					}
				}

				return parent.removeChild(node);
			});
		},

		setStyle : function(n, na, v) {
			var t = this;

			return t.run(n, function(e) {
				var s, i;

				s = e.style;

				// Camelcase it, if needed
				na = na.replace(/-(\D)/g, function(a, b){
					return b.toUpperCase();
				});

				// Default px suffix on these
				if (t.pixelStyles.test(na) && (tinymce.is(v, 'number') || /^[\-0-9\.]+$/.test(v)))
					v += 'px';

				switch (na) {
					case 'opacity':
						// IE specific opacity
						if (isIE) {
							s.filter = v === '' ? '' : "alpha(opacity=" + (v * 100) + ")";

							if (!n.currentStyle || !n.currentStyle.hasLayout)
								s.display = 'inline-block';
						}

						// Fix for older browsers
						s[na] = s['-moz-opacity'] = s['-khtml-opacity'] = v || '';
						break;

					case 'float':
						isIE ? s.styleFloat = v : s.cssFloat = v;
						break;
					
					default:
						s[na] = v || '';
				}

				// Force update of the style data
				if (t.settings.update_styles)
					t.setAttrib(e, '_mce_style');
			});
		},

		getStyle : function(n, na, c) {
			n = this.get(n);

			if (!n)
				return false;

			// Gecko
			if (this.doc.defaultView && c) {
				// Remove camelcase
				na = na.replace(/[A-Z]/g, function(a){
					return '-' + a;
				});

				try {
					return this.doc.defaultView.getComputedStyle(n, null).getPropertyValue(na);
				} catch (ex) {
					// Old safari might fail
					return null;
				}
			}

			// Camelcase it, if needed
			na = na.replace(/-(\D)/g, function(a, b){
				return b.toUpperCase();
			});

			if (na == 'float')
				na = isIE ? 'styleFloat' : 'cssFloat';

			// IE & Opera
			if (n.currentStyle && c)
				return n.currentStyle[na];

			return n.style[na];
		},

		setStyles : function(e, o) {
			var t = this, s = t.settings, ol;

			ol = s.update_styles;
			s.update_styles = 0;

			each(o, function(v, n) {
				t.setStyle(e, n, v);
			});

			// Update style info
			s.update_styles = ol;
			if (s.update_styles)
				t.setAttrib(e, s.cssText);
		},

		setAttrib : function(e, n, v) {
			var t = this;

			// Whats the point
			if (!e || !n)
				return;

			// Strict XML mode
			if (t.settings.strict)
				n = n.toLowerCase();

			return this.run(e, function(e) {
				var s = t.settings;

				switch (n) {
					case "style":
						if (!is(v, 'string')) {
							each(v, function(v, n) {
								t.setStyle(e, n, v);
							});

							return;
						}

						// No mce_style for elements with these since they might get resized by the user
						if (s.keep_values) {
							if (v && !t._isRes(v))
								e.setAttribute('_mce_style', v, 2);
							else
								e.removeAttribute('_mce_style', 2);
						}

						e.style.cssText = v;
						break;

					case "class":
						e.className = v || ''; // Fix IE null bug
						break;

					case "src":
					case "href":
						if (s.keep_values) {
							if (s.url_converter)
								v = s.url_converter.call(s.url_converter_scope || t, v, n, e);

							t.setAttrib(e, '_mce_' + n, v, 2);
						}

						break;
					
					case "shape":
						e.setAttribute('_mce_style', v);
						break;
				}

				if (is(v) && v !== null && v.length !== 0)
					e.setAttribute(n, '' + v, 2);
				else
					e.removeAttribute(n, 2);
			});
		},

		setAttribs : function(e, o) {
			var t = this;

			return this.run(e, function(e) {
				each(o, function(v, n) {
					t.setAttrib(e, n, v);
				});
			});
		},

		getAttrib : function(e, n, dv) {
			var v, t = this;

			e = t.get(e);

			if (!e || e.nodeType !== 1)
				return false;

			if (!is(dv))
				dv = '';

			// Try the mce variant for these
			if (/^(src|href|style|coords|shape)$/.test(n)) {
				v = e.getAttribute("_mce_" + n);

				if (v)
					return v;
			}

			if (isIE && t.props[n]) {
				v = e[t.props[n]];
				v = v && v.nodeValue ? v.nodeValue : v;
			}

			if (!v)
				v = e.getAttribute(n, 2);

			// Check boolean attribs
			if (/^(checked|compact|declare|defer|disabled|ismap|multiple|nohref|noshade|nowrap|readonly|selected)$/.test(n)) {
				if (e[t.props[n]] === true && v === '')
					return n;

				return v ? n : '';
			}

			// Inner input elements will override attributes on form elements
			if (e.nodeName === "FORM" && e.getAttributeNode(n))
				return e.getAttributeNode(n).nodeValue;

			if (n === 'style') {
				v = v || e.style.cssText;

				if (v) {
					v = t.serializeStyle(t.parseStyle(v), e.nodeName);

					if (t.settings.keep_values && !t._isRes(v))
						e.setAttribute('_mce_style', v);
				}
			}

			// Remove Apple and WebKit stuff
			if (isWebKit && n === "class" && v)
				v = v.replace(/(apple|webkit)\-[a-z\-]+/gi, '');

			// Handle IE issues
			if (isIE) {
				switch (n) {
					case 'rowspan':
					case 'colspan':
						// IE returns 1 as default value
						if (v === 1)
							v = '';

						break;

					case 'size':
						// IE returns +0 as default value for size
						if (v === '+0' || v === 20 || v === 0)
							v = '';

						break;

					case 'width':
					case 'height':
					case 'vspace':
					case 'checked':
					case 'disabled':
					case 'readonly':
						if (v === 0)
							v = '';

						break;

					case 'hspace':
						// IE returns -1 as default value
						if (v === -1)
							v = '';

						break;

					case 'maxlength':
					case 'tabindex':
						// IE returns default value
						if (v === 32768 || v === 2147483647 || v === '32768')
							v = '';

						break;

					case 'multiple':
					case 'compact':
					case 'noshade':
					case 'nowrap':
						if (v === 65535)
							return n;

						return dv;

					case 'shape':
						v = v.toLowerCase();
						break;

					default:
						// IE has odd anonymous function for event attributes
						if (n.indexOf('on') === 0 && v)
							v = ('' + v).replace(/^function\s+\w+\(\)\s+\{\s+(.*)\s+\}$/, '$1');
				}
			}

			return (v !== undefined && v !== null && v !== '') ? '' + v : dv;
		},

		getPos : function(n, ro) {
			var t = this, x = 0, y = 0, e, d = t.doc, r;

			n = t.get(n);
			ro = ro || d.body;

			if (n) {
				// Use getBoundingClientRect on IE, Opera has it but it's not perfect
				if (isIE && !t.stdMode) {
					n = n.getBoundingClientRect();
					e = t.boxModel ? d.documentElement : d.body;
					x = t.getStyle(t.select('html')[0], 'borderWidth'); // Remove border
					x = (x == 'medium' || t.boxModel && !t.isIE6) && 2 || x;

					return {x : n.left + e.scrollLeft - x, y : n.top + e.scrollTop - x};
				}

				r = n;
				while (r && r != ro && r.nodeType) {
					x += r.offsetLeft || 0;
					y += r.offsetTop || 0;
					r = r.offsetParent;
				}

				r = n.parentNode;
				while (r && r != ro && r.nodeType) {
					x -= r.scrollLeft || 0;
					y -= r.scrollTop || 0;
					r = r.parentNode;
				}
			}

			return {x : x, y : y};
		},

		parseStyle : function(st) {
			var t = this, s = t.settings, o = {};

			if (!st)
				return o;

			function compress(p, s, ot) {
				var t, r, b, l;

				// Get values and check it it needs compressing
				t = o[p + '-top' + s];
				if (!t)
					return;

				r = o[p + '-right' + s];
				if (t != r)
					return;

				b = o[p + '-bottom' + s];
				if (r != b)
					return;

				l = o[p + '-left' + s];
				if (b != l)
					return;

				// Compress
				o[ot] = l;
				delete o[p + '-top' + s];
				delete o[p + '-right' + s];
				delete o[p + '-bottom' + s];
				delete o[p + '-left' + s];
			};

			function compress2(ta, a, b, c) {
				var t;

				t = o[a];
				if (!t)
					return;

				t = o[b];
				if (!t)
					return;

				t = o[c];
				if (!t)
					return;

				// Compress
				o[ta] = o[a] + ' ' + o[b] + ' ' + o[c];
				delete o[a];
				delete o[b];
				delete o[c];
			};

			st = st.replace(/&(#?[a-z0-9]+);/g, '&$1_MCE_SEMI_'); // Protect entities

			each(st.split(';'), function(v) {
				var sv, ur = [];

				if (v) {
					v = v.replace(/_MCE_SEMI_/g, ';'); // Restore entities
					v = v.replace(/url\([^\)]+\)/g, function(v) {ur.push(v);return 'url(' + ur.length + ')';});
					v = v.split(':');
					sv = tinymce.trim(v[1]);
					sv = sv.replace(/url\(([^\)]+)\)/g, function(a, b) {return ur[parseInt(b) - 1];});

					sv = sv.replace(/rgb\([^\)]+\)/g, function(v) {
						return t.toHex(v);
					});

					if (s.url_converter) {
						sv = sv.replace(/url\([\'\"]?([^\)\'\"]+)[\'\"]?\)/g, function(x, c) {
							return 'url(' + s.url_converter.call(s.url_converter_scope || t, t.decode(c), 'style', null) + ')';
						});
					}

					o[tinymce.trim(v[0]).toLowerCase()] = sv;
				}
			});

			compress("border", "", "border");
			compress("border", "-width", "border-width");
			compress("border", "-color", "border-color");
			compress("border", "-style", "border-style");
			compress("padding", "", "padding");
			compress("margin", "", "margin");
			compress2('border', 'border-width', 'border-style', 'border-color');

			if (isIE) {
				// Remove pointless border
				if (o.border == 'medium none')
					o.border = '';
			}

			return o;
		},

		serializeStyle : function(o, name) {
			var t = this, s = '';

			function add(v, k) {
				if (k && v) {
					// Remove browser specific styles like -moz- or -webkit-
					if (k.indexOf('-') === 0)
						return;

					switch (k) {
						case 'font-weight':
							// Opera will output bold as 700
							if (v == 700)
								v = 'bold';

							break;

						case 'color':
						case 'background-color':
							v = v.toLowerCase();
							break;
					}

					s += (s ? ' ' : '') + k + ': ' + v + ';';
				}
			};

			// Validate style output
			if (name && t._styles) {
				each(t._styles['*'], function(name) {
					add(o[name], name);
				});

				each(t._styles[name.toLowerCase()], function(name) {
					add(o[name], name);
				});
			} else
				each(o, add);

			return s;
		},

		loadCSS : function(u) {
			var t = this, d = t.doc, head;

			if (!u)
				u = '';

			head = t.select('head')[0];

			each(u.split(','), function(u) {
				var link;

				if (t.files[u])
					return;

				t.files[u] = true;
				link = t.create('link', {rel : 'stylesheet', href : tinymce._addVer(u)});

				// IE 8 has a bug where dynamically loading stylesheets would produce a 1 item remaining bug
				// This fix seems to resolve that issue by realcing the document ones a stylesheet finishes loading
				// It's ugly but it seems to work fine.
				if (isIE && d.documentMode) {
					link.onload = function() {
						d.recalc();
						link.onload = null;
					};
				}

				head.appendChild(link);
			});
		},

		addClass : function(e, c) {
			return this.run(e, function(e) {
				var o;

				if (!c)
					return 0;

				if (this.hasClass(e, c))
					return e.className;

				o = this.removeClass(e, c);

				return e.className = (o != '' ? (o + ' ') : '') + c;
			});
		},

		removeClass : function(e, c) {
			var t = this, re;

			return t.run(e, function(e) {
				var v;

				if (t.hasClass(e, c)) {
					if (!re)
						re = new RegExp("(^|\\s+)" + c + "(\\s+|$)", "g");

					v = e.className.replace(re, ' ');
					v = tinymce.trim(v != ' ' ? v : '');

					e.className = v;

					// Empty class attr
					if (!v) {
						e.removeAttribute('class');
						e.removeAttribute('className');
					}

					return v;
				}

				return e.className;
			});
		},

		hasClass : function(n, c) {
			n = this.get(n);

			if (!n || !c)
				return false;

			return (' ' + n.className + ' ').indexOf(' ' + c + ' ') !== -1;
		},

		show : function(e) {
			return this.setStyle(e, 'display', 'block');
		},

		hide : function(e) {
			return this.setStyle(e, 'display', 'none');
		},

		isHidden : function(e) {
			e = this.get(e);

			return !e || e.style.display == 'none' || this.getStyle(e, 'display') == 'none';
		},

		uniqueId : function(p) {
			return (!p ? 'mce_' : p) + (this.counter++);
		},

		setHTML : function(e, h) {
			var t = this;

			return this.run(e, function(e) {
				var x, i, nl, n, p, x;

				h = t.processHTML(h);

				if (isIE) {
					function set() {
						// Remove all child nodes
						while (e.firstChild)
							e.firstChild.removeNode();

						try {
							// IE will remove comments from the beginning
							// unless you padd the contents with something
							e.innerHTML = '<br />' + h;
							e.removeChild(e.firstChild);
						} catch (ex) {
							// IE sometimes produces an unknown runtime error on innerHTML if it's an block element within a block element for example a div inside a p
							// This seems to fix this problem

							// Create new div with HTML contents and a BR infront to keep comments
							x = t.create('div');
							x.innerHTML = '<br />' + h;

							// Add all children from div to target
							each (x.childNodes, function(n, i) {
								// Skip br element
								if (i)
									e.appendChild(n);
							});
						}
					};

					// IE has a serious bug when it comes to paragraphs it can produce an invalid
					// DOM tree if contents like this <p><ul><li>Item 1</li></ul></p> is inserted
					// It seems to be that IE doesn't like a root block element placed inside another root block element
					if (t.settings.fix_ie_paragraphs)
						h = h.replace(/<p><\/p>|<p([^>]+)><\/p>|<p[^\/+]\/>/gi, '<p$1 _mce_keep="true">&nbsp;</p>');

					set();

					if (t.settings.fix_ie_paragraphs) {
						// Check for odd paragraphs this is a sign of a broken DOM
						nl = e.getElementsByTagName("p");
						for (i = nl.length - 1, x = 0; i >= 0; i--) {
							n = nl[i];

							if (!n.hasChildNodes()) {
								if (!n._mce_keep) {
									x = 1; // Is broken
									break;
								}

								n.removeAttribute('_mce_keep');
							}
						}
					}

					// Time to fix the madness IE left us
					if (x) {
						// So if we replace the p elements with divs and mark them and then replace them back to paragraphs
						// after we use innerHTML we can fix the DOM tree
						h = h.replace(/<p ([^>]+)>|<p>/ig, '<div $1 _mce_tmp="1">');
						h = h.replace(/<\/p>/gi, '</div>');

						// Set the new HTML with DIVs
						set();

						// Replace all DIV elements with the _mce_tmp attibute back to paragraphs
						// This is needed since IE has a annoying bug see above for details
						// This is a slow process but it has to be done. :(
						if (t.settings.fix_ie_paragraphs) {
							nl = e.getElementsByTagName("DIV");
							for (i = nl.length - 1; i >= 0; i--) {
								n = nl[i];

								// Is it a temp div
								if (n._mce_tmp) {
									// Create new paragraph
									p = t.doc.createElement('p');

									// Copy all attributes
									n.cloneNode(false).outerHTML.replace(/([a-z0-9\-_]+)=/gi, function(a, b) {
										var v;

										if (b !== '_mce_tmp') {
											v = n.getAttribute(b);

											if (!v && b === 'class')
												v = n.className;

											p.setAttribute(b, v);
										}
									});

									// Append all children to new paragraph
									for (x = 0; x<n.childNodes.length; x++)
										p.appendChild(n.childNodes[x].cloneNode(true));

									// Replace div with new paragraph
									n.swapNode(p);
								}
							}
						}
					}
				} else
					e.innerHTML = h;

				return h;
			});
		},

		processHTML : function(h) {
			var t = this, s = t.settings, codeBlocks = [];

			if (!s.process_html)
				return h;

			if (isIE) {
				h = h.replace(/&apos;/g, '&#39;'); // IE can't handle apos
				h = h.replace(/\s+(disabled|checked|readonly|selected)\s*=\s*[\"\']?(false|0)[\"\']?/gi, ''); // IE doesn't handle default values correct
			}

			// Fix some issues
			h = h.replace(/<a( )([^>]+)\/>|<a\/>/gi, '<a$1$2></a>'); // Force open

			// Store away src and href in _mce_src and mce_href since browsers mess them up
			if (s.keep_values) {
				// Wrap scripts and styles in comments for serialization purposes
				if (/<script|noscript|style/i.test(h)) {
					function trim(s) {
						// Remove prefix and suffix code for element
						s = s.replace(/(<!--\[CDATA\[|\]\]-->)/g, '\n');
						s = s.replace(/^[\r\n]*|[\r\n]*$/g, '');
						s = s.replace(/^\s*(\/\/\s*<!--|\/\/\s*<!\[CDATA\[|<!--|<!\[CDATA\[)[\r\n]*/g, '');
						s = s.replace(/\s*(\/\/\s*\]\]>|\/\/\s*-->|\]\]>|-->|\]\]-->)\s*$/g, '');

						return s;
					};

					// Wrap the script contents in CDATA and keep them from executing
					h = h.replace(/<script([^>]+|)>([\s\S]*?)<\/script>/gi, function(v, attribs, text) {
						// Force type attribute
						if (!attribs)
							attribs = ' type="text/javascript"';

						// Convert the src attribute of the scripts
						attribs = attribs.replace(/src=\"([^\"]+)\"?/i, function(a, url) {
							if (s.url_converter)
								url = t.encode(s.url_converter.call(s.url_converter_scope || t, t.decode(url), 'src', 'script'));

							return '_mce_src="' + url + '"';
						});

						// Wrap text contents
						if (tinymce.trim(text)) {
							codeBlocks.push(trim(text));
							text = '<!--\nMCE_SCRIPT:' + (codeBlocks.length - 1) + '\n// -->';
						}

						return '<mce:script' + attribs + '>' + text + '</mce:script>';
					});

					// Wrap style elements
					h = h.replace(/<style([^>]+|)>([\s\S]*?)<\/style>/gi, function(v, attribs, text) {
						// Wrap text contents
						if (text) {
							codeBlocks.push(trim(text));
							text = '<!--\nMCE_SCRIPT:' + (codeBlocks.length - 1) + '\n-->';
						}

						return '<mce:style' + attribs + '>' + text + '</mce:style><style ' + attribs + ' _mce_bogus="1">' + text + '</style>';
					});

					// Wrap noscript elements
					h = h.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g, function(v, attribs, text) {
						return '<mce:noscript' + attribs + '><!--' + t.encode(text).replace(/--/g, '&#45;&#45;') + '--></mce:noscript>';
					});
				}

				h = h.replace(/<!\[CDATA\[([\s\S]+)\]\]>/g, '<!--[CDATA[$1]]-->');

				// This function processes the attributes in the HTML string to force boolean
				// attributes to the attr="attr" format and convert style, src and href to _mce_ versions
				function processTags(html) {
					return html.replace(tagRegExp, function(match, elm_name, attrs, end) {
						return '<' + elm_name + attrs.replace(attrRegExp, function(match, name, value, val2, val3) {
							var mceValue;

							name = name.toLowerCase();
							value = value || val2 || val3 || "";

							// Treat boolean attributes
							if (boolAttrs[name]) {
								// false or 0 is treated as a missing attribute
								if (value === 'false' || value === '0')
									return;

								return name + '="' + name + '"';
							}

							// Is attribute one that needs special treatment
							if (mceAttribs[name] && attrs.indexOf('_mce_' + name) == -1) {
								mceValue = t.decode(value);

								// Convert URLs to relative/absolute ones
								if (s.url_converter && (name == "src" || name == "href"))
									mceValue = s.url_converter.call(s.url_converter_scope || t, mceValue, name, elm_name);

								// Process styles lowercases them and compresses them
								if (name == 'style')
									mceValue = t.serializeStyle(t.parseStyle(mceValue), name);

								return name + '="' + value + '"' + ' _mce_' + name + '="' + t.encode(mceValue) + '"';
							}

							return match;
						}) + end + '>';
					});
				};

				h = processTags(h);

				// Restore script blocks
				h = h.replace(/MCE_SCRIPT:([0-9]+)/g, function(val, idx) {
					return codeBlocks[idx];
				});
			}

			return h;
		},

		getOuterHTML : function(e) {
			var d;

			e = this.get(e);

			if (!e)
				return null;

			if (e.outerHTML !== undefined)
				return e.outerHTML;

			d = (e.ownerDocument || this.doc).createElement("body");
			d.appendChild(e.cloneNode(true));

			return d.innerHTML;
		},

		setOuterHTML : function(e, h, d) {
			var t = this;

			function setHTML(e, h, d) {
				var n, tp;

				tp = d.createElement("body");
				tp.innerHTML = h;

				n = tp.lastChild;
				while (n) {
					t.insertAfter(n.cloneNode(true), e);
					n = n.previousSibling;
				}

				t.remove(e);
			};

			return this.run(e, function(e) {
				e = t.get(e);

				// Only set HTML on elements
				if (e.nodeType == 1) {
					d = d || e.ownerDocument || t.doc;

					if (isIE) {
						try {
							// Try outerHTML for IE it sometimes produces an unknown runtime error
							if (isIE && e.nodeType == 1)
								e.outerHTML = h;
							else
								setHTML(e, h, d);
						} catch (ex) {
							// Fix for unknown runtime error
							setHTML(e, h, d);
						}
					} else
						setHTML(e, h, d);
				}
			});
		},

		decode : function(s) {
			var e, n, v;

			// Look for entities to decode
			if (/&[\w#]+;/.test(s)) {
				// Decode the entities using a div element not super efficient but less code
				e = this.doc.createElement("div");
				e.innerHTML = s;
				n = e.firstChild;
				v = '';

				if (n) {
					do {
						v += n.nodeValue;
					} while (n = n.nextSibling);
				}

				return v || s;
			}

			return s;
		},

		encode : function(str) {
			return ('' + str).replace(encodeCharsRe, function(chr) {
				return encodedChars[chr];
			});
		},

		insertAfter : function(node, reference_node) {
			reference_node = this.get(reference_node);

			return this.run(node, function(node) {
				var parent, nextSibling;

				parent = reference_node.parentNode;
				nextSibling = reference_node.nextSibling;

				if (nextSibling)
					parent.insertBefore(node, nextSibling);
				else
					parent.appendChild(node);

				return node;
			});
		},

		isBlock : function(n) {
			if (n.nodeType && n.nodeType !== 1)
				return false;

			n = n.nodeName || n;

			return blockRe.test(n);
		},

		replace : function(n, o, k) {
			var t = this;

			if (is(o, 'array'))
				n = n.cloneNode(true);

			return t.run(o, function(o) {
				if (k) {
					each(tinymce.grep(o.childNodes), function(c) {
						n.appendChild(c);
					});
				}

				return o.parentNode.replaceChild(n, o);
			});
		},

		rename : function(elm, name) {
			var t = this, newElm;

			if (elm.nodeName != name.toUpperCase()) {
				// Rename block element
				newElm = t.create(name);

				// Copy attribs to new block
				each(t.getAttribs(elm), function(attr_node) {
					t.setAttrib(newElm, attr_node.nodeName, t.getAttrib(elm, attr_node.nodeName));
				});

				// Replace block
				t.replace(newElm, elm, 1);
			}

			return newElm || elm;
		},

		findCommonAncestor : function(a, b) {
			var ps = a, pe;

			while (ps) {
				pe = b;

				while (pe && ps != pe)
					pe = pe.parentNode;

				if (ps == pe)
					break;

				ps = ps.parentNode;
			}

			if (!ps && a.ownerDocument)
				return a.ownerDocument.documentElement;

			return ps;
		},

		toHex : function(s) {
			var c = /^\s*rgb\s*?\(\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?,\s*?([0-9]+)\s*?\)\s*$/i.exec(s);

			function hex(s) {
				s = parseInt(s).toString(16);

				return s.length > 1 ? s : '0' + s; // 0 -> 00
			};

			if (c) {
				s = '#' + hex(c[1]) + hex(c[2]) + hex(c[3]);

				return s;
			}

			return s;
		},

		getClasses : function() {
			var t = this, cl = [], i, lo = {}, f = t.settings.class_filter, ov;

			if (t.classes)
				return t.classes;

			function addClasses(s) {
				// IE style imports
				each(s.imports, function(r) {
					addClasses(r);
				});

				each(s.cssRules || s.rules, function(r) {
					// Real type or fake it on IE
					switch (r.type || 1) {
						// Rule
						case 1:
							if (r.selectorText) {
								each(r.selectorText.split(','), function(v) {
									v = v.replace(/^\s*|\s*$|^\s\./g, "");

									// Is internal or it doesn't contain a class
									if (/\.mce/.test(v) || !/\.[\w\-]+$/.test(v))
										return;

									// Remove everything but class name
									ov = v;
									v = v.replace(/.*\.([a-z0-9_\-]+).*/i, '$1');

									// Filter classes
									if (f && !(v = f(v, ov)))
										return;

									if (!lo[v]) {
										cl.push({'class' : v});
										lo[v] = 1;
									}
								});
							}
							break;

						// Import
						case 3:
							addClasses(r.styleSheet);
							break;
					}
				});
			};

			try {
				each(t.doc.styleSheets, addClasses);
			} catch (ex) {
				// Ignore
			}

			if (cl.length > 0)
				t.classes = cl;

			return cl;
		},

		run : function(e, f, s) {
			var t = this, o;

			if (t.doc && typeof(e) === 'string')
				e = t.get(e);

			if (!e)
				return false;

			s = s || this;
			if (!e.nodeType && (e.length || e.length === 0)) {
				o = [];

				each(e, function(e, i) {
					if (e) {
						if (typeof(e) == 'string')
							e = t.doc.getElementById(e);

						o.push(f.call(s, e, i));
					}
				});

				return o;
			}

			return f.call(s, e);
		},

		getAttribs : function(n) {
			var o;

			n = this.get(n);

			if (!n)
				return [];

			if (isIE) {
				o = [];

				// Object will throw exception in IE
				if (n.nodeName == 'OBJECT')
					return n.attributes;

				// IE doesn't keep the selected attribute if you clone option elements
				if (n.nodeName === 'OPTION' && this.getAttrib(n, 'selected'))
					o.push({specified : 1, nodeName : 'selected'});

				// It's crazy that this is faster in IE but it's because it returns all attributes all the time
				n.cloneNode(false).outerHTML.replace(/<\/?[\w:\-]+ ?|=[\"][^\"]+\"|=\'[^\']+\'|=[\w\-]+|>/gi, '').replace(/[\w:\-]+/gi, function(a) {
					o.push({specified : 1, nodeName : a});
				});

				return o;
			}

			return n.attributes;
		},

		destroy : function(s) {
			var t = this;

			if (t.events)
				t.events.destroy();

			t.win = t.doc = t.root = t.events = null;

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		},

		createRng : function() {
			var d = this.doc;

			return d.createRange ? d.createRange() : new tinymce.dom.Range(this);
		},

		nodeIndex : function(node, normalized) {
			var idx = 0, lastNodeType, lastNode, nodeType;

			if (node) {
				for (lastNodeType = node.nodeType, node = node.previousSibling, lastNode = node; node; node = node.previousSibling) {
					nodeType = node.nodeType;

					// Normalize text nodes
					if (normalized && nodeType == 3) {
						if (nodeType == lastNodeType || !node.nodeValue.length)
							continue;
					}

					idx++;
					lastNodeType = nodeType;
				}
			}

			return idx;
		},

		split : function(pe, e, re) {
			var t = this, r = t.createRng(), bef, aft, pa;

			// W3C valid browsers tend to leave empty nodes to the left/right side of the contents, this makes sense
			// but we don't want that in our code since it serves no purpose for the end user
			// For example if this is chopped:
			//   <p>text 1<span><b>CHOP</b></span>text 2</p>
			// would produce:
			//   <p>text 1<span></span></p><b>CHOP</b><p><span></span>text 2</p>
			// this function will then trim of empty edges and produce:
			//   <p>text 1</p><b>CHOP</b><p>text 2</p>
			function trim(node) {
				var i, children = node.childNodes;

				if (node.nodeType == 1 && node.getAttribute('_mce_type') == 'bookmark')
					return;

				for (i = children.length - 1; i >= 0; i--)
					trim(children[i]);

				if (node.nodeType != 9) {
					// Keep non whitespace text nodes
					if (node.nodeType == 3 && node.nodeValue.length > 0)
						return;

					if (node.nodeType == 1) {
						// If the only child is a bookmark then move it up
						children = node.childNodes;
						if (children.length == 1 && children[0] && children[0].nodeType == 1 && children[0].getAttribute('_mce_type') == 'bookmark')
							node.parentNode.insertBefore(children[0], node);

						// Keep non empty elements or img, hr etc
						if (children.length || /^(br|hr|input|img)$/i.test(node.nodeName))
							return;
					}

					t.remove(node);
				}

				return node;
			};

			if (pe && e) {
				// Get before chunk
				r.setStart(pe.parentNode, t.nodeIndex(pe));
				r.setEnd(e.parentNode, t.nodeIndex(e));
				bef = r.extractContents();

				// Get after chunk
				r = t.createRng();
				r.setStart(e.parentNode, t.nodeIndex(e) + 1);
				r.setEnd(pe.parentNode, t.nodeIndex(pe) + 1);
				aft = r.extractContents();

				// Insert before chunk
				pa = pe.parentNode;
				pa.insertBefore(trim(bef), pe);

				// Insert middle chunk
				if (re)
					pa.replaceChild(re, e);
				else
					pa.insertBefore(e, pe);

				// Insert after chunk
				pa.insertBefore(trim(aft), pe);
				t.remove(pe);

				return re || e;
			}
		},

		bind : function(target, name, func, scope) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.add(target, name, func, scope || this);
		},

		unbind : function(target, name, func) {
			var t = this;

			if (!t.events)
				t.events = new tinymce.dom.EventUtils();

			return t.events.remove(target, name, func);
		},


		_findSib : function(node, selector, name) {
			var t = this, f = selector;

			if (node) {
				// If expression make a function of it using is
				if (is(f, 'string')) {
					f = function(node) {
						return t.is(node, selector);
					};
				}

				// Loop all siblings
				for (node = node[name]; node; node = node[name]) {
					if (f(node))
						return node;
				}
			}

			return null;
		},

		_isRes : function(c) {
			// Is live resizble element
			return /^(top|left|bottom|right|width|height)/i.test(c) || /;\s*(top|left|bottom|right|width|height)/i.test(c);
		}

		/*
		walk : function(n, f, s) {
			var d = this.doc, w;

			if (d.createTreeWalker) {
				w = d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, false);

				while ((n = w.nextNode()) != null)
					f.call(s || this, n);
			} else
				tinymce.walk(n, f, 'childNodes', s);
		}
		*/

		/*
		toRGB : function(s) {
			var c = /^\s*?#([0-9A-F]{2})([0-9A-F]{1,2})([0-9A-F]{2})?\s*?$/.exec(s);

			if (c) {
				// #FFF -> #FFFFFF
				if (!is(c[3]))
					c[3] = c[2] = c[1];

				return "rgb(" + parseInt(c[1], 16) + "," + parseInt(c[2], 16) + "," + parseInt(c[3], 16) + ")";
			}

			return s;
		}
		*/
	});

	tinymce.DOM = new tinymce.dom.DOMUtils(document, {process_html : 0});
})(tinymce);

(function(ns) {
	// Range constructor
	function Range(dom) {
		var t = this,
			doc = dom.doc,
			EXTRACT = 0,
			CLONE = 1,
			DELETE = 2,
			TRUE = true,
			FALSE = false,
			START_OFFSET = 'startOffset',
			START_CONTAINER = 'startContainer',
			END_CONTAINER = 'endContainer',
			END_OFFSET = 'endOffset',
			extend = tinymce.extend,
			nodeIndex = dom.nodeIndex;

		extend(t, {
			// Inital states
			startContainer : doc,
			startOffset : 0,
			endContainer : doc,
			endOffset : 0,
			collapsed : TRUE,
			commonAncestorContainer : doc,

			// Range constants
			START_TO_START : 0,
			START_TO_END : 1,
			END_TO_END : 2,
			END_TO_START : 3,

			// Public methods
			setStart : setStart,
			setEnd : setEnd,
			setStartBefore : setStartBefore,
			setStartAfter : setStartAfter,
			setEndBefore : setEndBefore,
			setEndAfter : setEndAfter,
			collapse : collapse,
			selectNode : selectNode,
			selectNodeContents : selectNodeContents,
			compareBoundaryPoints : compareBoundaryPoints,
			deleteContents : deleteContents,
			extractContents : extractContents,
			cloneContents : cloneContents,
			insertNode : insertNode,
			surroundContents : surroundContents,
			cloneRange : cloneRange
		});

		function setStart(n, o) {
			_setEndPoint(TRUE, n, o);
		};

		function setEnd(n, o) {
			_setEndPoint(FALSE, n, o);
		};

		function setStartBefore(n) {
			setStart(n.parentNode, nodeIndex(n));
		};

		function setStartAfter(n) {
			setStart(n.parentNode, nodeIndex(n) + 1);
		};

		function setEndBefore(n) {
			setEnd(n.parentNode, nodeIndex(n));
		};

		function setEndAfter(n) {
			setEnd(n.parentNode, nodeIndex(n) + 1);
		};

		function collapse(ts) {
			if (ts) {
				t[END_CONTAINER] = t[START_CONTAINER];
				t[END_OFFSET] = t[START_OFFSET];
			} else {
				t[START_CONTAINER] = t[END_CONTAINER];
				t[START_OFFSET] = t[END_OFFSET];
			}

			t.collapsed = TRUE;
		};

		function selectNode(n) {
			setStartBefore(n);
			setEndAfter(n);
		};

		function selectNodeContents(n) {
			setStart(n, 0);
			setEnd(n, n.nodeType === 1 ? n.childNodes.length : n.nodeValue.length);
		};

		function compareBoundaryPoints(h, r) {
			var sc = t[START_CONTAINER], so = t[START_OFFSET], ec = t[END_CONTAINER], eo = t[END_OFFSET];

			// Check START_TO_START
			if (h === 0)
				return _compareBoundaryPoints(sc, so, sc, so);

			// Check START_TO_END
			if (h === 1)
				return _compareBoundaryPoints(sc, so, ec, eo);

			// Check END_TO_END
			if (h === 2)
				return _compareBoundaryPoints(ec, eo, ec, eo);

			// Check END_TO_START
			if (h === 3)
				return _compareBoundaryPoints(ec, eo, sc, so);
		};

		function deleteContents() {
			_traverse(DELETE);
		};

		function extractContents() {
			return _traverse(EXTRACT);
		};

		function cloneContents() {
			return _traverse(CLONE);
		};

		function insertNode(n) {
			var startContainer = this[START_CONTAINER],
				startOffset = this[START_OFFSET], nn, o;

			// Node is TEXT_NODE or CDATA
			if ((startContainer.nodeType === 3 || startContainer.nodeType === 4) && startContainer.nodeValue) {
				if (!startOffset) {
					// At the start of text
					startContainer.parentNode.insertBefore(n, startContainer);
				} else if (startOffset >= startContainer.nodeValue.length) {
					// At the end of text
					dom.insertAfter(n, startContainer);
				} else {
					// Middle, need to split
					nn = startContainer.splitText(startOffset);
					startContainer.parentNode.insertBefore(n, nn);
				}
			} else {
				// Insert element node
				if (startContainer.childNodes.length > 0)
					o = startContainer.childNodes[startOffset];

				if (o)
					startContainer.insertBefore(n, o);
				else
					startContainer.appendChild(n);
			}
		};

		function surroundContents(n) {
			var f = t.extractContents();

			t.insertNode(n);
			n.appendChild(f);
			t.selectNode(n);
		};

		function cloneRange() {
			return extend(new Range(dom), {
				startContainer : t[START_CONTAINER],
				startOffset : t[START_OFFSET],
				endContainer : t[END_CONTAINER],
				endOffset : t[END_OFFSET],
				collapsed : t.collapsed,
				commonAncestorContainer : t.commonAncestorContainer
			});
		};

		// Private methods

		function _getSelectedNode(container, offset) {
			var child;

			if (container.nodeType == 3 /* TEXT_NODE */)
				return container;

			if (offset < 0)
				return container;

			child = container.firstChild;
			while (child && offset > 0) {
				--offset;
				child = child.nextSibling;
			}

			if (child)
				return child;

			return container;
		};

		function _isCollapsed() {
			return (t[START_CONTAINER] == t[END_CONTAINER] && t[START_OFFSET] == t[END_OFFSET]);
		};

		function _compareBoundaryPoints(containerA, offsetA, containerB, offsetB) {
			var c, offsetC, n, cmnRoot, childA, childB;

			// In the first case the boundary-points have the same container. A is before B
			// if its offset is less than the offset of B, A is equal to B if its offset is
			// equal to the offset of B, and A is after B if its offset is greater than the
			// offset of B.
			if (containerA == containerB) {
				if (offsetA == offsetB)
					return 0; // equal

				if (offsetA < offsetB)
					return -1; // before

				return 1; // after
			}

			// In the second case a child node C of the container of A is an ancestor
			// container of B. In this case, A is before B if the offset of A is less than or
			// equal to the index of the child node C and A is after B otherwise.
			c = containerB;
			while (c && c.parentNode != containerA)
				c = c.parentNode;

			if (c) {
				offsetC = 0;
				n = containerA.firstChild;

				while (n != c && offsetC < offsetA) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetA <= offsetC)
					return -1; // before

				return 1; // after
			}

			// In the third case a child node C of the container of B is an ancestor container
			// of A. In this case, A is before B if the index of the child node C is less than
			// the offset of B and A is after B otherwise.
			c = containerA;
			while (c && c.parentNode != containerB) {
				c = c.parentNode;
			}

			if (c) {
				offsetC = 0;
				n = containerB.firstChild;

				while (n != c && offsetC < offsetB) {
					offsetC++;
					n = n.nextSibling;
				}

				if (offsetC < offsetB)
					return -1; // before

				return 1; // after
			}

			// In the fourth case, none of three other cases hold: the containers of A and B
			// are siblings or descendants of sibling nodes. In this case, A is before B if
			// the container of A is before the container of B in a pre-order traversal of the
			// Ranges' context tree and A is after B otherwise.
			cmnRoot = dom.findCommonAncestor(containerA, containerB);
			childA = containerA;

			while (childA && childA.parentNode != cmnRoot)
				childA = childA.parentNode;

			if (!childA)
				childA = cmnRoot;

			childB = containerB;
			while (childB && childB.parentNode != cmnRoot)
				childB = childB.parentNode;

			if (!childB)
				childB = cmnRoot;

			if (childA == childB)
				return 0; // equal

			n = cmnRoot.firstChild;
			while (n) {
				if (n == childA)
					return -1; // before

				if (n == childB)
					return 1; // after

				n = n.nextSibling;
			}
		};

		function _setEndPoint(st, n, o) {
			var ec, sc;

			if (st) {
				t[START_CONTAINER] = n;
				t[START_OFFSET] = o;
			} else {
				t[END_CONTAINER] = n;
				t[END_OFFSET] = o;
			}

			// If one boundary-point of a Range is set to have a root container
			// other than the current one for the Range, the Range is collapsed to
			// the new position. This enforces the restriction that both boundary-
			// points of a Range must have the same root container.
			ec = t[END_CONTAINER];
			while (ec.parentNode)
				ec = ec.parentNode;

			sc = t[START_CONTAINER];
			while (sc.parentNode)
				sc = sc.parentNode;

			if (sc == ec) {
				// The start position of a Range is guaranteed to never be after the
				// end position. To enforce this restriction, if the start is set to
				// be at a position after the end, the Range is collapsed to that
				// position.
				if (_compareBoundaryPoints(t[START_CONTAINER], t[START_OFFSET], t[END_CONTAINER], t[END_OFFSET]) > 0)
					t.collapse(st);
			} else
				t.collapse(st);

			t.collapsed = _isCollapsed();
			t.commonAncestorContainer = dom.findCommonAncestor(t[START_CONTAINER], t[END_CONTAINER]);
		};

		function _traverse(how) {
			var c, endContainerDepth = 0, startContainerDepth = 0, p, depthDiff, startNode, endNode, sp, ep;

			if (t[START_CONTAINER] == t[END_CONTAINER])
				return _traverseSameContainer(how);

			for (c = t[END_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[START_CONTAINER])
					return _traverseCommonStartContainer(c, how);

				++endContainerDepth;
			}

			for (c = t[START_CONTAINER], p = c.parentNode; p; c = p, p = p.parentNode) {
				if (p == t[END_CONTAINER])
					return _traverseCommonEndContainer(c, how);

				++startContainerDepth;
			}

			depthDiff = startContainerDepth - endContainerDepth;

			startNode = t[START_CONTAINER];
			while (depthDiff > 0) {
				startNode = startNode.parentNode;
				depthDiff--;
			}

			endNode = t[END_CONTAINER];
			while (depthDiff < 0) {
				endNode = endNode.parentNode;
				depthDiff++;
			}

			// ascend the ancestor hierarchy until we have a common parent.
			for (sp = startNode.parentNode, ep = endNode.parentNode; sp != ep; sp = sp.parentNode, ep = ep.parentNode) {
				startNode = sp;
				endNode = ep;
			}

			return _traverseCommonAncestors(startNode, endNode, how);
		};

		 function _traverseSameContainer(how) {
			var frag, s, sub, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			// If selection is empty, just return the fragment
			if (t[START_OFFSET] == t[END_OFFSET])
				return frag;

			// Text node needs special case handling
			if (t[START_CONTAINER].nodeType == 3 /* TEXT_NODE */) {
				// get the substring
				s = t[START_CONTAINER].nodeValue;
				sub = s.substring(t[START_OFFSET], t[END_OFFSET]);

				// set the original text node to its new value
				if (how != CLONE) {
					t[START_CONTAINER].deleteData(t[START_OFFSET], t[END_OFFSET] - t[START_OFFSET]);

					// Nothing is partially selected, so collapse to start point
					t.collapse(TRUE);
				}

				if (how == DELETE)
					return;

				frag.appendChild(doc.createTextNode(sub));
				return frag;
			}

			// Copy nodes between the start/end offsets.
			n = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]);
			cnt = t[END_OFFSET] - t[START_OFFSET];

			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.appendChild( xferNode );

				--cnt;
				n = sibling;
			}

			// Nothing is partially selected, so collapse to start point
			if (how != CLONE)
				t.collapse(TRUE);

			return frag;
		};

		function _traverseCommonStartContainer(endAncestor, how) {
			var frag, n, endIdx, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			endIdx = nodeIndex(endAncestor);
			cnt = endIdx - t[START_OFFSET];

			if (cnt <= 0) {
				// Collapse to just before the endAncestor, which
				// is partially selected.
				if (how != CLONE) {
					t.setEndBefore(endAncestor);
					t.collapse(FALSE);
				}

				return frag;
			}

			n = endAncestor.previousSibling;
			while (cnt > 0) {
				sibling = n.previousSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.insertBefore(xferNode, frag.firstChild);

				--cnt;
				n = sibling;
			}

			// Collapse to just before the endAncestor, which
			// is partially selected.
			if (how != CLONE) {
				t.setEndBefore(endAncestor);
				t.collapse(FALSE);
			}

			return frag;
		};

		function _traverseCommonEndContainer(startAncestor, how) {
			var frag, startIdx, n, cnt, sibling, xferNode;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			startIdx = nodeIndex(startAncestor);
			++startIdx;  // Because we already traversed it....

			cnt = t[END_OFFSET] - startIdx;
			n = startAncestor.nextSibling;
			while (cnt > 0) {
				sibling = n.nextSibling;
				xferNode = _traverseFullySelected(n, how);

				if (frag)
					frag.appendChild(xferNode);

				--cnt;
				n = sibling;
			}

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		};

		function _traverseCommonAncestors(startAncestor, endAncestor, how) {
			var n, frag, commonParent, startOffset, endOffset, cnt, sibling, nextSibling;

			if (how != DELETE)
				frag = doc.createDocumentFragment();

			n = _traverseLeftBoundary(startAncestor, how);
			if (frag)
				frag.appendChild(n);

			commonParent = startAncestor.parentNode;
			startOffset = nodeIndex(startAncestor);
			endOffset = nodeIndex(endAncestor);
			++startOffset;

			cnt = endOffset - startOffset;
			sibling = startAncestor.nextSibling;

			while (cnt > 0) {
				nextSibling = sibling.nextSibling;
				n = _traverseFullySelected(sibling, how);

				if (frag)
					frag.appendChild(n);

				sibling = nextSibling;
				--cnt;
			}

			n = _traverseRightBoundary(endAncestor, how);

			if (frag)
				frag.appendChild(n);

			if (how != CLONE) {
				t.setStartAfter(startAncestor);
				t.collapse(TRUE);
			}

			return frag;
		};

		function _traverseRightBoundary(root, how) {
			var next = _getSelectedNode(t[END_CONTAINER], t[END_OFFSET] - 1), parent, clonedParent, prevSibling, clonedChild, clonedGrandParent, isFullySelected = next != t[END_CONTAINER];

			if (next == root)
				return _traverseNode(next, isFullySelected, FALSE, how);

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, FALSE, how);

			while (parent) {
				while (next) {
					prevSibling = next.previousSibling;
					clonedChild = _traverseNode(next, isFullySelected, FALSE, how);

					if (how != DELETE)
						clonedParent.insertBefore(clonedChild, clonedParent.firstChild);

					isFullySelected = TRUE;
					next = prevSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.previousSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, FALSE, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}
		};

		function _traverseLeftBoundary(root, how) {
			var next = _getSelectedNode(t[START_CONTAINER], t[START_OFFSET]), isFullySelected = next != t[START_CONTAINER], parent, clonedParent, nextSibling, clonedChild, clonedGrandParent;

			if (next == root)
				return _traverseNode(next, isFullySelected, TRUE, how);

			parent = next.parentNode;
			clonedParent = _traverseNode(parent, FALSE, TRUE, how);

			while (parent) {
				while (next) {
					nextSibling = next.nextSibling;
					clonedChild = _traverseNode(next, isFullySelected, TRUE, how);

					if (how != DELETE)
						clonedParent.appendChild(clonedChild);

					isFullySelected = TRUE;
					next = nextSibling;
				}

				if (parent == root)
					return clonedParent;

				next = parent.nextSibling;
				parent = parent.parentNode;

				clonedGrandParent = _traverseNode(parent, FALSE, TRUE, how);

				if (how != DELETE)
					clonedGrandParent.appendChild(clonedParent);

				clonedParent = clonedGrandParent;
			}
		};

		function _traverseNode(n, isFullySelected, isLeft, how) {
			var txtValue, newNodeValue, oldNodeValue, offset, newNode;

			if (isFullySelected)
				return _traverseFullySelected(n, how);

			if (n.nodeType == 3 /* TEXT_NODE */) {
				txtValue = n.nodeValue;

				if (isLeft) {
					offset = t[START_OFFSET];
					newNodeValue = txtValue.substring(offset);
					oldNodeValue = txtValue.substring(0, offset);
				} else {
					offset = t[END_OFFSET];
					newNodeValue = txtValue.substring(0, offset);
					oldNodeValue = txtValue.substring(offset);
				}

				if (how != CLONE)
					n.nodeValue = oldNodeValue;

				if (how == DELETE)
					return;

				newNode = n.cloneNode(FALSE);
				newNode.nodeValue = newNodeValue;

				return newNode;
			}

			if (how == DELETE)
				return;

			return n.cloneNode(FALSE);
		};

		function _traverseFullySelected(n, how) {
			if (how != DELETE)
				return how == CLONE ? n.cloneNode(TRUE) : n;

			n.parentNode.removeChild(n);
		};
	};

	ns.Range = Range;
})(tinymce.dom);

(function() {
	function Selection(selection) {
		var t = this, invisibleChar = '\uFEFF', range, lastIERng, dom = selection.dom, TRUE = true, FALSE = false;

		// Returns a W3C DOM compatible range object by using the IE Range API
		function getRange() {
			var ieRange = selection.getRng(), domRange = dom.createRng(), element, collapsed;

			// If selection is outside the current document just return an empty range
			element = ieRange.item ? ieRange.item(0) : ieRange.parentElement();
			if (element.ownerDocument != dom.doc)
				return domRange;

			// Handle control selection or text selection of a image
			if (ieRange.item || !element.hasChildNodes()) {
				domRange.setStart(element.parentNode, dom.nodeIndex(element));
				domRange.setEnd(domRange.startContainer, domRange.startOffset + 1);

				return domRange;
			}

			collapsed = selection.isCollapsed();

			function findEndPoint(start) {
				var marker, container, offset, nodes, startIndex = 0, endIndex, index, parent, checkRng, position;

				// Setup temp range and collapse it
				checkRng = ieRange.duplicate();
				checkRng.collapse(start);

				// Create marker and insert it at the end of the endpoints parent
				marker = dom.create('a');
				parent = checkRng.parentElement();

				// If parent doesn't have any children then set the container to that parent and the index to 0
				if (!parent.hasChildNodes()) {
					domRange[start ? 'setStart' : 'setEnd'](parent, 0);
					return;
				}

				parent.appendChild(marker);
				checkRng.moveToElementText(marker);
				position = ieRange.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', checkRng);
				if (position > 0) {
					// The position is after the end of the parent element.
					// This is the case where IE puts the caret to the left edge of a table.
					domRange[start ? 'setStartAfter' : 'setEndAfter'](parent);
					dom.remove(marker);
					return;
				}

				// Setup node list and endIndex
				nodes = tinymce.grep(parent.childNodes);
				endIndex = nodes.length - 1;
				// Perform a binary search for the position
				while (startIndex <= endIndex) {
					index = Math.floor((startIndex + endIndex) / 2);

					// Insert marker and check it's position relative to the selection
					parent.insertBefore(marker, nodes[index]);
					checkRng.moveToElementText(marker);
					position = ieRange.compareEndPoints(start ? 'StartToStart' : 'EndToEnd', checkRng);
					if (position > 0) {
						// Marker is to the right
						startIndex = index + 1;
					} else if (position < 0) {
						// Marker is to the left
						endIndex = index - 1;
					} else {
						// Maker is where we are
						found = true;
						break;
					}
				}

				// Setup container
				container = position > 0 || index == 0 ? marker.nextSibling : marker.previousSibling;

				// Handle element selection
				if (container.nodeType == 1) {
					dom.remove(marker);

					// Find offset and container
					offset = dom.nodeIndex(container);
					container = container.parentNode;

					// Move the offset if we are setting the end or the position is after an element
					if (!start || index > 0)
						offset++;
				} else {
					// Calculate offset within text node
					if (position > 0 || index == 0) {
						checkRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', ieRange);
						offset = checkRng.text.length;
					} else {
						checkRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', ieRange);
						offset = container.nodeValue.length - checkRng.text.length;
					}

					dom.remove(marker);
				}

				domRange[start ? 'setStart' : 'setEnd'](container, offset);
			};

			// Find start point
			findEndPoint(true);

			// Find end point if needed
			if (!collapsed)
				findEndPoint();

			return domRange;
		};

		this.addRange = function(rng) {
			var ieRng, ctrlRng, startContainer, startOffset, endContainer, endOffset, doc = selection.dom.doc, body = doc.body;

			function setEndPoint(start) {
				var container, offset, marker, tmpRng, nodes;

				marker = dom.create('a');
				container = start ? startContainer : endContainer;
				offset = start ? startOffset : endOffset;
				tmpRng = ieRng.duplicate();

				if (container == doc) {
					container = body;
					offset = 0;
				}

				if (container.nodeType == 3) {
					container.parentNode.insertBefore(marker, container);
					tmpRng.moveToElementText(marker);
					tmpRng.moveStart('character', offset);
					dom.remove(marker);
					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
				} else {
					nodes = container.childNodes;

					if (nodes.length) {
						if (offset >= nodes.length) {
							dom.insertAfter(marker, nodes[nodes.length - 1]);
						} else {
							container.insertBefore(marker, nodes[offset]);
						}

						tmpRng.moveToElementText(marker);
					} else {
						// Empty node selection for example <div>|</div>
						marker = doc.createTextNode(invisibleChar);
						container.appendChild(marker);
						tmpRng.moveToElementText(marker.parentNode);
						tmpRng.collapse(TRUE);
					}

					ieRng.setEndPoint(start ? 'StartToStart' : 'EndToEnd', tmpRng);
					dom.remove(marker);
				}
			}

			// Destroy cached range
			this.destroy();

			// Setup some shorter versions
			startContainer = rng.startContainer;
			startOffset = rng.startOffset;
			endContainer = rng.endContainer;
			endOffset = rng.endOffset;
			ieRng = body.createTextRange();

			// If single element selection then try making a control selection out of it
			if (startContainer == endContainer && startContainer.nodeType == 1 && startOffset == endOffset - 1) {
				if (startOffset == endOffset - 1) {
					try {
						ctrlRng = body.createControlRange();
						ctrlRng.addElement(startContainer.childNodes[startOffset]);
						ctrlRng.select();
						ctrlRng.scrollIntoView();
						return;
					} catch (ex) {
						// Ignore
					}
				}
			}

			// Set start/end point of selection
			setEndPoint(true);
			setEndPoint();

			// Select the new range and scroll it into view
			ieRng.select();
			ieRng.scrollIntoView();
		};

		this.getRangeAt = function() {
			// Setup new range if the cache is empty
			if (!range || !tinymce.dom.RangeUtils.compareRanges(lastIERng, selection.getRng())) {
				range = getRange();

				// Store away text range for next call
				lastIERng = selection.getRng();
			}

			// IE will say that the range is equal then produce an invalid argument exception
			// if you perform specific operations in a keyup event. For example Ctrl+Del.
			// This hack will invalidate the range cache if the exception occurs
			try {
				range.startContainer.nextSibling;
			} catch (ex) {
				range = getRange();
				lastIERng = null;
			}

			// Return cached range
			return range;
		};

		this.destroy = function() {
			// Destroy cached range and last IE range to avoid memory leaks
			lastIERng = range = null;
		};

		// IE has an issue where you can't select/move the caret by clicking outside the body if the document is in standards mode
		if (selection.dom.boxModel) {
			(function() {
				var doc = dom.doc, body = doc.body, started, startRng;

				// Make HTML element unselectable since we are going to handle selection by hand
				doc.documentElement.unselectable = TRUE;

				// Return range from point or null if it failed
				function rngFromPoint(x, y) {
					var rng = body.createTextRange();

					try {
						rng.moveToPoint(x, y);
					} catch (ex) {
						// IE sometimes throws and exception, so lets just ignore it
						rng = null;
					}

					return rng;
				};

				// Fires while the selection is changing
				function selectionChange(e) {
					var pointRng;

					// Check if the button is down or not
					if (e.button) {
						// Create range from mouse position
						pointRng = rngFromPoint(e.x, e.y);

						if (pointRng) {
							// Check if pointRange is before/after selection then change the endPoint
							if (pointRng.compareEndPoints('StartToStart', startRng) > 0)
								pointRng.setEndPoint('StartToStart', startRng);
							else
								pointRng.setEndPoint('EndToEnd', startRng);

							pointRng.select();
						}
					} else
						endSelection();
				}

				// Removes listeners
				function endSelection() {
					dom.unbind(doc, 'mouseup', endSelection);
					dom.unbind(doc, 'mousemove', selectionChange);
					started = 0;
				};

				// Detect when user selects outside BODY
				dom.bind(doc, 'mousedown', function(e) {
					if (e.target.nodeName === 'HTML') {
						if (started)
							endSelection();

						started = 1;

						// Setup start position
						startRng = rngFromPoint(e.x, e.y);
						if (startRng) {
							// Listen for selection change events
							dom.bind(doc, 'mouseup', endSelection);
							dom.bind(doc, 'mousemove', selectionChange);

							startRng.select();
						}
					}
				});
			})();
		}
	};

	// Expose the selection object
	tinymce.dom.TridentSelection = Selection;
})();


(function(tinymce) {
	// Shorten names
	var each = tinymce.each, DOM = tinymce.DOM, isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, Event;

	tinymce.create('tinymce.dom.EventUtils', {
		EventUtils : function() {
			this.inits = [];
			this.events = [];
		},

		add : function(o, n, f, s) {
			var cb, t = this, el = t.events, r;

			if (n instanceof Array) {
				r = [];

				each(n, function(n) {
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.add(o, n, f, s));
				});

				return r;
			}

			o = DOM.get(o);

			if (!o)
				return;

			// Setup event callback
			cb = function(e) {
				// Is all events disabled
				if (t.disabled)
					return;

				e = e || window.event;

				// Patch in target, preventDefault and stopPropagation in IE it's W3C valid
				if (e && isIE) {
					if (!e.target)
						e.target = e.srcElement;

					// Patch in preventDefault, stopPropagation methods for W3C compatibility
					tinymce.extend(e, t._stoppers);
				}

				if (!s)
					return f(e);

				return f.call(s, e);
			};

			if (n == 'unload') {
				tinymce.unloads.unshift({func : cb});
				return cb;
			}

			if (n == 'init') {
				if (t.domLoaded)
					cb();
				else
					t.inits.push(cb);

				return cb;
			}

			// Store away listener reference
			el.push({
				obj : o,
				name : n,
				func : f,
				cfunc : cb,
				scope : s
			});

			t._add(o, n, cb);

			return f;
		},

		remove : function(o, n, f) {
			var t = this, a = t.events, s = false, r;

			// Handle array
			if (o && o.hasOwnProperty && o instanceof Array) {
				r = [];

				each(o, function(o) {
					o = DOM.get(o);
					r.push(t.remove(o, n, f));
				});

				return r;
			}

			o = DOM.get(o);

			each(a, function(e, i) {
				if (e.obj == o && e.name == n && (!f || (e.func == f || e.cfunc == f))) {
					a.splice(i, 1);
					t._remove(o, n, e.cfunc);
					s = true;
					return false;
				}
			});

			return s;
		},

		clear : function(o) {
			var t = this, a = t.events, i, e;

			if (o) {
				o = DOM.get(o);

				for (i = a.length - 1; i >= 0; i--) {
					e = a[i];

					if (e.obj === o) {
						t._remove(e.obj, e.name, e.cfunc);
						e.obj = e.cfunc = null;
						a.splice(i, 1);
					}
				}
			}
		},

		cancel : function(e) {
			if (!e)
				return false;

			this.stop(e);

			return this.prevent(e);
		},

		stop : function(e) {
			if (e.stopPropagation)
				e.stopPropagation();
			else
				e.cancelBubble = true;

			return false;
		},

		prevent : function(e) {
			if (e.preventDefault)
				e.preventDefault();
			else
				e.returnValue = false;

			return false;
		},

		destroy : function() {
			var t = this;

			each(t.events, function(e, i) {
				t._remove(e.obj, e.name, e.cfunc);
				e.obj = e.cfunc = null;
			});

			t.events = [];
			t = null;
		},

		_add : function(o, n, f) {
			if (o.attachEvent)
				o.attachEvent('on' + n, f);
			else if (o.addEventListener)
				o.addEventListener(n, f, false);
			else
				o['on' + n] = f;
		},

		_remove : function(o, n, f) {
			if (o) {
				try {
					if (o.detachEvent)
						o.detachEvent('on' + n, f);
					else if (o.removeEventListener)
						o.removeEventListener(n, f, false);
					else
						o['on' + n] = null;
				} catch (ex) {
					// Might fail with permission denined on IE so we just ignore that
				}
			}
		},

		_pageInit : function(win) {
			var t = this;

			// Keep it from running more than once
			if (t.domLoaded)
				return;

			t.domLoaded = true;

			each(t.inits, function(c) {
				c();
			});

			t.inits = [];
		},

		_wait : function(win) {
			var t = this, doc = win.document;

			// No need since the document is already loaded
			if (win.tinyMCE_GZ && tinyMCE_GZ.loaded) {
				t.domLoaded = 1;
				return;
			}

			// Use IE method
			if (doc.attachEvent) {
				doc.attachEvent("onreadystatechange", function() {
					if (doc.readyState === "complete") {
						doc.detachEvent("onreadystatechange", arguments.callee);
						t._pageInit(win);
					}
				});

				if (doc.documentElement.doScroll && win == win.top) {
					(function() {
						if (t.domLoaded)
							return;

						try {
							// If IE is used, use the trick by Diego Perini
							// http://javascript.nwbox.com/IEContentLoaded/
							doc.documentElement.doScroll("left");
						} catch (ex) {
							setTimeout(arguments.callee, 0);
							return;
						}

						t._pageInit(win);
					})();
				}
			} else if (doc.addEventListener) {
				t._add(win, 'DOMContentLoaded', function() {
					t._pageInit(win);
				});
			}

			t._add(win, 'load', function() {
				t._pageInit(win);
			});
		},

		_stoppers : {
			preventDefault :  function() {
				this.returnValue = false;
			},

			stopPropagation : function() {
				this.cancelBubble = true;
			}
		}
	});

	Event = tinymce.dom.Event = new tinymce.dom.EventUtils();

	// Dispatch DOM content loaded event for IE and Safari
	Event._wait(window);

	tinymce.addUnload(function() {
		Event.destroy();
	});
})(tinymce);

(function(tinymce) {
	tinymce.dom.Element = function(id, settings) {
		var t = this, dom, el;

		t.settings = settings = settings || {};
		t.id = id;
		t.dom = dom = settings.dom || tinymce.DOM;

		// Only IE leaks DOM references, this is a lot faster
		if (!tinymce.isIE)
			el = dom.get(t.id);

		tinymce.each(
				('getPos,getRect,getParent,add,setStyle,getStyle,setStyles,' + 
				'setAttrib,setAttribs,getAttrib,addClass,removeClass,' + 
				'hasClass,getOuterHTML,setOuterHTML,remove,show,hide,' + 
				'isHidden,setHTML,get').split(/,/)
			, function(k) {
				t[k] = function() {
					var a = [id], i;

					for (i = 0; i < arguments.length; i++)
						a.push(arguments[i]);

					a = dom[k].apply(dom, a);
					t.update(k);

					return a;
				};
		});

		tinymce.extend(t, {
			on : function(n, f, s) {
				return tinymce.dom.Event.add(t.id, n, f, s);
			},

			getXY : function() {
				return {
					x : parseInt(t.getStyle('left')),
					y : parseInt(t.getStyle('top'))
				};
			},

			getSize : function() {
				var n = dom.get(t.id);

				return {
					w : parseInt(t.getStyle('width') || n.clientWidth),
					h : parseInt(t.getStyle('height') || n.clientHeight)
				};
			},

			moveTo : function(x, y) {
				t.setStyles({left : x, top : y});
			},

			moveBy : function(x, y) {
				var p = t.getXY();

				t.moveTo(p.x + x, p.y + y);
			},

			resizeTo : function(w, h) {
				t.setStyles({width : w, height : h});
			},

			resizeBy : function(w, h) {
				var s = t.getSize();

				t.resizeTo(s.w + w, s.h + h);
			},

			update : function(k) {
				var b;

				if (tinymce.isIE6 && settings.blocker) {
					k = k || '';

					// Ignore getters
					if (k.indexOf('get') === 0 || k.indexOf('has') === 0 || k.indexOf('is') === 0)
						return;

					// Remove blocker on remove
					if (k == 'remove') {
						dom.remove(t.blocker);
						return;
					}

					if (!t.blocker) {
						t.blocker = dom.uniqueId();
						b = dom.add(settings.container || dom.getRoot(), 'iframe', {id : t.blocker, style : 'position:absolute;', frameBorder : 0, src : 'javascript:""'});
						dom.setStyle(b, 'opacity', 0);
					} else
						b = dom.get(t.blocker);

					dom.setStyles(b, {
						left : t.getStyle('left', 1),
						top : t.getStyle('top', 1),
						width : t.getStyle('width', 1),
						height : t.getStyle('height', 1),
						display : t.getStyle('display', 1),
						zIndex : parseInt(t.getStyle('zIndex', 1) || 0) - 1
					});
				}
			}
		});
	};
})(tinymce);

(function(tinymce) {
	function trimNl(s) {
		return s.replace(/[\n\r]+/g, '');
	};

	// Shorten names
	var is = tinymce.is, isIE = tinymce.isIE, each = tinymce.each;

	tinymce.create('tinymce.dom.Selection', {
		Selection : function(dom, win, serializer) {
			var t = this;

			t.dom = dom;
			t.win = win;
			t.serializer = serializer;

			// Add events
			each([
				'onBeforeSetContent',
				'onBeforeGetContent',
				'onSetContent',
				'onGetContent'
			], function(e) {
				t[e] = new tinymce.util.Dispatcher(t);
			});

			// No W3C Range support
			if (!t.win.getSelection)
				t.tridentSel = new tinymce.dom.TridentSelection(t);

			// Prevent leaks
			tinymce.addUnload(t.destroy, t);
		},

		getContent : function(s) {
			var t = this, r = t.getRng(), e = t.dom.create("body"), se = t.getSel(), wb, wa, n;

			s = s || {};
			wb = wa = '';
			s.get = true;
			s.format = s.format || 'html';
			t.onBeforeGetContent.dispatch(t, s);

			if (s.format == 'text')
				return t.isCollapsed() ? '' : (r.text || (se.toString ? se.toString() : ''));

			if (r.cloneContents) {
				n = r.cloneContents();

				if (n)
					e.appendChild(n);
			} else if (is(r.item) || is(r.htmlText))
				e.innerHTML = r.item ? r.item(0).outerHTML : r.htmlText;
			else
				e.innerHTML = r.toString();

			// Keep whitespace before and after
			if (/^\s/.test(e.innerHTML))
				wb = ' ';

			if (/\s+$/.test(e.innerHTML))
				wa = ' ';

			s.getInner = true;

			s.content = t.isCollapsed() ? '' : wb + t.serializer.serialize(e, s) + wa;
			t.onGetContent.dispatch(t, s);

			return s.content;
		},

		setContent : function(h, s) {
			var t = this, r = t.getRng(), c, d = t.win.document;

			s = s || {format : 'html'};
			s.set = true;
			h = s.content = t.dom.processHTML(h);

			// Dispatch before set content event
			t.onBeforeSetContent.dispatch(t, s);
			h = s.content;

			if (r.insertNode) {
				// Make caret marker since insertNode places the caret in the beginning of text after insert
				h += '<span id="__caret">_</span>';

				// Delete and insert new node
				
				if (r.startContainer == d && r.endContainer ==  d) {
					// WebKit will fail if the body is empty since the range is then invalid and it can't insert contents
					d.body.innerHTML = h;
				} else {
					r.deleteContents();
					if (d.body.childNodes.length == 0) {
						d.body.innerHTML = h;
					} else {
						r.insertNode(r.createContextualFragment(h));
					}
				}

				// Move to caret marker
				c = t.dom.get('__caret');
				// Make sure we wrap it compleatly, Opera fails with a simple select call
				r = d.createRange();
				r.setStartBefore(c);
				r.setEndBefore(c);
				t.setRng(r);

				// Remove the caret position
				t.dom.remove('__caret');
			} else {
				if (r.item) {
					// Delete content and get caret text selection
					d.execCommand('Delete', false, null);
					r = t.getRng();
				}

				r.pasteHTML(h);
			}

			// Dispatch set content event
			t.onSetContent.dispatch(t, s);
		},

		getStart : function() {
			var rng = this.getRng(), startElement, parentElement, checkRng, node;

			if (rng.duplicate || rng.item) {
				// Control selection, return first item
				if (rng.item)
					return rng.item(0);

				// Get start element
				checkRng = rng.duplicate();
				checkRng.collapse(1);
				startElement = checkRng.parentElement();

				// Check if range parent is inside the start element, then return the inner parent element
				// This will fix issues when a single element is selected, IE would otherwise return the wrong start element
				parentElement = node = rng.parentElement();
				while (node = node.parentNode) {
					if (node == startElement) {
						startElement = parentElement;
						break;
					}
				}

				// If start element is body element try to move to the first child if it exists
				if (startElement && startElement.nodeName == 'BODY')
					return startElement.firstChild || startElement;

				return startElement;
			} else {
				startElement = rng.startContainer;

				if (startElement.nodeType == 1 && startElement.hasChildNodes())
					startElement = startElement.childNodes[Math.min(startElement.childNodes.length - 1, rng.startOffset)];

				if (startElement && startElement.nodeType == 3)
					return startElement.parentNode;

				return startElement;
			}
		},

		getEnd : function() {
			var t = this, r = t.getRng(), e, eo;

			if (r.duplicate || r.item) {
				if (r.item)
					return r.item(0);

				r = r.duplicate();
				r.collapse(0);
				e = r.parentElement();

				if (e && e.nodeName == 'BODY')
					return e.lastChild || e;

				return e;
			} else {
				e = r.endContainer;
				eo = r.endOffset;

				if (e.nodeType == 1 && e.hasChildNodes())
					e = e.childNodes[eo > 0 ? eo - 1 : eo];

				if (e && e.nodeType == 3)
					return e.parentNode;

				return e;
			}
		},

		getBookmark : function(type, normalized) {
			var t = this, dom = t.dom, rng, rng2, id, collapsed, name, element, index, chr = '\uFEFF', styles;

			function findIndex(name, element) {
				var index = 0;

				each(dom.select(name), function(node, i) {
					if (node == element)
						index = i;
				});

				return index;
			};

			if (type == 2) {
				function getLocation() {
					var rng = t.getRng(true), root = dom.getRoot(), bookmark = {};

					function getPoint(rng, start) {
						var container = rng[start ? 'startContainer' : 'endContainer'],
							offset = rng[start ? 'startOffset' : 'endOffset'], point = [], node, childNodes, after = 0;

						if (container.nodeType == 3) {
							if (normalized) {
								for (node = container.previousSibling; node && node.nodeType == 3; node = node.previousSibling)
									offset += node.nodeValue.length;
							}

							point.push(offset);
						} else {
							childNodes = container.childNodes;

							if (offset >= childNodes.length && childNodes.length) {
								after = 1;
								offset = Math.max(0, childNodes.length - 1);
							}

							point.push(t.dom.nodeIndex(childNodes[offset], normalized) + after);
						}

						for (; container && container != root; container = container.parentNode)
							point.push(t.dom.nodeIndex(container, normalized));

						return point;
					};

					bookmark.start = getPoint(rng, true);

					if (!t.isCollapsed())
						bookmark.end = getPoint(rng);

					return bookmark;
				};

				return getLocation();
			}

			// Handle simple range
			if (type)
				return {rng : t.getRng()};

			rng = t.getRng();
			id = dom.uniqueId();
			collapsed = tinyMCE.activeEditor.selection.isCollapsed();
			styles = 'overflow:hidden;line-height:0px';

			// Explorer method
			if (rng.duplicate || rng.item) {
				// Text selection
				if (!rng.item) {
					rng2 = rng.duplicate();

					// Insert start marker
					rng.collapse();
					rng.pasteHTML('<span _mce_type="bookmark" id="' + id + '_start" style="' + styles + '">' + chr + '</span>');

					// Insert end marker
					if (!collapsed) {
						rng2.collapse(false);
						rng2.pasteHTML('<span _mce_type="bookmark" id="' + id + '_end" style="' + styles + '">' + chr + '</span>');
					}
				} else {
					// Control selection
					element = rng.item(0);
					name = element.nodeName;

					return {name : name, index : findIndex(name, element)};
				}
			} else {
				element = t.getNode();
				name = element.nodeName;
				if (name == 'IMG')
					return {name : name, index : findIndex(name, element)};

				// W3C method
				rng2 = rng.cloneRange();

				// Insert end marker
				if (!collapsed) {
					rng2.collapse(false);
					rng2.insertNode(dom.create('span', {_mce_type : "bookmark", id : id + '_end', style : styles}, chr));
				}

				rng.collapse(true);
				rng.insertNode(dom.create('span', {_mce_type : "bookmark", id : id + '_start', style : styles}, chr));
			}

			t.moveToBookmark({id : id, keep : 1});

			return {id : id};
		},

		moveToBookmark : function(bookmark) {
			var t = this, dom = t.dom, marker1, marker2, rng, root, startContainer, endContainer, startOffset, endOffset;

			// Clear selection cache
			if (t.tridentSel)
				t.tridentSel.destroy();

			if (bookmark) {
				if (bookmark.start) {
					rng = dom.createRng();
					root = dom.getRoot();

					function setEndPoint(start) {
						var point = bookmark[start ? 'start' : 'end'], i, node, offset, children;

						if (point) {
							// Find container node
							for (node = root, i = point.length - 1; i >= 1; i--) {
								children = node.childNodes;

								if (children.length)
									node = children[point[i]];
							}

							// Set offset within container node
							if (start)
								rng.setStart(node, point[0]);
							else
								rng.setEnd(node, point[0]);
						}
					};

					setEndPoint(true);
					setEndPoint();

					t.setRng(rng);
				} else if (bookmark.id) {
					function restoreEndPoint(suffix) {
						var marker = dom.get(bookmark.id + '_' + suffix), node, idx, next, prev, keep = bookmark.keep;

						if (marker) {
							node = marker.parentNode;

							if (suffix == 'start') {
								if (!keep) {
									idx = dom.nodeIndex(marker);
								} else {
									node = marker.firstChild;
									idx = 1;
								}

								startContainer = endContainer = node;
								startOffset = endOffset = idx;
							} else {
								if (!keep) {
									idx = dom.nodeIndex(marker);
								} else {
									node = marker.firstChild;
									idx = 1;
								}

								endContainer = node;
								endOffset = idx;
							}

							if (!keep) {
								prev = marker.previousSibling;
								next = marker.nextSibling;

								// Remove all marker text nodes
								each(tinymce.grep(marker.childNodes), function(node) {
									if (node.nodeType == 3)
										node.nodeValue = node.nodeValue.replace(/\uFEFF/g, '');
								});

								// Remove marker but keep children if for example contents where inserted into the marker
								// Also remove duplicated instances of the marker for example by a split operation or by WebKit auto split on paste feature
								while (marker = dom.get(bookmark.id + '_' + suffix))
									dom.remove(marker, 1);

								// If siblings are text nodes then merge them
								if (prev && next && prev.nodeType == next.nodeType && prev.nodeType == 3) {
									idx = prev.nodeValue.length;
									prev.appendData(next.nodeValue);
									dom.remove(next);

									if (suffix == 'start') {
										startContainer = endContainer = prev;
										startOffset = endOffset = idx;
									} else {
										endContainer = prev;
										endOffset = idx;
									}
								}
							}
						}
					};

					function addBogus(node) {
						// Adds a bogus BR element for empty block elements
						// on non IE browsers just to have a place to put the caret
						if (!isIE && dom.isBlock(node) && !node.innerHTML)
							node.innerHTML = '<br _mce_bogus="1" />';

						return node;
					};

					// Restore start/end points
					restoreEndPoint('start');
					restoreEndPoint('end');

					if (startContainer) {
						rng = dom.createRng();
						rng.setStart(addBogus(startContainer), startOffset);
						rng.setEnd(addBogus(endContainer), endOffset);
						t.setRng(rng);
					}
				} else if (bookmark.name) {
					t.select(dom.select(bookmark.name)[bookmark.index]);
				} else if (bookmark.rng)
					t.setRng(bookmark.rng);
			}
		},

		select : function(node, content) {
			var t = this, dom = t.dom, rng = dom.createRng(), idx;

			idx = dom.nodeIndex(node);
			rng.setStart(node.parentNode, idx);
			rng.setEnd(node.parentNode, idx + 1);

			// Find first/last text node or BR element
			if (content) {
				function setPoint(node, start) {
					var walker = new tinymce.dom.TreeWalker(node, node);

					do {
						// Text node
						if (node.nodeType == 3 && tinymce.trim(node.nodeValue).length != 0) {
							if (start)
								rng.setStart(node, 0);
							else
								rng.setEnd(node, node.nodeValue.length);

							return;
						}

						// BR element
						if (node.nodeName == 'BR') {
							if (start)
								rng.setStartBefore(node);
							else
								rng.setEndBefore(node);

							return;
						}
					} while (node = (start ? walker.next() : walker.prev()));
				};

				setPoint(node, 1);
				setPoint(node);
			}

			t.setRng(rng);

			return node;
		},

		isCollapsed : function() {
			var t = this, r = t.getRng(), s = t.getSel();

			if (!r || r.item)
				return false;

			if (r.compareEndPoints)
				return r.compareEndPoints('StartToEnd', r) === 0;

			return !s || r.collapsed;
		},

		collapse : function(b) {
			var t = this, r = t.getRng(), n;

			// Control range on IE
			if (r.item) {
				n = r.item(0);
				r = this.win.document.body.createTextRange();
				r.moveToElementText(n);
			}

			r.collapse(!!b);
			t.setRng(r);
		},

		getSel : function() {
			var t = this, w = this.win;

			return w.getSelection ? w.getSelection() : w.document.selection;
		},

		getRng : function(w3c) {
			var t = this, s, r;

			// Found tridentSel object then we need to use that one
			if (w3c && t.tridentSel)
				return t.tridentSel.getRangeAt(0);

			try {
				if (s = t.getSel())
					r = s.rangeCount > 0 ? s.getRangeAt(0) : (s.createRange ? s.createRange() : t.win.document.createRange());
			} catch (ex) {
				// IE throws unspecified error here if TinyMCE is placed in a frame/iframe
			}

			// No range found then create an empty one
			// This can occur when the editor is placed in a hidden container element on Gecko
			// Or on IE when there was an exception
			if (!r)
				r = t.win.document.createRange ? t.win.document.createRange() : t.win.document.body.createTextRange();

			if (t.selectedRange && t.explicitRange) {
				if (r.compareBoundaryPoints(r.START_TO_START, t.selectedRange) === 0 && r.compareBoundaryPoints(r.END_TO_END, t.selectedRange) === 0) {
					// Safari, Opera and Chrome only ever select text which causes the range to change.
					// This lets us use the originally set range if the selection hasn't been changed by the user.
					r = t.explicitRange;
				} else {
					t.selectedRange = null;
					t.explicitRange = null;
				}
			}
			return r;
		},

		setRng : function(r) {
			var s, t = this;
			
			if (!t.tridentSel) {
				s = t.getSel();

				if (s) {
					t.explicitRange = r;
					s.removeAllRanges();
					s.addRange(r);
					t.selectedRange = s.getRangeAt(0);
				}
			} else {
				// Is W3C Range
				if (r.cloneRange) {
					t.tridentSel.addRange(r);
					return;
				}

				// Is IE specific range
				try {
					r.select();
				} catch (ex) {
					// Needed for some odd IE bug #1843306
				}
			}
		},

		setNode : function(n) {
			var t = this;

			t.setContent(t.dom.getOuterHTML(n));

			return n;
		},

		getNode : function() {
			var t = this, rng = t.getRng(), sel = t.getSel(), elm;

			if (rng.setStart) {
				// Range maybe lost after the editor is made visible again
				if (!rng)
					return t.dom.getRoot();

				elm = rng.commonAncestorContainer;

				// Handle selection a image or other control like element such as anchors
				if (!rng.collapsed) {
					if (rng.startContainer == rng.endContainer) {
						if (rng.startOffset - rng.endOffset < 2) {
							if (rng.startContainer.hasChildNodes())
								elm = rng.startContainer.childNodes[rng.startOffset];
						}
					}

					// If the anchor node is a element instead of a text node then return this element
					if (tinymce.isWebKit && sel.anchorNode && sel.anchorNode.nodeType == 1) 
						return sel.anchorNode.childNodes[sel.anchorOffset]; 
				}

				if (elm && elm.nodeType == 3)
					return elm.parentNode;

				return elm;
			}

			return rng.item ? rng.item(0) : rng.parentElement();
		},

		getSelectedBlocks : function(st, en) {
			var t = this, dom = t.dom, sb, eb, n, bl = [];

			sb = dom.getParent(st || t.getStart(), dom.isBlock);
			eb = dom.getParent(en || t.getEnd(), dom.isBlock);

			if (sb)
				bl.push(sb);

			if (sb && eb && sb != eb) {
				n = sb;

				while ((n = n.nextSibling) && n != eb) {
					if (dom.isBlock(n))
						bl.push(n);
				}
			}

			if (eb && sb != eb)
				bl.push(eb);

			return bl;
		},

		destroy : function(s) {
			var t = this;

			t.win = null;

			if (t.tridentSel)
				t.tridentSel.destroy();

			// Manual destroy then remove unload handler
			if (!s)
				tinymce.removeUnload(t.destroy);
		}
	});
})(tinymce);

(function(tinymce) {
	tinymce.create('tinymce.dom.XMLWriter', {
		node : null,

		XMLWriter : function(s) {
			// Get XML document
			function getXML() {
				var i = document.implementation;

				if (!i || !i.createDocument) {
					// Try IE objects
					try {return new ActiveXObject('MSXML2.DOMDocument');} catch (ex) {}
					try {return new ActiveXObject('Microsoft.XmlDom');} catch (ex) {}
				} else
					return i.createDocument('', '', null);
			};

			this.doc = getXML();
			
			// Since Opera and WebKit doesn't escape > into &gt; we need to do it our self to normalize the output for all browsers
			this.valid = tinymce.isOpera || tinymce.isWebKit;

			this.reset();
		},

		reset : function() {
			var t = this, d = t.doc;

			if (d.firstChild)
				d.removeChild(d.firstChild);

			t.node = d.appendChild(d.createElement("html"));
		},

		writeStartElement : function(n) {
			var t = this;

			t.node = t.node.appendChild(t.doc.createElement(n));
		},

		writeAttribute : function(n, v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.setAttribute(n, v);
		},

		writeEndElement : function() {
			this.node = this.node.parentNode;
		},

		writeFullEndElement : function() {
			var t = this, n = t.node;

			n.appendChild(t.doc.createTextNode(""));
			t.node = n.parentNode;
		},

		writeText : function(v) {
			if (this.valid)
				v = v.replace(/>/g, '%MCGT%');

			this.node.appendChild(this.doc.createTextNode(v));
		},

		writeCDATA : function(v) {
			this.node.appendChild(this.doc.createCDATASection(v));
		},

		writeComment : function(v) {
			// Fix for bug #2035694
			if (tinymce.isIE)
				v = v.replace(/^\-|\-$/g, ' ');

			this.node.appendChild(this.doc.createComment(v.replace(/\-\-/g, ' ')));
		},

		getContent : function() {
			var h;

			h = this.doc.xml || new XMLSerializer().serializeToString(this.doc);
			h = h.replace(/<\?[^?]+\?>|<html>|<\/html>|<html\/>|<!DOCTYPE[^>]+>/g, '');
			h = h.replace(/ ?\/>/g, ' />');

			if (this.valid)
				h = h.replace(/\%MCGT%/g, '&gt;');

			return h;
		}
	});
})(tinymce);

(function(tinymce) {
	tinymce.create('tinymce.dom.StringWriter', {
		str : null,
		tags : null,
		count : 0,
		settings : null,
		indent : null,

		StringWriter : function(s) {
			this.settings = tinymce.extend({
				indent_char : ' ',
				indentation : 0
			}, s);

			this.reset();
		},

		reset : function() {
			this.indent = '';
			this.str = "";
			this.tags = [];
			this.count = 0;
		},

		writeStartElement : function(n) {
			this._writeAttributesEnd();
			this.writeRaw('<' + n);
			this.tags.push(n);
			this.inAttr = true;
			this.count++;
			this.elementCount = this.count;
		},

		writeAttribute : function(n, v) {
			var t = this;

			t.writeRaw(" " + t.encode(n) + '="' + t.encode(v) + '"');
		},

		writeEndElement : function() {
			var n;

			if (this.tags.length > 0) {
				n = this.tags.pop();

				if (this._writeAttributesEnd(1))
					this.writeRaw('</' + n + '>');

				if (this.settings.indentation > 0)
					this.writeRaw('\n');
			}
		},

		writeFullEndElement : function() {
			if (this.tags.length > 0) {
				this._writeAttributesEnd();
				this.writeRaw('</' + this.tags.pop() + '>');

				if (this.settings.indentation > 0)
					this.writeRaw('\n');
			}
		},

		writeText : function(v) {
			this._writeAttributesEnd();
			this.writeRaw(this.encode(v));
			this.count++;
		},

		writeCDATA : function(v) {
			this._writeAttributesEnd();
			this.writeRaw('<![CDATA[' + v + ']]>');
			this.count++;
		},

		writeComment : function(v) {
			this._writeAttributesEnd();
			this.writeRaw('<!-- ' + v + '-->');
			this.count++;
		},

		writeRaw : function(v) {
			this.str += v;
		},

		encode : function(s) {
			return s.replace(/[<>&"]/g, function(v) {
				switch (v) {
					case '<':
						return '&lt;';

					case '>':
						return '&gt;';

					case '&':
						return '&amp;';

					case '"':
						return '&quot;';
				}

				return v;
			});
		},

		getContent : function() {
			return this.str;
		},

		_writeAttributesEnd : function(s) {
			if (!this.inAttr)
				return;

			this.inAttr = false;

			if (s && this.elementCount == this.count) {
				this.writeRaw(' />');
				return false;
			}

			this.writeRaw('>');

			return true;
		}
	});
})(tinymce);

(function(tinymce) {
	// Shorten names
	var extend = tinymce.extend, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher, isIE = tinymce.isIE, isGecko = tinymce.isGecko;

	function wildcardToRE(s) {
		return s.replace(/([?+*])/g, '.$1');
	};

	tinymce.create('tinymce.dom.Serializer', {
		Serializer : function(s) {
			var t = this;

			t.key = 0;
			t.onPreProcess = new Dispatcher(t);
			t.onPostProcess = new Dispatcher(t);

			try {
				t.writer = new tinymce.dom.XMLWriter();
			} catch (ex) {
				// IE might throw exception if ActiveX is disabled so we then switch to the slightly slower StringWriter
				t.writer = new tinymce.dom.StringWriter();
			}

			// Default settings
			t.settings = s = extend({
				dom : tinymce.DOM,
				valid_nodes : 0,
				node_filter : 0,
				attr_filter : 0,
				invalid_attrs : /^(_mce_|_moz_|sizset|sizcache)/,
				closed : /^(br|hr|input|meta|img|link|param|area)$/,
				entity_encoding : 'named',
				entities : '160,nbsp,161,iexcl,162,cent,163,pound,164,curren,165,yen,166,brvbar,167,sect,168,uml,169,copy,170,ordf,171,laquo,172,not,173,shy,174,reg,175,macr,176,deg,177,plusmn,178,sup2,179,sup3,180,acute,181,micro,182,para,183,middot,184,cedil,185,sup1,186,ordm,187,raquo,188,frac14,189,frac12,190,frac34,191,iquest,192,Agrave,193,Aacute,194,Acirc,195,Atilde,196,Auml,197,Aring,198,AElig,199,Ccedil,200,Egrave,201,Eacute,202,Ecirc,203,Euml,204,Igrave,205,Iacute,206,Icirc,207,Iuml,208,ETH,209,Ntilde,210,Ograve,211,Oacute,212,Ocirc,213,Otilde,214,Ouml,215,times,216,Oslash,217,Ugrave,218,Uacute,219,Ucirc,220,Uuml,221,Yacute,222,THORN,223,szlig,224,agrave,225,aacute,226,acirc,227,atilde,228,auml,229,aring,230,aelig,231,ccedil,232,egrave,233,eacute,234,ecirc,235,euml,236,igrave,237,iacute,238,icirc,239,iuml,240,eth,241,ntilde,242,ograve,243,oacute,244,ocirc,245,otilde,246,ouml,247,divide,248,oslash,249,ugrave,250,uacute,251,ucirc,252,uuml,253,yacute,254,thorn,255,yuml,402,fnof,913,Alpha,914,Beta,915,Gamma,916,Delta,917,Epsilon,918,Zeta,919,Eta,920,Theta,921,Iota,922,Kappa,923,Lambda,924,Mu,925,Nu,926,Xi,927,Omicron,928,Pi,929,Rho,931,Sigma,932,Tau,933,Upsilon,934,Phi,935,Chi,936,Psi,937,Omega,945,alpha,946,beta,947,gamma,948,delta,949,epsilon,950,zeta,951,eta,952,theta,953,iota,954,kappa,955,lambda,956,mu,957,nu,958,xi,959,omicron,960,pi,961,rho,962,sigmaf,963,sigma,964,tau,965,upsilon,966,phi,967,chi,968,psi,969,omega,977,thetasym,978,upsih,982,piv,8226,bull,8230,hellip,8242,prime,8243,Prime,8254,oline,8260,frasl,8472,weierp,8465,image,8476,real,8482,trade,8501,alefsym,8592,larr,8593,uarr,8594,rarr,8595,darr,8596,harr,8629,crarr,8656,lArr,8657,uArr,8658,rArr,8659,dArr,8660,hArr,8704,forall,8706,part,8707,exist,8709,empty,8711,nabla,8712,isin,8713,notin,8715,ni,8719,prod,8721,sum,8722,minus,8727,lowast,8730,radic,8733,prop,8734,infin,8736,ang,8743,and,8744,or,8745,cap,8746,cup,8747,int,8756,there4,8764,sim,8773,cong,8776,asymp,8800,ne,8801,equiv,8804,le,8805,ge,8834,sub,8835,sup,8836,nsub,8838,sube,8839,supe,8853,oplus,8855,otimes,8869,perp,8901,sdot,8968,lceil,8969,rceil,8970,lfloor,8971,rfloor,9001,lang,9002,rang,9674,loz,9824,spades,9827,clubs,9829,hearts,9830,diams,338,OElig,339,oelig,352,Scaron,353,scaron,376,Yuml,710,circ,732,tilde,8194,ensp,8195,emsp,8201,thinsp,8204,zwnj,8205,zwj,8206,lrm,8207,rlm,8211,ndash,8212,mdash,8216,lsquo,8217,rsquo,8218,sbquo,8220,ldquo,8221,rdquo,8222,bdquo,8224,dagger,8225,Dagger,8240,permil,8249,lsaquo,8250,rsaquo,8364,euro',
				valid_elements : '*[*]',
				extended_valid_elements : 0,
				invalid_elements : 0,
				fix_table_elements : 1,
				fix_list_elements : true,
				fix_content_duplication : true,
				convert_fonts_to_spans : false,
				font_size_classes : 0,
				apply_source_formatting : 0,
				indent_mode : 'simple',
				indent_char : '\t',
				indent_levels : 1,
				remove_linebreaks : 1,
				remove_redundant_brs : 1,
				element_format : 'xhtml'
			}, s);

			t.dom = s.dom;
			t.schema = s.schema;

			// Use raw entities if no entities are defined
			if (s.entity_encoding == 'named' && !s.entities)
				s.entity_encoding = 'raw';

			if (s.remove_redundant_brs) {
				t.onPostProcess.add(function(se, o) {
					// Remove single BR at end of block elements since they get rendered
					o.content = o.content.replace(/(<br \/>\s*)+<\/(p|h[1-6]|div|li)>/gi, function(a, b, c) {
						// Check if it's a single element
						if (/^<br \/>\s*<\//.test(a))
							return '</' + c + '>';

						return a;
					});
				});
			}

			// Remove XHTML element endings i.e. produce crap :) XHTML is better
			if (s.element_format == 'html') {
				t.onPostProcess.add(function(se, o) {
					o.content = o.content.replace(/<([^>]+) \/>/g, '<$1>');
				});
			}

			if (s.fix_list_elements) {
				t.onPreProcess.add(function(se, o) {
					var nl, x, a = ['ol', 'ul'], i, n, p, r = /^(OL|UL)$/, np;

					function prevNode(e, n) {
						var a = n.split(','), i;

						while ((e = e.previousSibling) != null) {
							for (i=0; i<a.length; i++) {
								if (e.nodeName == a[i])
									return e;
							}
						}

						return null;
					};

					for (x=0; x<a.length; x++) {
						nl = t.dom.select(a[x], o.node);

						for (i=0; i<nl.length; i++) {
							n = nl[i];
							p = n.parentNode;

							if (r.test(p.nodeName)) {
								np = prevNode(n, 'LI');

								if (!np) {
									np = t.dom.create('li');
									np.innerHTML = '&nbsp;';
									np.appendChild(n);
									p.insertBefore(np, p.firstChild);
								} else
									np.appendChild(n);
							}
						}
					}
				});
			}

			if (s.fix_table_elements) {
				t.onPreProcess.add(function(se, o) {
					// Since Opera will crash if you attach the node to a dynamic document we need to brrowser sniff a specific build
					// so Opera users with an older version will have to live with less compaible output not much we can do here
					if (!tinymce.isOpera || opera.buildNumber() >= 1767) {
						each(t.dom.select('p table', o.node).reverse(), function(n) {
							var parent = t.dom.getParent(n.parentNode, 'table,p');

							if (parent.nodeName != 'TABLE') {
								try {
									t.dom.split(parent, n);
								} catch (ex) {
									// IE can sometimes fire an unknown runtime error so we just ignore it
								}
							}
						});
					}
				});
			}
		},

		setEntities : function(s) {
			var t = this, a, i, l = {}, v;

			// No need to setup more than once
			if (t.entityLookup)
				return;

			// Build regex and lookup array
			a = s.split(',');
			for (i = 0; i < a.length; i += 2) {
				v = a[i];

				// Don't add default &amp; &quot; etc.
				if (v == 34 || v == 38 || v == 60 || v == 62)
					continue;

				l[String.fromCharCode(a[i])] = a[i + 1];

				v = parseInt(a[i]).toString(16);
			}

			t.entityLookup = l;
		},

		setRules : function(s) {
			var t = this;

			t._setup();
			t.rules = {};
			t.wildRules = [];
			t.validElements = {};

			return t.addRules(s);
		},

		addRules : function(s) {
			var t = this, dr;

			if (!s)
				return;

			t._setup();

			each(s.split(','), function(s) {
				var p = s.split(/\[|\]/), tn = p[0].split('/'), ra, at, wat, va = [];

				// Extend with default rules
				if (dr)
					at = tinymce.extend([], dr.attribs);

				// Parse attributes
				if (p.length > 1) {
					each(p[1].split('|'), function(s) {
						var ar = {}, i;

						at = at || [];

						// Parse attribute rule
						s = s.replace(/::/g, '~');
						s = /^([!\-])?([\w*.?~_\-]+|)([=:<])?(.+)?$/.exec(s);
						s[2] = s[2].replace(/~/g, ':');

						// Add required attributes
						if (s[1] == '!') {
							ra = ra || [];
							ra.push(s[2]);
						}

						// Remove inherited attributes
						if (s[1] == '-') {
							for (i = 0; i <at.length; i++) {
								if (at[i].name == s[2]) {
									at.splice(i, 1);
									return;
								}
							}
						}

						switch (s[3]) {
							// Add default attrib values
							case '=':
								ar.defaultVal = s[4] || '';
								break;

							// Add forced attrib values
							case ':':
								ar.forcedVal = s[4];
								break;

							// Add validation values
							case '<':
								ar.validVals = s[4].split('?');
								break;
						}

						if (/[*.?]/.test(s[2])) {
							wat = wat || [];
							ar.nameRE = new RegExp('^' + wildcardToRE(s[2]) + '$');
							wat.push(ar);
						} else {
							ar.name = s[2];
							at.push(ar);
						}

						va.push(s[2]);
					});
				}

				// Handle element names
				each(tn, function(s, i) {
					var pr = s.charAt(0), x = 1, ru = {};

					// Extend with default rule data
					if (dr) {
						if (dr.noEmpty)
							ru.noEmpty = dr.noEmpty;

						if (dr.fullEnd)
							ru.fullEnd = dr.fullEnd;

						if (dr.padd)
							ru.padd = dr.padd;
					}

					// Handle prefixes
					switch (pr) {
						case '-':
							ru.noEmpty = true;
							break;

						case '+':
							ru.fullEnd = true;
							break;

						case '#':
							ru.padd = true;
							break;

						default:
							x = 0;
					}

					tn[i] = s = s.substring(x);
					t.validElements[s] = 1;

					// Add element name or element regex
					if (/[*.?]/.test(tn[0])) {
						ru.nameRE = new RegExp('^' + wildcardToRE(tn[0]) + '$');
						t.wildRules = t.wildRules || {};
						t.wildRules.push(ru);
					} else {
						ru.name = tn[0];

						// Store away default rule
						if (tn[0] == '@')
							dr = ru;

						t.rules[s] = ru;
					}

					ru.attribs = at;

					if (ra)
						ru.requiredAttribs = ra;

					if (wat) {
						// Build valid attributes regexp
						s = '';
						each(va, function(v) {
							if (s)
								s += '|';

							s += '(' + wildcardToRE(v) + ')';
						});
						ru.validAttribsRE = new RegExp('^' + s.toLowerCase() + '$');
						ru.wildAttribs = wat;
					}
				});
			});

			// Build valid elements regexp
			s = '';
			each(t.validElements, function(v, k) {
				if (s)
					s += '|';

				if (k != '@')
					s += k;
			});
			t.validElementsRE = new RegExp('^(' + wildcardToRE(s.toLowerCase()) + ')$');

			//console.debug(t.validElementsRE.toString());
			//console.dir(t.rules);
			//console.dir(t.wildRules);
		},

		findRule : function(n) {
			var t = this, rl = t.rules, i, r;

			t._setup();

			// Exact match
			r = rl[n];
			if (r)
				return r;

			// Try wildcards
			rl = t.wildRules;
			for (i = 0; i < rl.length; i++) {
				if (rl[i].nameRE.test(n))
					return rl[i];
			}

			return null;
		},

		findAttribRule : function(ru, n) {
			var i, wa = ru.wildAttribs;

			for (i = 0; i < wa.length; i++) {
				if (wa[i].nameRE.test(n))
					return wa[i];
			}

			return null;
		},

		serialize : function(n, o) {
			var h, t = this, doc, oldDoc, impl, selected;

			t._setup();
			o = o || {};
			o.format = o.format || 'html';
			t.processObj = o;

			// IE looses the selected attribute on option elements so we need to store it
			// See: http://support.microsoft.com/kb/829907
			if (isIE) {
				selected = [];
				each(n.getElementsByTagName('option'), function(n) {
					var v = t.dom.getAttrib(n, 'selected');

					selected.push(v ? v : null);
				});
			}

			n = n.cloneNode(true);

			// IE looses the selected attribute on option elements so we need to restore it
			if (isIE) {
				each(n.getElementsByTagName('option'), function(n, i) {
					t.dom.setAttrib(n, 'selected', selected[i]);
				});
			}

			// Nodes needs to be attached to something in WebKit/Opera
			// Older builds of Opera crashes if you attach the node to an document created dynamically
			// and since we can't feature detect a crash we need to sniff the acutal build number
			// This fix will make DOM ranges and make Sizzle happy!
			impl = n.ownerDocument.implementation;
			if (impl.createHTMLDocument && (tinymce.isOpera && opera.buildNumber() >= 1767)) {
				// Create an empty HTML document
				doc = impl.createHTMLDocument("");

				// Add the element or it's children if it's a body element to the new document
				each(n.nodeName == 'BODY' ? n.childNodes : [n], function(node) {
					doc.body.appendChild(doc.importNode(node, true));
				});

				// Grab first child or body element for serialization
				if (n.nodeName != 'BODY')
					n = doc.body.firstChild;
				else
					n = doc.body;

				// set the new document in DOMUtils so createElement etc works
				oldDoc = t.dom.doc;
				t.dom.doc = doc;
			}

			t.key = '' + (parseInt(t.key) + 1);

			// Pre process
			if (!o.no_events) {
				o.node = n;
				t.onPreProcess.dispatch(t, o);
			}

			// Serialize HTML DOM into a string
			t.writer.reset();
			t._info = o;
			t._serializeNode(n, o.getInner);

			// Post process
			o.content = t.writer.getContent();

			// Restore the old document if it was changed
			if (oldDoc)
				t.dom.doc = oldDoc;

			if (!o.no_events)
				t.onPostProcess.dispatch(t, o);

			t._postProcess(o);
			o.node = null;

			return tinymce.trim(o.content);
		},

		// Internal functions

		_postProcess : function(o) {
			var t = this, s = t.settings, h = o.content, sc = [], p;

			if (o.format == 'html') {
				// Protect some elements
				p = t._protect({
					content : h,
					patterns : [
						{pattern : /(<script[^>]*>)(.*?)(<\/script>)/g},
						{pattern : /(<noscript[^>]*>)(.*?)(<\/noscript>)/g},
						{pattern : /(<style[^>]*>)(.*?)(<\/style>)/g},
						{pattern : /(<pre[^>]*>)(.*?)(<\/pre>)/g, encode : 1},
						{pattern : /(<!--\[CDATA\[)(.*?)(\]\]-->)/g}
					]
				});

				h = p.content;

				// Entity encode
				if (s.entity_encoding !== 'raw')
					h = t._encode(h);

				// Use BR instead of &nbsp; padded P elements inside editor and use <p>&nbsp;</p> outside editor
/*				if (o.set)
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p><br /></p>');
				else
					h = h.replace(/<p>\s+(&nbsp;|&#160;|\u00a0|<br \/>)\s+<\/p>/g, '<p>$1</p>');*/

				// Since Gecko and Safari keeps whitespace in the DOM we need to
				// remove it inorder to match other browsers. But I think Gecko and Safari is right.
				// This process is only done when getting contents out from the editor.
				if (!o.set) {
					// We need to replace paragraph whitespace with an nbsp before indentation to keep the \u00a0 char
					h = h.replace(/<p>\s+<\/p>|<p([^>]+)>\s+<\/p>/g, s.entity_encoding == 'numeric' ? '<p$1>&#160;</p>' : '<p$1>&nbsp;</p>');

					if (s.remove_linebreaks) {
						h = h.replace(/\r?\n|\r/g, ' ');
						h = h.replace(/(<[^>]+>)\s+/g, '$1 ');
						h = h.replace(/\s+(<\/[^>]+>)/g, ' $1');
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object) ([^>]+)>\s+/g, '<$1 $2>'); // Trim block start
						h = h.replace(/<(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>\s+/g, '<$1>'); // Trim block start
						h = h.replace(/\s+<\/(p|h[1-6]|blockquote|hr|div|table|tbody|tr|td|body|head|html|title|meta|style|pre|script|link|object)>/g, '</$1>'); // Trim block end
					}

					// Simple indentation
					if (s.apply_source_formatting && s.indent_mode == 'simple') {
						// Add line breaks before and after block elements
						h = h.replace(/<(\/?)(ul|hr|table|meta|link|tbody|tr|object|body|head|html|map)(|[^>]+)>\s*/g, '\n<$1$2$3>\n');
						h = h.replace(/\s*<(p|h[1-6]|blockquote|div|title|style|pre|script|td|li|area)(|[^>]+)>/g, '\n<$1$2>');
						h = h.replace(/<\/(p|h[1-6]|blockquote|div|title|style|pre|script|td|li)>\s*/g, '</$1>\n');
						h = h.replace(/\n\n/g, '\n');
					}
				}

				h = t._unprotect(h, p);

				// Restore CDATA sections
				h = h.replace(/<!--\[CDATA\[([\s\S]+)\]\]-->/g, '<![CDATA[$1]]>');

				// Restore the \u00a0 character if raw mode is enabled
				if (s.entity_encoding == 'raw')
					h = h.replace(/<p>&nbsp;<\/p>|<p([^>]+)>&nbsp;<\/p>/g, '<p$1>\u00a0</p>');

				// Restore noscript elements
				h = h.replace(/<noscript([^>]+|)>([\s\S]*?)<\/noscript>/g, function(v, attribs, text) {
					return '<noscript' + attribs + '>' + t.dom.decode(text.replace(/<!--|-->/g, '')) + '</noscript>';
				});
			}

			o.content = h;
		},

		_serializeNode : function(n, inner) {
			var t = this, s = t.settings, w = t.writer, hc, el, cn, i, l, a, at, no, v, nn, ru, ar, iv, closed, keep, type, scopeName;

			if (!s.node_filter || s.node_filter(n)) {
				switch (n.nodeType) {
					case 1: // Element
						if (n.hasAttribute ? n.hasAttribute('_mce_bogus') : n.getAttribute('_mce_bogus'))
							return;

						iv = keep = false;
						hc = n.hasChildNodes();
						nn = n.getAttribute('_mce_name') || n.nodeName.toLowerCase();

						// Get internal type
						type = n.getAttribute('_mce_type');
						if (type) {
							if (!t._info.cleanup) {
								iv = true;
								return;
							} else
								keep = 1;
						}

						// Add correct prefix on IE
						if (isIE) {
							scopeName = n.scopeName;
							if (scopeName && scopeName !== 'HTML' && scopeName !== 'html')
								nn = scopeName + ':' + nn;
						}

						// Remove mce prefix on IE needed for the abbr element
						if (nn.indexOf('mce:') === 0)
							nn = nn.substring(4);

						// Check if valid
						if (!keep) {
							if (!t.validElementsRE || !t.validElementsRE.test(nn) || (t.invalidElementsRE && t.invalidElementsRE.test(nn)) || inner) {
								iv = true;
								break;
							}
						}

						if (isIE) {
							// Fix IE content duplication (DOM can have multiple copies of the same node)
							if (s.fix_content_duplication) {
								if (n._mce_serialized == t.key)
									return;

								n._mce_serialized = t.key;
							}

							// IE sometimes adds a / infront of the node name
							if (nn.charAt(0) == '/')
								nn = nn.substring(1);
						} else if (isGecko) {
							// Ignore br elements
							if (n.nodeName === 'BR' && n.getAttribute('type') == '_moz')
								return;
						}

						// Check if valid child
						if (s.validate_children) {
							if (t.elementName && !t.schema.isValid(t.elementName, nn)) {
								iv = true;
								break;
							}

							t.elementName = nn;
						}

						ru = t.findRule(nn);
						
						// No valid rule for this element could be found then skip it
						if (!ru) {
							iv = true;
							break;
						}

						nn = ru.name || nn;
						closed = s.closed.test(nn);

						// Skip empty nodes or empty node name in IE
						if ((!hc && ru.noEmpty) || (isIE && !nn)) {
							iv = true;
							break;
						}

						// Check required
						if (ru.requiredAttribs) {
							a = ru.requiredAttribs;

							for (i = a.length - 1; i >= 0; i--) {
								if (this.dom.getAttrib(n, a[i]) !== '')
									break;
							}

							// None of the required was there
							if (i == -1) {
								iv = true;
								break;
							}
						}

						w.writeStartElement(nn);

						// Add ordered attributes
						if (ru.attribs) {
							for (i=0, at = ru.attribs, l = at.length; i<l; i++) {
								a = at[i];
								v = t._getAttrib(n, a);

								if (v !== null)
									w.writeAttribute(a.name, v);
							}
						}

						// Add wild attributes
						if (ru.validAttribsRE) {
							at = t.dom.getAttribs(n);
							for (i=at.length-1; i>-1; i--) {
								no = at[i];

								if (no.specified) {
									a = no.nodeName.toLowerCase();

									if (s.invalid_attrs.test(a) || !ru.validAttribsRE.test(a))
										continue;

									ar = t.findAttribRule(ru, a);
									v = t._getAttrib(n, ar, a);

									if (v !== null)
										w.writeAttribute(a, v);
								}
							}
						}

						// Keep type attribute
						if (type && keep)
							w.writeAttribute('_mce_type', type);

						// Write text from script
						if (nn === 'script' && tinymce.trim(n.innerHTML)) {
							w.writeText('// '); // Padd it with a comment so it will parse on older browsers
							w.writeCDATA(n.innerHTML.replace(/<!--|-->|<\[CDATA\[|\]\]>/g, '')); // Remove comments and cdata stuctures
							hc = false;
							break;
						}

						// Padd empty nodes with a &nbsp;
						if (ru.padd) {
							// If it has only one bogus child, padd it anyway workaround for <td><br /></td> bug
							if (hc && (cn = n.firstChild) && cn.nodeType === 1 && n.childNodes.length === 1) {
								if (cn.hasAttribute ? cn.hasAttribute('_mce_bogus') : cn.getAttribute('_mce_bogus'))
									w.writeText('\u00a0');
							} else if (!hc)
								w.writeText('\u00a0'); // No children then padd it
						}

						break;

					case 3: // Text
						// Check if valid child
						if (s.validate_children && t.elementName && !t.schema.isValid(t.elementName, '#text'))
							return;

						return w.writeText(n.nodeValue);

					case 4: // CDATA
						return w.writeCDATA(n.nodeValue);

					case 8: // Comment
						return w.writeComment(n.nodeValue);
				}
			} else if (n.nodeType == 1)
				hc = n.hasChildNodes();

			if (hc && !closed) {
				cn = n.firstChild;

				while (cn) {
					t._serializeNode(cn);
					t.elementName = nn;
					cn = cn.nextSibling;
				}
			}

			// Write element end
			if (!iv) {
				if (!closed)
					w.writeFullEndElement();
				else
					w.writeEndElement();
			}
		},

		_protect : function(o) {
			var t = this;

			o.items = o.items || [];

			function enc(s) {
				return s.replace(/[\r\n\\]/g, function(c) {
					if (c === '\n')
						return '\\n';
					else if (c === '\\')
						return '\\\\';

					return '\\r';
				});
			};

			function dec(s) {
				return s.replace(/\\[\\rn]/g, function(c) {
					if (c === '\\n')
						return '\n';
					else if (c === '\\\\')
						return '\\';

					return '\r';
				});
			};

			each(o.patterns, function(p) {
				o.content = dec(enc(o.content).replace(p.pattern, function(x, a, b, c) {
					b = dec(b);

					if (p.encode)
						b = t._encode(b);

					o.items.push(b);
					return a + '<!--mce:' + (o.items.length - 1) + '-->' + c;
				}));
			});

			return o;
		},

		_unprotect : function(h, o) {
			h = h.replace(/\<!--mce:([0-9]+)--\>/g, function(a, b) {
				return o.items[parseInt(b)];
			});

			o.items = [];

			return h;
		},

		_encode : function(h) {
			var t = this, s = t.settings, l;

			// Entity encode
			if (s.entity_encoding !== 'raw') {
				if (s.entity_encoding.indexOf('named') != -1) {
					t.setEntities(s.entities);
					l = t.entityLookup;

					h = h.replace(/[\u007E-\uFFFF]/g, function(a) {
						var v;

						if (v = l[a])
							a = '&' + v + ';';

						return a;
					});
				}

				if (s.entity_encoding.indexOf('numeric') != -1) {
					h = h.replace(/[\u007E-\uFFFF]/g, function(a) {
						return '&#' + a.charCodeAt(0) + ';';
					});
				}
			}

			return h;
		},

		_setup : function() {
			var t = this, s = this.settings;

			if (t.done)
				return;

			t.done = 1;

			t.setRules(s.valid_elements);
			t.addRules(s.extended_valid_elements);

			if (s.invalid_elements)
				t.invalidElementsRE = new RegExp('^(' + wildcardToRE(s.invalid_elements.replace(/,/g, '|').toLowerCase()) + ')$');

			if (s.attrib_value_filter)
				t.attribValueFilter = s.attribValueFilter;
		},

		_getAttrib : function(n, a, na) {
			var i, v;

			na = na || a.name;

			if (a.forcedVal && (v = a.forcedVal)) {
				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			}

			v = this.dom.getAttrib(n, na);

			switch (na) {
				case 'rowspan':
				case 'colspan':
					// Whats the point? Remove usless attribute value
					if (v == '1')
						v = '';

					break;
			}

			if (this.attribValueFilter)
				v = this.attribValueFilter(na, v, n);

			if (a.validVals) {
				for (i = a.validVals.length - 1; i >= 0; i--) {
					if (v == a.validVals[i])
						break;
				}

				if (i == -1)
					return null;
			}

			if (v === '' && typeof(a.defaultVal) != 'undefined') {
				v = a.defaultVal;

				if (v === '{$uid}')
					return this.dom.uniqueId();

				return v;
			} else {
				// Remove internal mceItemXX classes when content is extracted from editor
				if (na == 'class' && this.processObj.get)
					v = v.replace(/\s?mceItem\w+\s?/g, '');
			}

			if (v === '')
				return null;


			return v;
		}
	});
})(tinymce);

(function(tinymce) {
	tinymce.dom.ScriptLoader = function(settings) {
		var QUEUED = 0,
			LOADING = 1,
			LOADED = 2,
			states = {},
			queue = [],
			scriptLoadedCallbacks = {},
			queueLoadedCallbacks = [],
			loading = 0,
			undefined;

		function loadScript(url, callback) {
			var t = this, dom = tinymce.DOM, elm, uri, loc, id;

			// Execute callback when script is loaded
			function done() {
				dom.remove(id);

				if (elm)
					elm.onreadystatechange = elm.onload = elm = null;

				callback();
			};

			id = dom.uniqueId();

			if (tinymce.isIE6) {
				uri = new tinymce.util.URI(url);
				loc = location;

				// If script is from same domain and we
				// use IE 6 then use XHR since it's more reliable
				if (uri.host == loc.hostname && uri.port == loc.port && (uri.protocol + ':') == loc.protocol) {
					tinymce.util.XHR.send({
						url : tinymce._addVer(uri.getURI()),
						success : function(content) {
							// Create new temp script element
							var script = dom.create('script', {
								type : 'text/javascript'
							});

							// Evaluate script in global scope
							script.text = content;
							document.getElementsByTagName('head')[0].appendChild(script);
							dom.remove(script);

							done();
						}
					});

					return;
				}
			}

			// Create new script element
			elm = dom.create('script', {
				id : id,
				type : 'text/javascript',
				src : tinymce._addVer(url)
			});

			// Add onload and readystate listeners
			elm.onload = done;
			elm.onreadystatechange = function() {
				var state = elm.readyState;

				// Loaded state is passed on IE 6 however there
				// are known issues with this method but we can't use
				// XHR in a cross domain loading
				if (state == 'complete' || state == 'loaded')
					done();
			};

			// Most browsers support this feature so we report errors
			// for those at least to help users track their missing plugins etc
			// todo: Removed since it produced error if the document is unloaded by navigating away, re-add it as an option
			/*elm.onerror = function() {
				alert('Failed to load: ' + url);
			};*/

			// Add script to document
			(document.getElementsByTagName('head')[0] || document.body).appendChild(elm);
		};

		this.isDone = function(url) {
			return states[url] == LOADED;
		};

		this.markDone = function(url) {
			states[url] = LOADED;
		};

		this.add = this.load = function(url, callback, scope) {
			var item, state = states[url];

			// Add url to load queue
			if (state == undefined) {
				queue.push(url);
				states[url] = QUEUED;
			}

			if (callback) {
				// Store away callback for later execution
				if (!scriptLoadedCallbacks[url])
					scriptLoadedCallbacks[url] = [];

				scriptLoadedCallbacks[url].push({
					func : callback,
					scope : scope || this
				});
			}
		};

		this.loadQueue = function(callback, scope) {
			this.loadScripts(queue, callback, scope);
		};

		this.loadScripts = function(scripts, callback, scope) {
			var loadScripts;

			function execScriptLoadedCallbacks(url) {
				// Execute URL callback functions
				tinymce.each(scriptLoadedCallbacks[url], function(callback) {
					callback.func.call(callback.scope);
				});

				scriptLoadedCallbacks[url] = undefined;
			};

			queueLoadedCallbacks.push({
				func : callback,
				scope : scope || this
			});

			loadScripts = function() {
				var loadingScripts = tinymce.grep(scripts);

				// Current scripts has been handled
				scripts.length = 0;

				// Load scripts that needs to be loaded
				tinymce.each(loadingScripts, function(url) {
					// Script is already loaded then execute script callbacks directly
					if (states[url] == LOADED) {
						execScriptLoadedCallbacks(url);
						return;
					}

					// Is script not loading then start loading it
					if (states[url] != LOADING) {
						states[url] = LOADING;
						loading++;

						loadScript(url, function() {
							states[url] = LOADED;
							loading--;

							execScriptLoadedCallbacks(url);

							// Load more scripts if they where added by the recently loaded script
							loadScripts();
						});
					}
				});

				// No scripts are currently loading then execute all pending queue loaded callbacks
				if (!loading) {
					tinymce.each(queueLoadedCallbacks, function(callback) {
						callback.func.call(callback.scope);
					});

					queueLoadedCallbacks.length = 0;
				}
			};

			loadScripts();
		};
	};

	// Global script loader
	tinymce.ScriptLoader = new tinymce.dom.ScriptLoader();
})(tinymce);

tinymce.dom.TreeWalker = function(start_node, root_node) {
	var node = start_node;

	function findSibling(node, start_name, sibling_name, shallow) {
		var sibling, parent;

		if (node) {
			// Walk into nodes if it has a start
			if (!shallow && node[start_name])
				return node[start_name];

			// Return the sibling if it has one
			if (node != root_node) {
				sibling = node[sibling_name];
				if (sibling)
					return sibling;

				// Walk up the parents to look for siblings
				for (parent = node.parentNode; parent && parent != root_node; parent = parent.parentNode) {
					sibling = parent[sibling_name];
					if (sibling)
						return sibling;
				}
			}
		}
	};

	this.current = function() {
		return node;
	};

	this.next = function(shallow) {
		return (node = findSibling(node, 'firstChild', 'nextSibling', shallow));
	};

	this.prev = function(shallow) {
		return (node = findSibling(node, 'lastChild', 'lastSibling', shallow));
	};
};

(function() {
	var transitional = {};

	function unpack(lookup, data) {
		var key;

		function replace(value) {
			return value.replace(/[A-Z]+/g, function(key) {
				return replace(lookup[key]);
			});
		};

		// Unpack lookup
		for (key in lookup) {
			if (lookup.hasOwnProperty(key))
				lookup[key] = replace(lookup[key]);
		}

		// Unpack and parse data into object map
		replace(data).replace(/#/g, '#text').replace(/(\w+)\[([^\]]+)\]/g, function(str, name, children) {
			var i, map = {};

			children = children.split(/\|/);

			for (i = children.length - 1; i >= 0; i--)
				map[children[i]] = 1;

			transitional[name] = map;
		});
	};

	// This is the XHTML 1.0 transitional elements with it's children packed to reduce it's size
	// we will later include the attributes here and use it as a default for valid elements but it
	// requires us to rewrite the serializer engine
	unpack({
		Z : '#|H|K|N|O|P',
		Y : '#|X|form|R|Q',
		X : 'p|T|div|U|W|isindex|fieldset|table',
		W : 'pre|hr|blockquote|address|center|noframes',
		U : 'ul|ol|dl|menu|dir',
		ZC : '#|p|Y|div|U|W|table|br|span|bdo|object|applet|img|map|K|N|Q',
		T : 'h1|h2|h3|h4|h5|h6',
		ZB : '#|X|S|Q',
		S : 'R|P',
		ZA : '#|a|G|J|M|O|P',
		R : '#|a|H|K|N|O',
		Q : 'noscript|P',
		P : 'ins|del|script',
		O : 'input|select|textarea|label|button',
		N : 'M|L',
		M : 'em|strong|dfn|code|q|samp|kbd|var|cite|abbr|acronym',
		L : 'sub|sup',
		K : 'J|I',
		J : 'tt|i|b|u|s|strike',
		I : 'big|small|font|basefont',
		H : 'G|F',
		G : 'br|span|bdo',
		F : 'object|applet|img|map|iframe'
	}, 'script[]' + 
		'style[]' + 
		'object[#|param|X|form|a|H|K|N|O|Q]' + 
		'param[]' + 
		'p[S]' + 
		'a[Z]' + 
		'br[]' + 
		'span[S]' + 
		'bdo[S]' + 
		'applet[#|param|X|form|a|H|K|N|O|Q]' + 
		'h1[S]' + 
		'img[]' + 
		'map[X|form|Q|area]' + 
		'h2[S]' + 
		'iframe[#|X|form|a|H|K|N|O|Q]' + 
		'h3[S]' + 
		'tt[S]' + 
		'i[S]' + 
		'b[S]' + 
		'u[S]' + 
		's[S]' + 
		'strike[S]' + 
		'big[S]' + 
		'small[S]' + 
		'font[S]' + 
		'basefont[]' + 
		'em[S]' + 
		'strong[S]' + 
		'dfn[S]' + 
		'code[S]' + 
		'q[S]' + 
		'samp[S]' + 
		'kbd[S]' + 
		'var[S]' + 
		'cite[S]' + 
		'abbr[S]' + 
		'acronym[S]' + 
		'sub[S]' + 
		'sup[S]' + 
		'input[]' + 
		'select[optgroup|option]' + 
		'optgroup[option]' + 
		'option[]' + 
		'textarea[]' + 
		'label[S]' + 
		'button[#|p|T|div|U|W|table|G|object|applet|img|map|K|N|Q]' + 
		'h4[S]' + 
		'ins[#|X|form|a|H|K|N|O|Q]' + 
		'h5[S]' + 
		'del[#|X|form|a|H|K|N|O|Q]' + 
		'h6[S]' + 
		'div[#|X|form|a|H|K|N|O|Q]' + 
		'ul[li]' + 
		'li[#|X|form|a|H|K|N|O|Q]' + 
		'ol[li]' + 
		'dl[dt|dd]' + 
		'dt[S]' + 
		'dd[#|X|form|a|H|K|N|O|Q]' + 
		'menu[li]' + 
		'dir[li]' + 
		'pre[ZA]' + 
		'hr[]' + 
		'blockquote[#|X|form|a|H|K|N|O|Q]' + 
		'address[S|p]' + 
		'center[#|X|form|a|H|K|N|O|Q]' + 
		'noframes[#|X|form|a|H|K|N|O|Q]' + 
		'isindex[]' + 
		'fieldset[#|legend|X|form|a|H|K|N|O|Q]' + 
		'legend[S]' + 
		'table[caption|col|colgroup|thead|tfoot|tbody|tr]' + 
		'caption[S]' + 
		'col[]' + 
		'colgroup[col]' + 
		'thead[tr]' + 
		'tr[th|td]' + 
		'th[#|X|form|a|H|K|N|O|Q]' + 
		'form[#|X|a|H|K|N|O|Q]' + 
		'noscript[#|X|form|a|H|K|N|O|Q]' + 
		'td[#|X|form|a|H|K|N|O|Q]' + 
		'tfoot[tr]' + 
		'tbody[tr]' + 
		'area[]' + 
		'base[]' + 
		'body[#|X|form|a|H|K|N|O|Q]'
	);

	tinymce.dom.Schema = function() {
		var t = this, elements = transitional;

		t.isValid = function(name, child_name) {
			var element = elements[name];

			return !!(element && (!child_name || element[child_name]));
		};
	};
})();
(function(tinymce) {
	tinymce.dom.RangeUtils = function(dom) {
		var INVISIBLE_CHAR = '\uFEFF';

		this.walk = function(rng, callback) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset,
				ancestor, startPoint,
				endPoint, node, parent, siblings, nodes;

			// Handle table cell selection the table plugin enables
			// you to fake select table cells and perform formatting actions on them
			nodes = dom.select('td.mceSelected,th.mceSelected');
			if (nodes.length > 0) {
				tinymce.each(nodes, function(node) {
					callback([node]);
				});

				return;
			}

			function collectSiblings(node, name, end_node) {
				var siblings = [];

				for (; node && node != end_node; node = node[name])
					siblings.push(node);

				return siblings;
			};

			function findEndPoint(node, root) {
				do {
					if (node.parentNode == root)
						return node;

					node = node.parentNode;
				} while(node);
			};

			function walkBoundary(start_node, end_node, next) {
				var siblingName = next ? 'nextSibling' : 'previousSibling';

				for (node = start_node, parent = node.parentNode; node && node != end_node; node = parent) {
					parent = node.parentNode;
					siblings = collectSiblings(node == start_node ? node : node[siblingName], siblingName);

					if (siblings.length) {
						if (!next)
							siblings.reverse();

						callback(siblings);
					}
				}
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes())
				startContainer = startContainer.childNodes[startOffset];

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes())
				endContainer = endContainer.childNodes[Math.min(startOffset == endOffset ? endOffset : endOffset - 1, endContainer.childNodes.length - 1)];

			// Find common ancestor and end points
			ancestor = dom.findCommonAncestor(startContainer, endContainer);

			// Same container
			if (startContainer == endContainer)
				return callback([startContainer]);

			// Process left side
			for (node = startContainer; node; node = node.parentNode) {
				if (node == endContainer)
					return walkBoundary(startContainer, ancestor, true);

				if (node == ancestor)
					break;
			}

			// Process right side
			for (node = endContainer; node; node = node.parentNode) {
				if (node == startContainer)
					return walkBoundary(endContainer, ancestor);

				if (node == ancestor)
					break;
			}

			// Find start/end point
			startPoint = findEndPoint(startContainer, ancestor) || startContainer;
			endPoint = findEndPoint(endContainer, ancestor) || endContainer;

			// Walk left leaf
			walkBoundary(startContainer, startPoint, true);

			// Walk the middle from start to end point
			siblings = collectSiblings(
				startPoint == startContainer ? startPoint : startPoint.nextSibling,
				'nextSibling',
				endPoint == endContainer ? endPoint.nextSibling : endPoint
			);

			if (siblings.length)
				callback(siblings);

			// Walk right leaf
			walkBoundary(endContainer, endPoint);
		};

		/*		this.split = function(rng) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset;

			function splitText(node, offset) {
				if (offset == node.nodeValue.length)
					node.appendData(INVISIBLE_CHAR);

				node = node.splitText(offset);

				if (node.nodeValue === INVISIBLE_CHAR)
					node.nodeValue = '';

				return node;
			};

			// Handle single text node
			if (startContainer == endContainer) {
				if (startContainer.nodeType == 3) {
					if (startOffset != 0)
						startContainer = endContainer = splitText(startContainer, startOffset);

					if (endOffset - startOffset != startContainer.nodeValue.length)
						splitText(startContainer, endOffset - startOffset);
				}
			} else {
				// Split startContainer text node if needed
				if (startContainer.nodeType == 3 && startOffset != 0) {
					startContainer = splitText(startContainer, startOffset);
					startOffset = 0;
				}

				// Split endContainer text node if needed
				if (endContainer.nodeType == 3 && endOffset != endContainer.nodeValue.length) {
					endContainer = splitText(endContainer, endOffset).previousSibling;
					endOffset = endContainer.nodeValue.length;
				}
			}

			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		};
*/
	};

	tinymce.dom.RangeUtils.compareRanges = function(rng1, rng2) {
		if (rng1 && rng2) {
			// Compare native IE ranges
			if (rng1.item || rng1.duplicate) {
				// Both are control ranges and the selected element matches
				if (rng1.item && rng2.item && rng1.item(0) === rng2.item(0))
					return true;

				// Both are text ranges and the range matches
				if (rng1.isEqual && rng2.isEqual && rng2.isEqual(rng1))
					return true;
			} else {
				// Compare w3c ranges
				return rng1.startContainer == rng2.startContainer && rng1.startOffset == rng2.startOffset;
			}
		}

		return false;
	};
})(tinymce);

(function(tinymce) {
	// Shorten class names
	var DOM = tinymce.DOM, is = tinymce.is;

	tinymce.create('tinymce.ui.Control', {
		Control : function(id, s) {
			this.id = id;
			this.settings = s = s || {};
			this.rendered = false;
			this.onRender = new tinymce.util.Dispatcher(this);
			this.classPrefix = '';
			this.scope = s.scope || this;
			this.disabled = 0;
			this.active = 0;
		},

		setDisabled : function(s) {
			var e;

			if (s != this.disabled) {
				e = DOM.get(this.id);

				// Add accessibility title for unavailable actions
				if (e && this.settings.unavailable_prefix) {
					if (s) {
						this.prevTitle = e.title;
						e.title = this.settings.unavailable_prefix + ": " + e.title;
					} else
						e.title = this.prevTitle;
				}

				this.setState('Disabled', s);
				this.setState('Enabled', !s);
				this.disabled = s;
			}
		},

		isDisabled : function() {
			return this.disabled;
		},

		setActive : function(s) {
			if (s != this.active) {
				this.setState('Active', s);
				this.active = s;
			}
		},

		isActive : function() {
			return this.active;
		},

		setState : function(c, s) {
			var n = DOM.get(this.id);

			c = this.classPrefix + c;

			if (s)
				DOM.addClass(n, c);
			else
				DOM.removeClass(n, c);
		},

		isRendered : function() {
			return this.rendered;
		},

		renderHTML : function() {
		},

		renderTo : function(n) {
			DOM.setHTML(n, this.renderHTML());
		},

		postRender : function() {
			var t = this, b;

			// Set pending states
			if (is(t.disabled)) {
				b = t.disabled;
				t.disabled = -1;
				t.setDisabled(b);
			}

			if (is(t.active)) {
				b = t.active;
				t.active = -1;
				t.setActive(b);
			}
		},

		remove : function() {
			DOM.remove(this.id);
			this.destroy();
		},

		destroy : function() {
			tinymce.dom.Event.clear(this.id);
		}
	});
})(tinymce);
tinymce.create('tinymce.ui.Container:tinymce.ui.Control', {
	Container : function(id, s) {
		this.parent(id, s);

		this.controls = [];

		this.lookup = {};
	},

	add : function(c) {
		this.lookup[c.id] = c;
		this.controls.push(c);

		return c;
	},

	get : function(n) {
		return this.lookup[n];
	}
});


tinymce.create('tinymce.ui.Separator:tinymce.ui.Control', {
	Separator : function(id, s) {
		this.parent(id, s);
		this.classPrefix = 'mceSeparator';
	},

	renderHTML : function() {
		return tinymce.DOM.createHTML('span', {'class' : this.classPrefix});
	}
});

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.MenuItem:tinymce.ui.Control', {
		MenuItem : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceMenuItem';
		},

		setSelected : function(s) {
			this.setState('Selected', s);
			this.selected = s;
		},

		isSelected : function() {
			return this.selected;
		},

		postRender : function() {
			var t = this;
			
			t.parent();

			// Set pending state
			if (is(t.selected))
				t.setSelected(t.selected);
		}
	});
})(tinymce);

(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, walk = tinymce.walk;

	tinymce.create('tinymce.ui.Menu:tinymce.ui.MenuItem', {
		Menu : function(id, s) {
			var t = this;

			t.parent(id, s);
			t.items = {};
			t.collapsed = false;
			t.menuCount = 0;
			t.onAddItem = new tinymce.util.Dispatcher(this);
		},

		expand : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.expand)
						o.expand();
				}, 'items', t);
			}

			t.collapsed = false;
		},

		collapse : function(d) {
			var t = this;

			if (d) {
				walk(t, function(o) {
					if (o.collapse)
						o.collapse();
				}, 'items', t);
			}

			t.collapsed = true;
		},

		isCollapsed : function() {
			return this.collapsed;
		},

		add : function(o) {
			if (!o.settings)
				o = new tinymce.ui.MenuItem(o.id || DOM.uniqueId(), o);

			this.onAddItem.dispatch(this, o);

			return this.items[o.id] = o;
		},

		addSeparator : function() {
			return this.add({separator : true});
		},

		addMenu : function(o) {
			if (!o.collapse)
				o = this.createMenu(o);

			this.menuCount++;

			return this.add(o);
		},

		hasMenus : function() {
			return this.menuCount !== 0;
		},

		remove : function(o) {
			delete this.items[o.id];
		},

		removeAll : function() {
			var t = this;

			walk(t, function(o) {
				if (o.removeAll)
					o.removeAll();
				else
					o.remove();

				o.destroy();
			}, 'items', t);

			t.items = {};
		},

		createMenu : function(o) {
			var m = new tinymce.ui.Menu(o.id || DOM.uniqueId(), o);

			m.onAddItem.add(this.onAddItem.dispatch, this.onAddItem);

			return m;
		}
	});
})(tinymce);
(function(tinymce) {
	var is = tinymce.is, DOM = tinymce.DOM, each = tinymce.each, Event = tinymce.dom.Event, Element = tinymce.dom.Element;

	tinymce.create('tinymce.ui.DropMenu:tinymce.ui.Menu', {
		DropMenu : function(id, s) {
			s = s || {};
			s.container = s.container || DOM.doc.body;
			s.offset_x = s.offset_x || 0;
			s.offset_y = s.offset_y || 0;
			s.vp_offset_x = s.vp_offset_x || 0;
			s.vp_offset_y = s.vp_offset_y || 0;

			if (is(s.icons) && !s.icons)
				s['class'] += ' mceNoIcons';

			this.parent(id, s);
			this.onShowMenu = new tinymce.util.Dispatcher(this);
			this.onHideMenu = new tinymce.util.Dispatcher(this);
			this.classPrefix = 'mceMenu';
		},

		createMenu : function(s) {
			var t = this, cs = t.settings, m;

			s.container = s.container || cs.container;
			s.parent = t;
			s.constrain = s.constrain || cs.constrain;
			s['class'] = s['class'] || cs['class'];
			s.vp_offset_x = s.vp_offset_x || cs.vp_offset_x;
			s.vp_offset_y = s.vp_offset_y || cs.vp_offset_y;
			m = new tinymce.ui.DropMenu(s.id || DOM.uniqueId(), s);

			m.onAddItem.add(t.onAddItem.dispatch, t.onAddItem);

			return m;
		},

		update : function() {
			var t = this, s = t.settings, tb = DOM.get('menu_' + t.id + '_tbl'), co = DOM.get('menu_' + t.id + '_co'), tw, th;

			tw = s.max_width ? Math.min(tb.clientWidth, s.max_width) : tb.clientWidth;
			th = s.max_height ? Math.min(tb.clientHeight, s.max_height) : tb.clientHeight;

			if (!DOM.boxModel)
				t.element.setStyles({width : tw + 2, height : th + 2});
			else
				t.element.setStyles({width : tw, height : th});

			if (s.max_width)
				DOM.setStyle(co, 'width', tw);

			if (s.max_height) {
				DOM.setStyle(co, 'height', th);

				if (tb.clientHeight < s.max_height)
					DOM.setStyle(co, 'overflow', 'hidden');
			}
		},

		showMenu : function(x, y, px) {
			var t = this, s = t.settings, co, vp = DOM.getViewPort(), w, h, mx, my, ot = 2, dm, tb, cp = t.classPrefix;

			t.collapse(1);

			if (t.isMenuVisible)
				return;

			if (!t.rendered) {
				co = DOM.add(t.settings.container, t.renderNode());

				each(t.items, function(o) {
					o.postRender();
				});

				t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});
			} else
				co = DOM.get('menu_' + t.id);

			// Move layer out of sight unless it's Opera since it scrolls to top of page due to an bug
			if (!tinymce.isOpera)
				DOM.setStyles(co, {left : -0xFFFF , top : -0xFFFF});

			DOM.show(co);
			t.update();

			x += s.offset_x || 0;
			y += s.offset_y || 0;
			vp.w -= 4;
			vp.h -= 4;

			// Move inside viewport if not submenu
			if (s.constrain) {
				w = co.clientWidth - ot;
				h = co.clientHeight - ot;
				mx = vp.x + vp.w;
				my = vp.y + vp.h;

				if ((x + s.vp_offset_x + w) > mx)
					x = px ? px - w : Math.max(0, (mx - s.vp_offset_x) - w);

				if ((y + s.vp_offset_y + h) > my)
					y = Math.max(0, (my - s.vp_offset_y) - h);
			}

			DOM.setStyles(co, {left : x , top : y});
			t.element.update();

			t.isMenuVisible = 1;
			t.mouseClickFunc = Event.add(co, 'click', function(e) {
				var m;

				e = e.target;

				if (e && (e = DOM.getParent(e, 'tr')) && !DOM.hasClass(e, cp + 'ItemSub')) {
					m = t.items[e.id];

					if (m.isDisabled())
						return;

					dm = t;

					while (dm) {
						if (dm.hideMenu)
							dm.hideMenu();

						dm = dm.settings.parent;
					}

					if (m.settings.onclick)
						m.settings.onclick(e);

					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				}
			});

			if (t.hasMenus()) {
				t.mouseOverFunc = Event.add(co, 'mouseover', function(e) {
					var m, r, mi;

					e = e.target;
					if (e && (e = DOM.getParent(e, 'tr'))) {
						m = t.items[e.id];

						if (t.lastMenu)
							t.lastMenu.collapse(1);

						if (m.isDisabled())
							return;

						if (e && DOM.hasClass(e, cp + 'ItemSub')) {
							//p = DOM.getPos(s.container);
							r = DOM.getRect(e);
							m.showMenu((r.x + r.w - ot), r.y - ot, r.x);
							t.lastMenu = m;
							DOM.addClass(DOM.get(m.id).firstChild, cp + 'ItemActive');
						}
					}
				});
			}

			t.onShowMenu.dispatch(t);

			if (s.keyboard_focus) {
				Event.add(co, 'keydown', t._keyHandler, t);
				DOM.select('a', 'menu_' + t.id)[0].focus(); // Select first link
				t._focusIdx = 0;
			}
		},

		hideMenu : function(c) {
			var t = this, co = DOM.get('menu_' + t.id), e;

			if (!t.isMenuVisible)
				return;

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);
			Event.remove(co, 'keydown', t._keyHandler);
			DOM.hide(co);
			t.isMenuVisible = 0;

			if (!c)
				t.collapse(1);

			if (t.element)
				t.element.hide();

			if (e = DOM.get(t.id))
				DOM.removeClass(e.firstChild, t.classPrefix + 'ItemActive');

			t.onHideMenu.dispatch(t);
		},

		add : function(o) {
			var t = this, co;

			o = t.parent(o);

			if (t.isRendered && (co = DOM.get('menu_' + t.id)))
				t._add(DOM.select('tbody', co)[0], o);

			return o;
		},

		collapse : function(d) {
			this.parent(d);
			this.hideMenu(1);
		},

		remove : function(o) {
			DOM.remove(o.id);
			this.destroy();

			return this.parent(o);
		},

		destroy : function() {
			var t = this, co = DOM.get('menu_' + t.id);

			Event.remove(co, 'mouseover', t.mouseOverFunc);
			Event.remove(co, 'click', t.mouseClickFunc);

			if (t.element)
				t.element.remove();

			DOM.remove(co);
		},

		renderNode : function() {
			var t = this, s = t.settings, n, tb, co, w;

			w = DOM.create('div', {id : 'menu_' + t.id, 'class' : s['class'], 'style' : 'position:absolute;left:0;top:0;z-index:200000'});
			co = DOM.add(w, 'div', {id : 'menu_' + t.id + '_co', 'class' : t.classPrefix + (s['class'] ? ' ' + s['class'] : '')});
			t.element = new Element('menu_' + t.id, {blocker : 1, container : s.container});

			if (s.menu_line)
				DOM.add(co, 'span', {'class' : t.classPrefix + 'Line'});

//			n = DOM.add(co, 'div', {id : 'menu_' + t.id + '_co', 'class' : 'mceMenuContainer'});
			n = DOM.add(co, 'table', {id : 'menu_' + t.id + '_tbl', border : 0, cellPadding : 0, cellSpacing : 0});
			tb = DOM.add(n, 'tbody');

			each(t.items, function(o) {
				t._add(tb, o);
			});

			t.rendered = true;

			return w;
		},

		// Internal functions

		_keyHandler : function(e) {
			var t = this, kc = e.keyCode;

			function focus(d) {
				var i = t._focusIdx + d, e = DOM.select('a', 'menu_' + t.id)[i];

				if (e) {
					t._focusIdx = i;
					e.focus();
				}
			};

			switch (kc) {
				case 38:
					focus(-1); // Select first link
					return;

				case 40:
					focus(1);
					return;

				case 13:
					return;

				case 27:
					return this.hideMenu();
			}
		},

		_add : function(tb, o) {
			var n, s = o.settings, a, ro, it, cp = this.classPrefix, ic;

			if (s.separator) {
				ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'ItemSeparator'});
				DOM.add(ro, 'td', {'class' : cp + 'ItemSeparator'});

				if (n = ro.previousSibling)
					DOM.addClass(n, 'mceLast');

				return;
			}

			n = ro = DOM.add(tb, 'tr', {id : o.id, 'class' : cp + 'Item ' + cp + 'ItemEnabled'});
			n = it = DOM.add(n, 'td');
			n = a = DOM.add(n, 'a', {href : 'javascript:;', onclick : "return false;", onmousedown : 'return false;'});

			DOM.addClass(it, s['class']);
//			n = DOM.add(n, 'span', {'class' : 'item'});

			ic = DOM.add(n, 'span', {'class' : 'mceIcon' + (s.icon ? ' mce_' + s.icon : '')});

			if (s.icon_src)
				DOM.add(ic, 'img', {src : s.icon_src});

			n = DOM.add(n, s.element || 'span', {'class' : 'mceText', title : o.settings.title}, o.settings.title);

			if (o.settings.style)
				DOM.setAttrib(n, 'style', o.settings.style);

			if (tb.childNodes.length == 1)
				DOM.addClass(ro, 'mceFirst');

			if ((n = ro.previousSibling) && DOM.hasClass(n, cp + 'ItemSeparator'))
				DOM.addClass(ro, 'mceFirst');

			if (o.collapse)
				DOM.addClass(ro, cp + 'ItemSub');

			if (n = ro.previousSibling)
				DOM.removeClass(n, 'mceLast');

			DOM.addClass(ro, 'mceLast');
		}
	});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM;

	tinymce.create('tinymce.ui.Button:tinymce.ui.Control', {
		Button : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceButton';
		},

		renderHTML : function() {
			var cp = this.classPrefix, s = this.settings, h, l;

			l = DOM.encode(s.label || '');
			h = '<a id="' + this.id + '" href="javascript:;" class="' + cp + ' ' + cp + 'Enabled ' + s['class'] + (l ? ' ' + cp + 'Labeled' : '') +'" onmousedown="return false;" onclick="return false;" title="' + DOM.encode(s.title) + '">';

			if (s.image)
				h += '<img class="mceIcon" src="' + s.image + '" />' + l + '</a>';
			else
				h += '<span class="mceIcon ' + s['class'] + '"></span>' + (l ? '<span class="' + cp + 'Label">' + l + '</span>' : '') + '</a>';

			return h;
		},

		postRender : function() {
			var t = this, s = t.settings;

			tinymce.dom.Event.add(t.id, 'click', function(e) {
				if (!t.isDisabled())
					return s.onclick.call(s.scope, e);
			});
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.ui.ListBox:tinymce.ui.Control', {
		ListBox : function(id, s) {
			var t = this;

			t.parent(id, s);

			t.items = [];

			t.onChange = new Dispatcher(t);

			t.onPostRender = new Dispatcher(t);

			t.onAdd = new Dispatcher(t);

			t.onRenderMenu = new tinymce.util.Dispatcher(this);

			t.classPrefix = 'mceListBox';
		},

		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && va.call)
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			var t = this, e, o;

			if (idx != t.selectedIndex) {
				e = DOM.get(t.id + '_text');
				o = t.items[idx];

				if (o) {
					t.selectedValue = o.value;
					t.selectedIndex = idx;
					DOM.setHTML(e, DOM.encode(o.title));
					DOM.removeClass(e, 'mceTitle');
				} else {
					DOM.setHTML(e, DOM.encode(t.settings.title));
					DOM.addClass(e, 'mceTitle');
					t.selectedValue = t.selectedIndex = null;
				}

				e = 0;
			}
		},

		add : function(n, v, o) {
			var t = this;

			o = o || {};
			o = tinymce.extend(o, {
				title : n,
				value : v
			});

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return this.items.length;
		},

		renderHTML : function() {
			var h = '', t = this, s = t.settings, cp = t.classPrefix;

			h = '<table id="' + t.id + '" cellpadding="0" cellspacing="0" class="' + cp + ' ' + cp + 'Enabled' + (s['class'] ? (' ' + s['class']) : '') + '"><tbody><tr>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_text', href : 'javascript:;', 'class' : 'mceText', onclick : "return false;", onmousedown : 'return false;'}, DOM.encode(t.settings.title)) + '</td>';
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', tabindex : -1, href : 'javascript:;', 'class' : 'mceOpen', onclick : "return false;", onmousedown : 'return false;'}, '<span></span>') + '</td>';
			h += '</tr></tbody></table>';

			return h;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(this.id), m;

			if (t.isDisabled() || t.items.length == 0)
				return;

			if (t.menu && t.menu.isMenuVisible)
				return t.hideMenu();

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			p1 = DOM.getPos(this.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.keyboard_focus = !tinymce.isOpera; // Opera is buggy when it comes to auto focus

			// Select in menu
			if (t.oldID)
				m.items[t.oldID].setSelected(0);

			each(t.items, function(o) {
				if (o.value === t.selectedValue) {
					m.items[o.id].setSelected(1);
					t.oldID = o.id;
				}
			});

			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			DOM.addClass(t.id, t.classPrefix + 'Selected');

			//DOM.get(t.id + '_text').focus();
		},

		hideMenu : function(e) {
			var t = this;

			if (t.menu && t.menu.isMenuVisible) {
				// Prevent double toogles by canceling the mouse click event to the button
				if (e && e.type == "mousedown" && (e.target.id == t.id + '_text' || e.target.id == t.id + '_open'))
					return;

				if (!e || !DOM.getParent(e.target, '.mceMenu')) {
					DOM.removeClass(t.id, t.classPrefix + 'Selected');
					Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
					t.menu.hideMenu();
				}
			}
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : t.classPrefix + 'Menu mceNoIcons',
				max_width : 150,
				max_height : 150
			});

			m.onHideMenu.add(t.hideMenu, t);

			m.add({
				title : t.settings.title,
				'class' : 'mceMenuItemTitle',
				onclick : function() {
					if (t.settings.onselect('') !== false)
						t.select(''); // Must be runned after
				}
			});

			each(t.items, function(o) {
				// No value then treat it as a title
				if (o.value === undefined) {
					m.add({
						title : o.title,
						'class' : 'mceMenuItemTitle',
						onclick : function() {
							if (t.settings.onselect('') !== false)
								t.select(''); // Must be runned after
						}
					});
				} else {
					o.id = DOM.uniqueId();
					o.onclick = function() {
						if (t.settings.onselect(o.value) !== false)
							t.select(o.value); // Must be runned after
					};

					m.add(o);
				}
			});

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		postRender : function() {
			var t = this, cp = t.classPrefix;

			Event.add(t.id, 'click', t.showMenu, t);
			Event.add(t.id + '_text', 'focus', function() {
				if (!t._focused) {
					t.keyDownHandler = Event.add(t.id + '_text', 'keydown', function(e) {
						var idx = -1, v, kc = e.keyCode;

						// Find current index
						each(t.items, function(v, i) {
							if (t.selectedValue == v.value)
								idx = i;
						});

						// Move up/down
						if (kc == 38)
							v = t.items[idx - 1];
						else if (kc == 40)
							v = t.items[idx + 1];
						else if (kc == 13) {
							// Fake select on enter
							v = t.selectedValue;
							t.selectedValue = null; // Needs to be null to fake change
							t.settings.onselect(v);
							return Event.cancel(e);
						}

						if (v) {
							t.hideMenu();
							t.select(v.value);
						}
					});
				}

				t._focused = 1;
			});
			Event.add(t.id + '_text', 'blur', function() {Event.remove(t.id + '_text', 'keydown', t.keyDownHandler); t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.addClass(t.id, cp + 'Hover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, cp + 'Disabled'))
						DOM.removeClass(t.id, cp + 'Hover');
				});
			}

			t.onPostRender.dispatch(t, DOM.get(t.id));
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_text');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, Dispatcher = tinymce.util.Dispatcher;

	tinymce.create('tinymce.ui.NativeListBox:tinymce.ui.ListBox', {
		NativeListBox : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceNativeListBox';
		},

		setDisabled : function(s) {
			DOM.get(this.id).disabled = s;
		},

		isDisabled : function() {
			return DOM.get(this.id).disabled;
		},

		select : function(va) {
			var t = this, fv, f;

			if (va == undefined)
				return t.selectByIndex(-1);

			// Is string or number make function selector
			if (va && va.call)
				f = va;
			else {
				f = function(v) {
					return v == va;
				};
			}

			// Do we need to do something?
			if (va != t.selectedValue) {
				// Find item
				each(t.items, function(o, i) {
					if (f(o.value)) {
						fv = 1;
						t.selectByIndex(i);
						return false;
					}
				});

				if (!fv)
					t.selectByIndex(-1);
			}
		},

		selectByIndex : function(idx) {
			DOM.get(this.id).selectedIndex = idx + 1;
			this.selectedValue = this.items[idx] ? this.items[idx].value : null;
		},

		add : function(n, v, a) {
			var o, t = this;

			a = a || {};
			a.value = v;

			if (t.isRendered())
				DOM.add(DOM.get(this.id), 'option', a, n);

			o = {
				title : n,
				value : v,
				attribs : a
			};

			t.items.push(o);
			t.onAdd.dispatch(t, o);
		},

		getLength : function() {
			return this.items.length;
		},

		renderHTML : function() {
			var h, t = this;

			h = DOM.createHTML('option', {value : ''}, '-- ' + t.settings.title + ' --');

			each(t.items, function(it) {
				h += DOM.createHTML('option', {value : it.value}, it.title);
			});

			h = DOM.createHTML('select', {id : t.id, 'class' : 'mceNativeListBox'}, h);

			return h;
		},

		postRender : function() {
			var t = this, ch;

			t.rendered = true;

			function onChange(e) {
				var v = t.items[e.target.selectedIndex - 1];

				if (v && (v = v.value)) {
					t.onChange.dispatch(t, v);

					if (t.settings.onselect)
						t.settings.onselect(v);
				}
			};

			Event.add(t.id, 'change', onChange);

			// Accessibility keyhandler
			Event.add(t.id, 'keydown', function(e) {
				var bf;

				Event.remove(t.id, 'change', ch);

				bf = Event.add(t.id, 'blur', function() {
					Event.add(t.id, 'change', onChange);
					Event.remove(t.id, 'blur', bf);
				});

				if (e.keyCode == 13 || e.keyCode == 32) {
					onChange(e);
					return Event.cancel(e);
				}
			});

			t.onPostRender.dispatch(t, DOM.get(t.id));
		}
	});
})(tinymce);
(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.MenuButton:tinymce.ui.Button', {
		MenuButton : function(id, s) {
			this.parent(id, s);

			this.onRenderMenu = new tinymce.util.Dispatcher(this);

			s.menu_container = s.menu_container || DOM.doc.body;
		},

		showMenu : function() {
			var t = this, p1, p2, e = DOM.get(t.id), m;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			p1 = DOM.getPos(t.settings.menu_container);
			p2 = DOM.getPos(e);

			m = t.menu;
			m.settings.offset_x = p2.x;
			m.settings.offset_y = p2.y;
			m.settings.vp_offset_x = p2.x;
			m.settings.vp_offset_y = p2.y;
			m.settings.keyboard_focus = t._focused;
			m.showMenu(0, e.clientHeight);

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.setState('Selected', 1);

			t.isMenuVisible = 1;
		},

		renderMenu : function() {
			var t = this, m;

			m = t.settings.control_manager.createDropMenu(t.id + '_menu', {
				menu_line : 1,
				'class' : this.classPrefix + 'Menu',
				icons : t.settings.icons
			});

			m.onHideMenu.add(t.hideMenu, t);

			t.onRenderMenu.dispatch(t, m);
			t.menu = m;
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id || e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceMenu')) {
				t.setState('Selected', 0);
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				if (t.menu)
					t.menu.hideMenu();
			}

			t.isMenuVisible = 0;
		},

		postRender : function() {
			var t = this, s = t.settings;

			Event.add(t.id, 'click', function() {
				if (!t.isDisabled()) {
					if (s.onclick)
						s.onclick(t.value);

					t.showMenu();
				}
			});
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each;

	tinymce.create('tinymce.ui.SplitButton:tinymce.ui.MenuButton', {
		SplitButton : function(id, s) {
			this.parent(id, s);
			this.classPrefix = 'mceSplitButton';
		},

		renderHTML : function() {
			var h, t = this, s = t.settings, h1;

			h = '<tbody><tr>';

			if (s.image)
				h1 = DOM.createHTML('img ', {src : s.image, 'class' : 'mceAction ' + s['class']});
			else
				h1 = DOM.createHTML('span', {'class' : 'mceAction ' + s['class']}, '');

			h += '<td>' + DOM.createHTML('a', {id : t.id + '_action', href : 'javascript:;', 'class' : 'mceAction ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';
	
			h1 = DOM.createHTML('span', {'class' : 'mceOpen ' + s['class']});
			h += '<td>' + DOM.createHTML('a', {id : t.id + '_open', href : 'javascript:;', 'class' : 'mceOpen ' + s['class'], onclick : "return false;", onmousedown : 'return false;', title : s.title}, h1) + '</td>';

			h += '</tr></tbody>';

			return DOM.createHTML('table', {id : t.id, 'class' : 'mceSplitButton mceSplitButtonEnabled ' + s['class'], cellpadding : '0', cellspacing : '0', onmousedown : 'return false;', title : s.title}, h);
		},

		postRender : function() {
			var t = this, s = t.settings;

			if (s.onclick) {
				Event.add(t.id + '_action', 'click', function() {
					if (!t.isDisabled())
						s.onclick(t.value);
				});
			}

			Event.add(t.id + '_open', 'click', t.showMenu, t);
			Event.add(t.id + '_open', 'focus', function() {t._focused = 1;});
			Event.add(t.id + '_open', 'blur', function() {t._focused = 0;});

			// Old IE doesn't have hover on all elements
			if (tinymce.isIE6 || !DOM.boxModel) {
				Event.add(t.id, 'mouseover', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.addClass(t.id, 'mceSplitButtonHover');
				});

				Event.add(t.id, 'mouseout', function() {
					if (!DOM.hasClass(t.id, 'mceSplitButtonDisabled'))
						DOM.removeClass(t.id, 'mceSplitButtonHover');
				});
			}
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_action');
			Event.clear(this.id + '_open');
		}
	});
})(tinymce);

(function(tinymce) {
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, is = tinymce.is, each = tinymce.each;

	tinymce.create('tinymce.ui.ColorSplitButton:tinymce.ui.SplitButton', {
		ColorSplitButton : function(id, s) {
			var t = this;

			t.parent(id, s);

			t.settings = s = tinymce.extend({
				colors : '000000,993300,333300,003300,003366,000080,333399,333333,800000,FF6600,808000,008000,008080,0000FF,666699,808080,FF0000,FF9900,99CC00,339966,33CCCC,3366FF,800080,999999,FF00FF,FFCC00,FFFF00,00FF00,00FFFF,00CCFF,993366,C0C0C0,FF99CC,FFCC99,FFFF99,CCFFCC,CCFFFF,99CCFF,CC99FF,FFFFFF',
				grid_width : 8,
				default_color : '#888888'
			}, t.settings);

			t.onShowMenu = new tinymce.util.Dispatcher(t);

			t.onHideMenu = new tinymce.util.Dispatcher(t);

			t.value = s.default_color;
		},

		showMenu : function() {
			var t = this, r, p, e, p2;

			if (t.isDisabled())
				return;

			if (!t.isMenuRendered) {
				t.renderMenu();
				t.isMenuRendered = true;
			}

			if (t.isMenuVisible)
				return t.hideMenu();

			e = DOM.get(t.id);
			DOM.show(t.id + '_menu');
			DOM.addClass(e, 'mceSplitButtonSelected');
			p2 = DOM.getPos(e);
			DOM.setStyles(t.id + '_menu', {
				left : p2.x,
				top : p2.y + e.clientHeight,
				zIndex : 200000
			});
			e = 0;

			Event.add(DOM.doc, 'mousedown', t.hideMenu, t);
			t.onShowMenu.dispatch(t);

			if (t._focused) {
				t._keyHandler = Event.add(t.id + '_menu', 'keydown', function(e) {
					if (e.keyCode == 27)
						t.hideMenu();
				});

				DOM.select('a', t.id + '_menu')[0].focus(); // Select first link
			}

			t.isMenuVisible = 1;
		},

		hideMenu : function(e) {
			var t = this;

			// Prevent double toogles by canceling the mouse click event to the button
			if (e && e.type == "mousedown" && DOM.getParent(e.target, function(e) {return e.id === t.id + '_open';}))
				return;

			if (!e || !DOM.getParent(e.target, '.mceSplitButtonMenu')) {
				DOM.removeClass(t.id, 'mceSplitButtonSelected');
				Event.remove(DOM.doc, 'mousedown', t.hideMenu, t);
				Event.remove(t.id + '_menu', 'keydown', t._keyHandler);
				DOM.hide(t.id + '_menu');
			}

			t.onHideMenu.dispatch(t);

			t.isMenuVisible = 0;
		},

		renderMenu : function() {
			var t = this, m, i = 0, s = t.settings, n, tb, tr, w;

			w = DOM.add(s.menu_container, 'div', {id : t.id + '_menu', 'class' : s['menu_class'] + ' ' + s['class'], style : 'position:absolute;left:0;top:-1000px;'});
			m = DOM.add(w, 'div', {'class' : s['class'] + ' mceSplitButtonMenu'});
			DOM.add(m, 'span', {'class' : 'mceMenuLine'});

			n = DOM.add(m, 'table', {'class' : 'mceColorSplitMenu'});
			tb = DOM.add(n, 'tbody');

			// Generate color grid
			i = 0;
			each(is(s.colors, 'array') ? s.colors : s.colors.split(','), function(c) {
				c = c.replace(/^#/, '');

				if (!i--) {
					tr = DOM.add(tb, 'tr');
					i = s.grid_width - 1;
				}

				n = DOM.add(tr, 'td');

				n = DOM.add(n, 'a', {
					href : 'javascript:;',
					style : {
						backgroundColor : '#' + c
					},
					_mce_color : '#' + c
				});
			});

			if (s.more_colors_func) {
				n = DOM.add(tb, 'tr');
				n = DOM.add(n, 'td', {colspan : s.grid_width, 'class' : 'mceMoreColors'});
				n = DOM.add(n, 'a', {id : t.id + '_more', href : 'javascript:;', onclick : 'return false;', 'class' : 'mceMoreColors'}, s.more_colors_title);

				Event.add(n, 'click', function(e) {
					s.more_colors_func.call(s.more_colors_scope || this);
					return Event.cancel(e); // Cancel to fix onbeforeunload problem
				});
			}

			DOM.addClass(m, 'mceColorSplitMenu');

			Event.add(t.id + '_menu', 'click', function(e) {
				var c;

				e = e.target;

				if (e.nodeName == 'A' && (c = e.getAttribute('_mce_color')))
					t.setColor(c);

				return Event.cancel(e); // Prevent IE auto save warning
			});

			return w;
		},

		setColor : function(c) {
			var t = this;

			DOM.setStyle(t.id + '_preview', 'backgroundColor', c);

			t.value = c;
			t.hideMenu();
			t.settings.onselect(c);
		},

		postRender : function() {
			var t = this, id = t.id;

			t.parent();
			DOM.add(id + '_action', 'div', {id : id + '_preview', 'class' : 'mceColorPreview'});
			DOM.setStyle(t.id + '_preview', 'backgroundColor', t.value);
		},

		destroy : function() {
			this.parent();

			Event.clear(this.id + '_menu');
			Event.clear(this.id + '_more');
			DOM.remove(this.id + '_menu');
		}
	});
})(tinymce);

tinymce.create('tinymce.ui.Toolbar:tinymce.ui.Container', {
	renderHTML : function() {
		var t = this, h = '', c, co, dom = tinymce.DOM, s = t.settings, i, pr, nx, cl;

		cl = t.controls;
		for (i=0; i<cl.length; i++) {
			// Get current control, prev control, next control and if the control is a list box or not
			co = cl[i];
			pr = cl[i - 1];
			nx = cl[i + 1];

			// Add toolbar start
			if (i === 0) {
				c = 'mceToolbarStart';

				if (co.Button)
					c += ' mceToolbarStartButton';
				else if (co.SplitButton)
					c += ' mceToolbarStartSplitButton';
				else if (co.ListBox)
					c += ' mceToolbarStartListBox';

				h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Add toolbar end before list box and after the previous button
			// This is to fix the o2k7 editor skins
			if (pr && co.ListBox) {
				if (pr.Button || pr.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarEnd'}, dom.createHTML('span', null, '<!-- IE -->'));
			}

			// Render control HTML

			// IE 8 quick fix, needed to propertly generate a hit area for anchors
			if (dom.stdMode)
				h += '<td style="position: relative">' + co.renderHTML() + '</td>';
			else
				h += '<td>' + co.renderHTML() + '</td>';

			// Add toolbar start after list box and before the next button
			// This is to fix the o2k7 editor skins
			if (nx && co.ListBox) {
				if (nx.Button || nx.SplitButton)
					h += dom.createHTML('td', {'class' : 'mceToolbarStart'}, dom.createHTML('span', null, '<!-- IE -->'));
			}
		}

		c = 'mceToolbarEnd';

		if (co.Button)
			c += ' mceToolbarEndButton';
		else if (co.SplitButton)
			c += ' mceToolbarEndSplitButton';
		else if (co.ListBox)
			c += ' mceToolbarEndListBox';

		h += dom.createHTML('td', {'class' : c}, dom.createHTML('span', null, '<!-- IE -->'));

		return dom.createHTML('table', {id : t.id, 'class' : 'mceToolbar' + (s['class'] ? ' ' + s['class'] : ''), cellpadding : '0', cellspacing : '0', align : t.settings.align || ''}, '<tbody><tr>' + h + '</tr></tbody>');
	}
});

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each;

	tinymce.create('tinymce.AddOnManager', {
		AddOnManager : function() {
			var self = this;

			self.items = [];
			self.urls = {};
			self.lookup = {};
			self.onAdd = new Dispatcher(self);
		},

		get : function(n) {
			return this.lookup[n];
		},

		requireLangPack : function(n) {
			var s = tinymce.settings;

			if (s && s.language)
				tinymce.ScriptLoader.add(this.urls[n] + '/langs/' + s.language + '.js');
		},

		add : function(id, o) {
			this.items.push(o);
			this.lookup[id] = o;
			this.onAdd.dispatch(this, id, o);

			return o;
		},

		load : function(n, u, cb, s) {
			var t = this;

			if (t.urls[n])
				return;

			if (u.indexOf('/') != 0 && u.indexOf('://') == -1)
				u = tinymce.baseURL + '/' +  u;

			t.urls[n] = u.substring(0, u.lastIndexOf('/'));

			if (!t.lookup[n])
				tinymce.ScriptLoader.add(u, cb, s);
		}
	});

	// Create plugin and theme managers
	tinymce.PluginManager = new tinymce.AddOnManager();
	tinymce.ThemeManager = new tinymce.AddOnManager();
}(tinymce));

(function(tinymce) {
	// Shorten names
	var each = tinymce.each, extend = tinymce.extend,
		DOM = tinymce.DOM, Event = tinymce.dom.Event,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		explode = tinymce.explode,
		Dispatcher = tinymce.util.Dispatcher, undefined, instanceCounter = 0;

	// Setup some URLs where the editor API is located and where the document is
	tinymce.documentBaseURL = window.location.href.replace(/[\?#].*$/, '').replace(/[\/\\][^\/]+$/, '');
	if (!/[\/\\]$/.test(tinymce.documentBaseURL))
		tinymce.documentBaseURL += '/';

	tinymce.baseURL = new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);

	tinymce.baseURI = new tinymce.util.URI(tinymce.baseURL);

	// Add before unload listener
	// This was required since IE was leaking memory if you added and removed beforeunload listeners
	// with attachEvent/detatchEvent so this only adds one listener and instances can the attach to the onBeforeUnload event
	tinymce.onBeforeUnload = new Dispatcher(tinymce);

	// Must be on window or IE will leak if the editor is placed in frame or iframe
	Event.add(window, 'beforeunload', function(e) {
		tinymce.onBeforeUnload.dispatch(tinymce, e);
	});

	tinymce.onAddEditor = new Dispatcher(tinymce);

	tinymce.onRemoveEditor = new Dispatcher(tinymce);

	tinymce.EditorManager = extend(tinymce, {
		editors : [],

		i18n : {},

		activeEditor : null,

		init : function(s) {
			var t = this, pl, sl = tinymce.ScriptLoader, e, el = [], ed;

			function execCallback(se, n, s) {
				var f = se[n];

				if (!f)
					return;

				if (tinymce.is(f, 'string')) {
					s = f.replace(/\.\w+$/, '');
					s = s ? tinymce.resolve(s) : 0;
					f = tinymce.resolve(f);
				}

				return f.apply(s || this, Array.prototype.slice.call(arguments, 2));
			};

			s = extend({
				theme : "simple",
				language : "en"
			}, s);

			t.settings = s;

			// Legacy call
			Event.add(document, 'init', function() {
				var l, co;

				execCallback(s, 'onpageload');

				switch (s.mode) {
					case "exact":
						l = s.elements || '';

						if(l.length > 0) {
							each(explode(l), function(v) {
								if (DOM.get(v)) {
									ed = new tinymce.Editor(v, s);
									el.push(ed);
									ed.render(1);
								} else {
									each(document.forms, function(f) {
										each(f.elements, function(e) {
											if (e.name === v) {
												v = 'mce_editor_' + instanceCounter++;
												DOM.setAttrib(e, 'id', v);

												ed = new tinymce.Editor(v, s);
												el.push(ed);
												ed.render(1);
											}
										});
									});
								}
							});
						}
						break;

					case "textareas":
					case "specific_textareas":
						function hasClass(n, c) {
							return c.constructor === RegExp ? c.test(n.className) : DOM.hasClass(n, c);
						};

						each(DOM.select('textarea'), function(v) {
							if (s.editor_deselector && hasClass(v, s.editor_deselector))
								return;

							if (!s.editor_selector || hasClass(v, s.editor_selector)) {
								// Can we use the name
								e = DOM.get(v.name);
								if (!v.id && !e)
									v.id = v.name;

								// Generate unique name if missing or already exists
								if (!v.id || t.get(v.id))
									v.id = DOM.uniqueId();

								ed = new tinymce.Editor(v.id, s);
								el.push(ed);
								ed.render(1);
							}
						});
						break;
				}

				// Call onInit when all editors are initialized
				if (s.oninit) {
					l = co = 0;

					each(el, function(ed) {
						co++;

						if (!ed.initialized) {
							// Wait for it
							ed.onInit.add(function() {
								l++;

								// All done
								if (l == co)
									execCallback(s, 'oninit');
							});
						} else
							l++;

						// All done
						if (l == co)
							execCallback(s, 'oninit');					
					});
				}
			});
		},

		get : function(id) {
			if (id === undefined)
				return this.editors;

			return this.editors[id];
		},

		getInstanceById : function(id) {
			return this.get(id);
		},

		add : function(editor) {
			var self = this, editors = self.editors;

			// Add named and index editor instance
			editors[editor.id] = editor;
			editors.push(editor);

			self._setActive(editor);
			self.onAddEditor.dispatch(self, editor);


			// Patch the tinymce.Editor instance with jQuery adapter logic
			if (tinymce.adapter)
				tinymce.adapter.patchEditor(editor);


			return editor;
		},

		remove : function(editor) {
			var t = this, i, editors = t.editors;

			// Not in the collection
			if (!editors[editor.id])
				return null;

			delete editors[editor.id];

			for (i = 0; i < editors.length; i++) {
				if (editors[i] == editor) {
					editors.splice(i, 1);
					break;
				}
			}

			// Select another editor since the active one was removed
			if (t.activeEditor == editor)
				t._setActive(editors[0]);

			editor.destroy();
			t.onRemoveEditor.dispatch(t, editor);

			return editor;
		},

		execCommand : function(c, u, v) {
			var t = this, ed = t.get(v), w;

			// Manager commands
			switch (c) {
				case "mceFocus":
					ed.focus();
					return true;

				case "mceAddEditor":
				case "mceAddControl":
					if (!t.get(v))
						new tinymce.Editor(v, t.settings).render();

					return true;

				case "mceAddFrameControl":
					w = v.window;

					// Add tinyMCE global instance and tinymce namespace to specified window
					w.tinyMCE = tinyMCE;
					w.tinymce = tinymce;

					tinymce.DOM.doc = w.document;
					tinymce.DOM.win = w;

					ed = new tinymce.Editor(v.element_id, v);
					ed.render();

					// Fix IE memory leaks
					if (tinymce.isIE) {
						function clr() {
							ed.destroy();
							w.detachEvent('onunload', clr);
							w = w.tinyMCE = w.tinymce = null; // IE leak
						};

						w.attachEvent('onunload', clr);
					}

					v.page_window = null;

					return true;

				case "mceRemoveEditor":
				case "mceRemoveControl":
					if (ed)
						ed.remove();

					return true;

				case 'mceToggleEditor':
					if (!ed) {
						t.execCommand('mceAddControl', 0, v);
						return true;
					}

					if (ed.isHidden())
						ed.show();
					else
						ed.hide();

					return true;
			}

			// Run command on active editor
			if (t.activeEditor)
				return t.activeEditor.execCommand(c, u, v);

			return false;
		},

		execInstanceCommand : function(id, c, u, v) {
			var ed = this.get(id);

			if (ed)
				return ed.execCommand(c, u, v);

			return false;
		},

		triggerSave : function() {
			each(this.editors, function(e) {
				e.save();
			});
		},

		addI18n : function(p, o) {
			var lo, i18n = this.i18n;

			if (!tinymce.is(p, 'string')) {
				each(p, function(o, lc) {
					each(o, function(o, g) {
						each(o, function(o, k) {
							if (g === 'common')
								i18n[lc + '.' + k] = o;
							else
								i18n[lc + '.' + g + '.' + k] = o;
						});
					});
				});
			} else {
				each(o, function(o, k) {
					i18n[p + '.' + k] = o;
				});
			}
		},

		// Private methods

		_setActive : function(editor) {
			this.selectedInstance = this.activeEditor = editor;
		}
	});
})(tinymce);

(function(tinymce) {
	// Shorten these names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, extend = tinymce.extend,
		Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isGecko = tinymce.isGecko,
		isIE = tinymce.isIE, isWebKit = tinymce.isWebKit, is = tinymce.is,
		ThemeManager = tinymce.ThemeManager, PluginManager = tinymce.PluginManager,
		inArray = tinymce.inArray, grep = tinymce.grep, explode = tinymce.explode;

	tinymce.create('tinymce.Editor', {
		Editor : function(id, s) {
			var t = this;

			t.id = t.editorId = id;

			t.execCommands = {};
			t.queryStateCommands = {};
			t.queryValueCommands = {};

			t.isNotDirty = false;

			t.plugins = {};

			// Add events to the editor
			each([
				'onPreInit',

				'onBeforeRenderUI',

				'onPostRender',

				'onInit',

				'onRemove',

				'onActivate',

				'onDeactivate',

				'onClick',

				'onEvent',

				'onMouseUp',

				'onMouseDown',

				'onDblClick',

				'onKeyDown',

				'onKeyUp',

				'onKeyPress',

				'onContextMenu',

				'onSubmit',

				'onReset',

				'onPaste',

				'onPreProcess',

				'onPostProcess',

				'onBeforeSetContent',

				'onBeforeGetContent',

				'onSetContent',

				'onGetContent',

				'onLoadContent',

				'onSaveContent',

				'onNodeChange',

				'onChange',

				'onBeforeExecCommand',

				'onExecCommand',

				'onUndo',

				'onRedo',

				'onVisualAid',

				'onSetProgressState'
			], function(e) {
				t[e] = new Dispatcher(t);
			});

			t.settings = s = extend({
				id : id,
				language : 'en',
				docs_language : 'en',
				theme : 'simple',
				skin : 'default',
				delta_width : 0,
				delta_height : 0,
				popup_css : '',
				plugins : '',
				document_base_url : tinymce.documentBaseURL,
				add_form_submit_trigger : 1,
				submit_patch : 1,
				add_unload_trigger : 1,
				convert_urls : 1,
				relative_urls : 1,
				remove_script_host : 1,
				table_inline_editing : 0,
				object_resizing : 1,
				cleanup : 1,
				accessibility_focus : 1,
				custom_shortcuts : 1,
				custom_undo_redo_keyboard_shortcuts : 1,
				custom_undo_redo_restore_selection : 1,
				custom_undo_redo : 1,
				doctype : tinymce.isIE6 ? '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">' : '<!DOCTYPE>', // Use old doctype on IE 6 to avoid horizontal scroll
				visual_table_class : 'mceItemTable',
				visual : 1,
				font_size_style_values : 'xx-small,x-small,small,medium,large,x-large,xx-large',
				apply_source_formatting : 1,
				directionality : 'ltr',
				forced_root_block : 'p',
				valid_elements : '@[id|class|style|title|dir<ltr?rtl|lang|xml::lang|onclick|ondblclick|onmousedown|onmouseup|onmouseover|onmousemove|onmouseout|onkeypress|onkeydown|onkeyup],a[rel|rev|charset|hreflang|tabindex|accesskey|type|name|href|target|title|class|onfocus|onblur],strong/b,em/i,strike,u,#p,-ol[type|compact],-ul[type|compact],-li,br,img[longdesc|usemap|src|border|alt=|title|hspace|vspace|width|height|align],-sub,-sup,-blockquote[cite],-table[border|cellspacing|cellpadding|width|frame|rules|height|align|summary|bgcolor|background|bordercolor],-tr[rowspan|width|height|align|valign|bgcolor|background|bordercolor],tbody,thead,tfoot,#td[colspan|rowspan|width|height|align|valign|bgcolor|background|bordercolor|scope],#th[colspan|rowspan|width|height|align|valign|scope],caption,-div,-span,-code,-pre,address,-h1,-h2,-h3,-h4,-h5,-h6,hr[size|noshade],-font[face|size|color],dd,dl,dt,cite,abbr,acronym,del[datetime|cite],ins[datetime|cite],object[classid|width|height|codebase|*],param[name|value],embed[type|width|height|src|*],script[src|type],map[name],area[shape|coords|href|alt|target],bdo,button,col[align|char|charoff|span|valign|width],colgroup[align|char|charoff|span|valign|width],dfn,fieldset,form[action|accept|accept-charset|enctype|method],input[accept|alt|checked|disabled|maxlength|name|readonly|size|src|type|value|tabindex|accesskey],kbd,label[for],legend,noscript,optgroup[label|disabled],option[disabled|label|selected|value],q[cite],samp,select[disabled|multiple|name|size],small,textarea[cols|rows|disabled|name|readonly],tt,var,big',
				hidden_input : 1,
				padd_empty_editor : 1,
				render_ui : 1,
				init_theme : 1,
				force_p_newlines : 1,
				indentation : '30px',
				keep_styles : 1,
				fix_table_elements : 1,
				inline_styles : 1,
				convert_fonts_to_spans : true
			}, s);

			t.documentBaseURI = new tinymce.util.URI(s.document_base_url || tinymce.documentBaseURL, {
				base_uri : tinyMCE.baseURI
			});

			t.baseURI = tinymce.baseURI;

			// Call setup
			t.execCallback('setup', t);
		},

		render : function(nst) {
			var t = this, s = t.settings, id = t.id, sl = tinymce.ScriptLoader;

			// Page is not loaded yet, wait for it
			if (!Event.domLoaded) {
				Event.add(document, 'init', function() {
					t.render();
				});
				return;
			}

			tinyMCE.settings = s;

			// Element not found, then skip initialization
			if (!t.getElement())
				return;

			// Is a iPad/iPhone, then skip initialization. We need to sniff here since the
			// browser says it has contentEditable support but there is no visible caret
			// We will remove this check ones Apple implements full contentEditable support
			if (tinymce.isIDevice)
				return;

			// Add hidden input for non input elements inside form elements
			if (!/TEXTAREA|INPUT/i.test(t.getElement().nodeName) && s.hidden_input && DOM.getParent(id, 'form'))
				DOM.insertAfter(DOM.create('input', {type : 'hidden', name : id}), id);

			if (tinymce.WindowManager)
				t.windowManager = new tinymce.WindowManager(t);

			if (s.encoding == 'xml') {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = DOM.encode(o.content);
				});
			}

			if (s.add_form_submit_trigger) {
				t.onSubmit.addToTop(function() {
					if (t.initialized) {
						t.save();
						t.isNotDirty = 1;
					}
				});
			}

			if (s.add_unload_trigger) {
				t._beforeUnload = tinyMCE.onBeforeUnload.add(function() {
					if (t.initialized && !t.destroyed && !t.isHidden())
						t.save({format : 'raw', no_events : true});
				});
			}

			tinymce.addUnload(t.destroy, t);

			if (s.submit_patch) {
				t.onBeforeRenderUI.add(function() {
					var n = t.getElement().form;

					if (!n)
						return;

					// Already patched
					if (n._mceOldSubmit)
						return;

					// Check page uses id="submit" or name="submit" for it's submit button
					if (!n.submit.nodeType && !n.submit.length) {
						t.formElement = n;
						n._mceOldSubmit = n.submit;
						n.submit = function() {
							// Save all instances
							tinymce.triggerSave();
							t.isNotDirty = 1;

							return t.formElement._mceOldSubmit(t.formElement);
						};
					}

					n = null;
				});
			}

			// Load scripts
			function loadScripts() {
				if (s.language)
					sl.add(tinymce.baseURL + '/langs/' + s.language + '.js');

				if (s.theme && s.theme.charAt(0) != '-' && !ThemeManager.urls[s.theme])
					ThemeManager.load(s.theme, 'themes/' + s.theme + '/editor_template' + tinymce.suffix + '.js');

				each(explode(s.plugins), function(p) {
					if (p && p.charAt(0) != '-' && !PluginManager.urls[p]) {
						// Skip safari plugin, since it is removed as of 3.3b1
						if (p == 'safari')
							return;

						PluginManager.load(p, 'plugins/' + p + '/editor_plugin' + tinymce.suffix + '.js');
					}
				});

				// Init when que is loaded
				sl.loadQueue(function() {
					if (!t.removed)
						t.init();
				});
			};

			loadScripts();
		},

		init : function() {
			var n, t = this, s = t.settings, w, h, e = t.getElement(), o, ti, u, bi, bc, re;

			tinymce.add(t);

			if (s.theme) {
				s.theme = s.theme.replace(/-/, '');
				o = ThemeManager.get(s.theme);
				t.theme = new o();

				if (t.theme.init && s.init_theme)
					t.theme.init(t, ThemeManager.urls[s.theme] || tinymce.documentBaseURL.replace(/\/$/, ''));
			}

			// Create all plugins
			each(explode(s.plugins.replace(/\-/g, '')), function(p) {
				var c = PluginManager.get(p), u = PluginManager.urls[p] || tinymce.documentBaseURL.replace(/\/$/, ''), po;

				if (c) {
					po = new c(t, u);

					t.plugins[p] = po;

					if (po.init)
						po.init(t, u);
				}
			});

			// Setup popup CSS path(s)
			if (s.popup_css !== false) {
				if (s.popup_css)
					s.popup_css = t.documentBaseURI.toAbsolute(s.popup_css);
				else
					s.popup_css = t.baseURI.toAbsolute("themes/" + s.theme + "/skins/" + s.skin + "/dialog.css");
			}

			if (s.popup_css_add)
				s.popup_css += ',' + t.documentBaseURI.toAbsolute(s.popup_css_add);

			t.controlManager = new tinymce.ControlManager(t);

			if (s.custom_undo_redo) {
				// Add initial undo level
				t.onBeforeExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo)) {
						if (!t.undoManager.hasUndo())
							t.undoManager.add();
					}
				});

				t.onExecCommand.add(function(ed, cmd, ui, val, a) {
					if (cmd != 'Undo' && cmd != 'Redo' && cmd != 'mceRepaint' && (!a || !a.skip_undo))
						t.undoManager.add();
				});
			}

			t.onExecCommand.add(function(ed, c) {
				// Don't refresh the select lists until caret move
				if (!/^(FontName|FontSize)$/.test(c))
					t.nodeChanged();
			});

			// Remove ghost selections on images and tables in Gecko
			if (isGecko) {
				function repaint(a, o) {
					if (!o || !o.initial)
						t.execCommand('mceRepaint');
				};

				t.onUndo.add(repaint);
				t.onRedo.add(repaint);
				t.onSetContent.add(repaint);
			}

			// Enables users to override the control factory
			t.onBeforeRenderUI.dispatch(t, t.controlManager);

			// Measure box
			if (s.render_ui) {
				w = s.width || e.style.width || e.offsetWidth;
				h = s.height || e.style.height || e.offsetHeight;
				t.orgDisplay = e.style.display;
				re = /^[0-9\.]+(|px)$/i;

				if (re.test('' + w))
					w = Math.max(parseInt(w) + (o.deltaWidth || 0), 100);

				if (re.test('' + h))
					h = Math.max(parseInt(h) + (o.deltaHeight || 0), 100);

				// Render UI
				o = t.theme.renderUI({
					targetNode : e,
					width : w,
					height : h,
					deltaWidth : s.delta_width,
					deltaHeight : s.delta_height
				});

				t.editorContainer = o.editorContainer;
			}


			// User specified a document.domain value
			if (document.domain && location.hostname != document.domain)
				tinymce.relaxedDomain = document.domain;

			// Resize editor
			DOM.setStyles(o.sizeContainer || o.editorContainer, {
				width : w,
				height : h
			});

			h = (o.iframeHeight || h) + (typeof(h) == 'number' ? (o.deltaHeight || 0) : '');
			if (h < 100)
				h = 100;

			t.iframeHTML = s.doctype + '<html><head xmlns="http://www.w3.org/1999/xhtml">';

			// We only need to override paths if we have to
			// IE has a bug where it remove site absolute urls to relative ones if this is specified
			if (s.document_base_url != tinymce.documentBaseURL)
				t.iframeHTML += '<base href="' + t.documentBaseURI.getURI() + '" />';

			t.iframeHTML += '<meta http-equiv="X-UA-Compatible" content="IE=7" /><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />';

			if (tinymce.relaxedDomain)
				t.iframeHTML += '<script type="text/javascript">document.domain = "' + tinymce.relaxedDomain + '";</script>';

			bi = s.body_id || 'tinymce';
			if (bi.indexOf('=') != -1) {
				bi = t.getParam('body_id', '', 'hash');
				bi = bi[t.id] || bi;
			}

			bc = s.body_class || '';
			if (bc.indexOf('=') != -1) {
				bc = t.getParam('body_class', '', 'hash');
				bc = bc[t.id] || '';
			}

			t.iframeHTML += '</head><body id="' + bi + '" class="mceContentBody ' + bc + '"></body></html>';

			// Domain relaxing enabled, then set document domain
			if (tinymce.relaxedDomain) {
				// We need to write the contents here in IE since multiple writes messes up refresh button and back button
				if (isIE || (tinymce.isOpera && parseFloat(opera.version()) >= 9.5))
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";var ed = window.parent.tinyMCE.get("' + t.id + '");document.write(ed.iframeHTML);document.close();ed.setupIframe();})()';
				else if (tinymce.isOpera)
					u = 'javascript:(function(){document.open();document.domain="' + document.domain + '";document.close();ed.setupIframe();})()';					
			}

			// Create iframe
			n = DOM.add(o.iframeContainer, 'iframe', {
				id : t.id + "_ifr",
				src : u || 'javascript:""', // Workaround for HTTPS warning in IE6/7
				frameBorder : '0',
				style : {
					width : '100%',
					height : h
				}
			});

			t.contentAreaContainer = o.iframeContainer;
			DOM.get(o.editorContainer).style.display = t.orgDisplay;
			DOM.get(t.id).style.display = 'none';

			if (!isIE || !tinymce.relaxedDomain)
				t.setupIframe();

			e = n = o = null; // Cleanup
		},

		setupIframe : function() {
			var t = this, s = t.settings, e = DOM.get(t.id), d = t.getDoc(), h, b;

			// Setup iframe body
			if (!isIE || !tinymce.relaxedDomain) {
				d.open();
				d.write(t.iframeHTML);
				d.close();
			}

			// Design mode needs to be added here Ctrl+A will fail otherwise
			if (!isIE) {
				try {
					if (!s.readonly)
						d.designMode = 'On';
				} catch (ex) {
					// Will fail on Gecko if the editor is placed in an hidden container element
					// The design mode will be set ones the editor is focused
				}
			}

			// IE needs to use contentEditable or it will display non secure items for HTTPS
			if (isIE) {
				// It will not steal focus if we hide it while setting contentEditable
				b = t.getBody();
				DOM.hide(b);

				if (!s.readonly)
					b.contentEditable = true;

				DOM.show(b);
			}

			t.dom = new tinymce.dom.DOMUtils(t.getDoc(), {
				keep_values : true,
				url_converter : t.convertURL,
				url_converter_scope : t,
				hex_colors : s.force_hex_style_colors,
				class_filter : s.class_filter,
				update_styles : 1,
				fix_ie_paragraphs : 1,
				valid_styles : s.valid_styles
			});

			t.schema = new tinymce.dom.Schema();

			t.serializer = new tinymce.dom.Serializer(extend(s, {
				valid_elements : s.verify_html === false ? '*[*]' : s.valid_elements,
				dom : t.dom,
				schema : t.schema
			}));

			t.selection = new tinymce.dom.Selection(t.dom, t.getWin(), t.serializer);

			t.formatter = new tinymce.Formatter(this);

			// Register default formats
			t.formatter.register({
				alignleft : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'left'}},
					{selector : 'img,table', styles : {'float' : 'left'}}
				],

				aligncenter : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'center'}},
					{selector : 'img', styles : {display : 'block', marginLeft : 'auto', marginRight : 'auto'}},
					{selector : 'table', styles : {marginLeft : 'auto', marginRight : 'auto'}}
				],

				alignright : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'right'}},
					{selector : 'img,table', styles : {'float' : 'right'}}
				],

				alignfull : [
					{selector : 'p,h1,h2,h3,h4,h5,h6,td,th,div,ul,ol,li', styles : {textAlign : 'justify'}}
				],

				bold : [
					{inline : 'strong'},
					{inline : 'span', styles : {fontWeight : 'bold'}},
					{inline : 'b'}
				],

				italic : [
					{inline : 'em'},
					{inline : 'span', styles : {fontStyle : 'italic'}},
					{inline : 'i'}
				],

				underline : [
					{inline : 'span', styles : {textDecoration : 'underline'}, exact : true},
					{inline : 'u'}
				],

				strikethrough : [
					{inline : 'span', styles : {textDecoration : 'line-through'}, exact : true},
					{inline : 'u'}
				],

				forecolor : {inline : 'span', styles : {color : '%value'}},
				hilitecolor : {inline : 'span', styles : {backgroundColor : '%value'}},
				fontname : {inline : 'span', styles : {fontFamily : '%value'}},
				fontsize : {inline : 'span', styles : {fontSize : '%value'}},
				fontsize_class : {inline : 'span', attributes : {'class' : '%value'}},
				blockquote : {block : 'blockquote', wrapper : 1, remove : 'all'},

				removeformat : [
					{selector : 'b,strong,em,i,font,u,strike', remove : 'all', split : true, expand : false, block_expand : true, deep : true},
					{selector : 'span', attributes : ['style', 'class'], remove : 'empty', split : true, expand : false, deep : true},
					{selector : '*', attributes : ['style', 'class'], split : false, expand : false, deep : true}
				]
			});

			// Register default block formats
			each('p h1 h2 h3 h4 h5 h6 div address pre div code dt dd samp'.split(/\s/), function(name) {
				t.formatter.register(name, {block : name, remove : 'all'});
			});

			// Register user defined formats
			t.formatter.register(t.settings.formats);

			t.undoManager = new tinymce.UndoManager(t);

			// Pass through
			t.undoManager.onAdd.add(function(um, l) {
				if (!l.initial)
					return t.onChange.dispatch(t, l, um);
			});

			t.undoManager.onUndo.add(function(um, l) {
				return t.onUndo.dispatch(t, l, um);
			});

			t.undoManager.onRedo.add(function(um, l) {
				return t.onRedo.dispatch(t, l, um);
			});

			t.forceBlocks = new tinymce.ForceBlocks(t, {
				forced_root_block : s.forced_root_block
			});

			t.editorCommands = new tinymce.EditorCommands(t);

			// Pass through
			t.serializer.onPreProcess.add(function(se, o) {
				return t.onPreProcess.dispatch(t, o, se);
			});

			t.serializer.onPostProcess.add(function(se, o) {
				return t.onPostProcess.dispatch(t, o, se);
			});

			t.onPreInit.dispatch(t);

			if (!s.gecko_spellcheck)
				t.getBody().spellcheck = 0;

			if (!s.readonly)
				t._addEvents();

			t.controlManager.onPostRender.dispatch(t, t.controlManager);
			t.onPostRender.dispatch(t);

			if (s.directionality)
				t.getBody().dir = s.directionality;

			if (s.nowrap)
				t.getBody().style.whiteSpace = "nowrap";

			if (s.custom_elements) {
				function handleCustom(ed, o) {
					each(explode(s.custom_elements), function(v) {
						var n;

						if (v.indexOf('~') === 0) {
							v = v.substring(1);
							n = 'span';
						} else
							n = 'div';

						o.content = o.content.replace(new RegExp('<(' + v + ')([^>]*)>', 'g'), '<' + n + ' _mce_name="$1"$2>');
						o.content = o.content.replace(new RegExp('</(' + v + ')>', 'g'), '</' + n + '>');
					});
				};

				t.onBeforeSetContent.add(handleCustom);
				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						handleCustom(ed, o);
				});
			}

			if (s.handle_node_change_callback) {
				t.onNodeChange.add(function(ed, cm, n) {
					t.execCallback('handle_node_change_callback', t.id, n, -1, -1, true, t.selection.isCollapsed());
				});
			}

			if (s.save_callback) {
				t.onSaveContent.add(function(ed, o) {
					var h = t.execCallback('save_callback', t.id, o.content, t.getBody());

					if (h)
						o.content = h;
				});
			}

			if (s.onchange_callback) {
				t.onChange.add(function(ed, l) {
					t.execCallback('onchange_callback', t, l);
				});
			}

			if (s.convert_newlines_to_brs) {
				t.onBeforeSetContent.add(function(ed, o) {
					if (o.initial)
						o.content = o.content.replace(/\r?\n/g, '<br />');
				});
			}

			if (s.fix_nesting && isIE) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t._fixNesting(o.content);
				});
			}

			if (s.preformatted) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^\s*<pre.*?>/, '');
					o.content = o.content.replace(/<\/pre>\s*$/, '');

					if (o.set)
						o.content = '<pre class="mceItemHidden">' + o.content + '</pre>';
				});
			}

			if (s.verify_css_classes) {
				t.serializer.attribValueFilter = function(n, v) {
					var s, cl;

					if (n == 'class') {
						// Build regexp for classes
						if (!t.classesRE) {
							cl = t.dom.getClasses();

							if (cl.length > 0) {
								s = '';

								each (cl, function(o) {
									s += (s ? '|' : '') + o['class'];
								});

								t.classesRE = new RegExp('(' + s + ')', 'gi');
							}
						}

						return !t.classesRE || /(\bmceItem\w+\b|\bmceTemp\w+\b)/g.test(v) || t.classesRE.test(v) ? v : '';
					}

					return v;
				};
			}

			if (s.cleanup_callback) {
				t.onBeforeSetContent.add(function(ed, o) {
					o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);
				});

				t.onPreProcess.add(function(ed, o) {
					if (o.set)
						t.execCallback('cleanup_callback', 'insert_to_editor_dom', o.node, o);

					if (o.get)
						t.execCallback('cleanup_callback', 'get_from_editor_dom', o.node, o);
				});

				t.onPostProcess.add(function(ed, o) {
					if (o.set)
						o.content = t.execCallback('cleanup_callback', 'insert_to_editor', o.content, o);

					if (o.get)						
						o.content = t.execCallback('cleanup_callback', 'get_from_editor', o.content, o);
				});
			}

			if (s.save_callback) {
				t.onGetContent.add(function(ed, o) {
					if (o.save)
						o.content = t.execCallback('save_callback', t.id, o.content, t.getBody());
				});
			}

			if (s.handle_event_callback) {
				t.onEvent.add(function(ed, e, o) {
					if (t.execCallback('handle_event_callback', e, ed, o) === false)
						Event.cancel(e);
				});
			}

			// Add visual aids when new contents is added
			t.onSetContent.add(function() {
				t.addVisual(t.getBody());
			});

			// Remove empty contents
			if (s.padd_empty_editor) {
				t.onPostProcess.add(function(ed, o) {
					o.content = o.content.replace(/^(<p[^>]*>(&nbsp;|&#160;|\s|\u00a0|)<\/p>[\r\n]*|<br \/>[\r\n]*)$/, '');
				});
			}

			if (isGecko) {
				// Fix gecko link bug, when a link is placed at the end of block elements there is
				// no way to move the caret behind the link. This fix adds a bogus br element after the link
				function fixLinks(ed, o) {
					each(ed.dom.select('a'), function(n) {
						var pn = n.parentNode;

						if (ed.dom.isBlock(pn) && pn.lastChild === n)
							ed.dom.add(pn, 'br', {'_mce_bogus' : 1});
					});
				};

				t.onExecCommand.add(function(ed, cmd) {
					if (cmd === 'CreateLink')
						fixLinks(ed);
				});

				t.onSetContent.add(t.selection.onSetContent.add(fixLinks));

				if (!s.readonly) {
					try {
						// Design mode must be set here once again to fix a bug where
						// Ctrl+A/Delete/Backspace didn't work if the editor was added using mceAddControl then removed then added again
						d.designMode = 'Off';
						d.designMode = 'On';
					} catch (ex) {
						// Will fail on Gecko if the editor is placed in an hidden container element
						// The design mode will be set ones the editor is focused
					}
				}
			}

			// A small timeout was needed since firefox will remove. Bug: #1838304
			setTimeout(function () {
				if (t.removed)
					return;

				t.load({initial : true, format : (s.cleanup_on_startup ? 'html' : 'raw')});
				t.startContent = t.getContent({format : 'raw'});
				t.initialized = true;

				t.onInit.dispatch(t);
				t.execCallback('setupcontent_callback', t.id, t.getBody(), t.getDoc());
				t.execCallback('init_instance_callback', t);
				t.focus(true);
				t.nodeChanged({initial : 1});

				// Load specified content CSS last
				if (s.content_css) {
					tinymce.each(explode(s.content_css), function(u) {
						t.dom.loadCSS(t.documentBaseURI.toAbsolute(u));
					});
				}

				// Handle auto focus
				if (s.auto_focus) {
					setTimeout(function () {
						var ed = tinymce.get(s.auto_focus);

						ed.selection.select(ed.getBody(), 1);
						ed.selection.collapse(1);
						ed.getWin().focus();
					}, 100);
				}
			}, 1);
	
			e = null;
		},


		focus : function(sf) {
			var oed, t = this, ce = t.settings.content_editable, ieRng, controlElm, doc = t.getDoc();

			if (!sf) {
				// Get selected control element
				ieRng = t.selection.getRng();
				if (ieRng.item) {
					controlElm = ieRng.item(0);
				}

				// Is not content editable
				if (!ce)
					t.getWin().focus();

				// Restore selected control element
				// This is needed when for example an image is selected within a
				// layer a call to focus will then remove the control selection
				if (controlElm && controlElm.ownerDocument == doc) {
					ieRng = doc.body.createControlRange();
					ieRng.addElement(controlElm);
					ieRng.select();
				}

			}

			if (tinymce.activeEditor != t) {
				if ((oed = tinymce.activeEditor) != null)
					oed.onDeactivate.dispatch(oed, t);

				t.onActivate.dispatch(t, oed);
			}

			tinymce._setActive(t);
		},

		execCallback : function(n) {
			var t = this, f = t.settings[n], s;

			if (!f)
				return;

			// Look through lookup
			if (t.callbackLookup && (s = t.callbackLookup[n])) {
				f = s.func;
				s = s.scope;
			}

			if (is(f, 'string')) {
				s = f.replace(/\.\w+$/, '');
				s = s ? tinymce.resolve(s) : 0;
				f = tinymce.resolve(f);
				t.callbackLookup = t.callbackLookup || {};
				t.callbackLookup[n] = {func : f, scope : s};
			}

			return f.apply(s || t, Array.prototype.slice.call(arguments, 1));
		},

		translate : function(s) {
			var c = this.settings.language || 'en', i18n = tinymce.i18n;

			if (!s)
				return '';

			return i18n[c + '.' + s] || s.replace(/{\#([^}]+)\}/g, function(a, b) {
				return i18n[c + '.' + b] || '{#' + b + '}';
			});
		},

		getLang : function(n, dv) {
			return tinymce.i18n[(this.settings.language || 'en') + '.' + n] || (is(dv) ? dv : '{#' + n + '}');
		},

		getParam : function(n, dv, ty) {
			var tr = tinymce.trim, v = is(this.settings[n]) ? this.settings[n] : dv, o;

			if (ty === 'hash') {
				o = {};

				if (is(v, 'string')) {
					each(v.indexOf('=') > 0 ? v.split(/[;,](?![^=;,]*(?:[;,]|$))/) : v.split(','), function(v) {
						v = v.split('=');

						if (v.length > 1)
							o[tr(v[0])] = tr(v[1]);
						else
							o[tr(v[0])] = tr(v);
					});
				} else
					o = v;

				return o;
			}

			return v;
		},

		nodeChanged : function(o) {
			var t = this, s = t.selection, n = (isIE ? s.getNode() : s.getStart()) || t.getBody();

			// Fix for bug #1896577 it seems that this can not be fired while the editor is loading
			if (t.initialized) {
				o = o || {};
				n = isIE && n.ownerDocument != t.getDoc() ? t.getBody() : n; // Fix for IE initial state

				// Get parents and add them to object
				o.parents = [];
				t.dom.getParent(n, function(node) {
					if (node.nodeName == 'BODY')
						return true;

					o.parents.push(node);
				});

				t.onNodeChange.dispatch(
					t,
					o ? o.controlManager || t.controlManager : t.controlManager,
					n,
					s.isCollapsed(),
					o
				);
			}
		},

		addButton : function(n, s) {
			var t = this;

			t.buttons = t.buttons || {};
			t.buttons[n] = s;
		},

		addCommand : function(n, f, s) {
			this.execCommands[n] = {func : f, scope : s || this};
		},

		addQueryStateHandler : function(n, f, s) {
			this.queryStateCommands[n] = {func : f, scope : s || this};
		},

		addQueryValueHandler : function(n, f, s) {
			this.queryValueCommands[n] = {func : f, scope : s || this};
		},

		addShortcut : function(pa, desc, cmd_func, sc) {
			var t = this, c;

			if (!t.settings.custom_shortcuts)
				return false;

			t.shortcuts = t.shortcuts || {};

			if (is(cmd_func, 'string')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c, false, null);
				};
			}

			if (is(cmd_func, 'object')) {
				c = cmd_func;

				cmd_func = function() {
					t.execCommand(c[0], c[1], c[2]);
				};
			}

			each(explode(pa), function(pa) {
				var o = {
					func : cmd_func,
					scope : sc || this,
					desc : desc,
					alt : false,
					ctrl : false,
					shift : false
				};

				each(explode(pa, '+'), function(v) {
					switch (v) {
						case 'alt':
						case 'ctrl':
						case 'shift':
							o[v] = true;
							break;

						default:
							o.charCode = v.charCodeAt(0);
							o.keyCode = v.toUpperCase().charCodeAt(0);
					}
				});

				t.shortcuts[(o.ctrl ? 'ctrl' : '') + ',' + (o.alt ? 'alt' : '') + ',' + (o.shift ? 'shift' : '') + ',' + o.keyCode] = o;
			});

			return true;
		},

		execCommand : function(cmd, ui, val, a) {
			var t = this, s = 0, o, st;

			if (!/^(mceAddUndoLevel|mceEndUndoLevel|mceBeginUndoLevel|mceRepaint|SelectAll)$/.test(cmd) && (!a || !a.skip_focus))
				t.focus();

			o = {};
			t.onBeforeExecCommand.dispatch(t, cmd, ui, val, o);
			if (o.terminate)
				return false;

			// Command callback
			if (t.execCallback('execcommand_callback', t.id, t.selection.getNode(), cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Registred commands
			if (o = t.execCommands[cmd]) {
				st = o.func.call(o.scope, ui, val);

				// Fall through on true
				if (st !== true) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					return st;
				}
			}

			// Plugin commands
			each(t.plugins, function(p) {
				if (p.execCommand && p.execCommand(cmd, ui, val)) {
					t.onExecCommand.dispatch(t, cmd, ui, val, a);
					s = 1;
					return false;
				}
			});

			if (s)
				return true;

			// Theme commands
			if (t.theme && t.theme.execCommand && t.theme.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Execute global commands
			if (tinymce.GlobalCommands.execCommand(t, cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Editor commands
			if (t.editorCommands.execCommand(cmd, ui, val)) {
				t.onExecCommand.dispatch(t, cmd, ui, val, a);
				return true;
			}

			// Browser commands
			t.getDoc().execCommand(cmd, ui, val);
			t.onExecCommand.dispatch(t, cmd, ui, val, a);
		},

		queryCommandState : function(cmd) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryStateCommands[cmd]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandState(cmd);
			if (o !== -1)
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandState(cmd);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		queryCommandValue : function(c) {
			var t = this, o, s;

			// Is hidden then return undefined
			if (t._isHidden())
				return;

			// Registred commands
			if (o = t.queryValueCommands[c]) {
				s = o.func.call(o.scope);

				// Fall though on true
				if (s !== true)
					return s;
			}

			// Registred commands
			o = t.editorCommands.queryCommandValue(c);
			if (is(o))
				return o;

			// Browser commands
			try {
				return this.getDoc().queryCommandValue(c);
			} catch (ex) {
				// Fails sometimes see bug: 1896577
			}
		},

		show : function() {
			var t = this;

			DOM.show(t.getContainer());
			DOM.hide(t.id);
			t.load();
		},

		hide : function() {
			var t = this, d = t.getDoc();

			// Fixed bug where IE has a blinking cursor left from the editor
			if (isIE && d)
				d.execCommand('SelectAll');

			// We must save before we hide so Safari doesn't crash
			t.save();
			DOM.hide(t.getContainer());
			DOM.setStyle(t.id, 'display', t.orgDisplay);
		},

		isHidden : function() {
			return !DOM.isHidden(this.id);
		},

		setProgressState : function(b, ti, o) {
			this.onSetProgressState.dispatch(this, b, ti, o);

			return b;
		},

		load : function(o) {
			var t = this, e = t.getElement(), h;

			if (e) {
				o = o || {};
				o.load = true;

				// Double encode existing entities in the value
				h = t.setContent(is(e.value) ? e.value : e.innerHTML, o);
				o.element = e;

				if (!o.no_events)
					t.onLoadContent.dispatch(t, o);

				o.element = e = null;

				return h;
			}
		},

		save : function(o) {
			var t = this, e = t.getElement(), h, f;

			if (!e || !t.initialized)
				return;

			o = o || {};
			o.save = true;

			// Add undo level will trigger onchange event
			if (!o.no_events) {
				t.undoManager.typing = 0;
				t.undoManager.add();
			}

			o.element = e;
			h = o.content = t.getContent(o);

			if (!o.no_events)
				t.onSaveContent.dispatch(t, o);

			h = o.content;

			if (!/TEXTAREA|INPUT/i.test(e.nodeName)) {
				e.innerHTML = h;

				// Update hidden form element
				if (f = DOM.getParent(t.id, 'form')) {
					each(f.elements, function(e) {
						if (e.name == t.id) {
							e.value = h;
							return false;
						}
					});
				}
			} else
				e.value = h;

			o.element = e = null;

			return h;
		},

		setContent : function(h, o) {
			var t = this;

			o = o || {};
			o.format = o.format || 'html';
			o.set = true;
			o.content = h;

			if (!o.no_events)
				t.onBeforeSetContent.dispatch(t, o);

			// Padd empty content in Gecko and Safari. Commands will otherwise fail on the content
			// It will also be impossible to place the caret in the editor unless there is a BR element present
			if (!tinymce.isIE && (h.length === 0 || /^\s+$/.test(h))) {
				o.content = t.dom.setHTML(t.getBody(), '<br _mce_bogus="1" />');
				o.format = 'raw';
			}

			o.content = t.dom.setHTML(t.getBody(), tinymce.trim(o.content));

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				o.content = t.dom.setHTML(t.getBody(), t.serializer.serialize(t.getBody(), o));
			}

			if (!o.no_events)
				t.onSetContent.dispatch(t, o);

			return o.content;
		},

		getContent : function(o) {
			var t = this, h;

			o = o || {};
			o.format = o.format || 'html';
			o.get = true;

			if (!o.no_events)
				t.onBeforeGetContent.dispatch(t, o);

			if (o.format != 'raw' && t.settings.cleanup) {
				o.getInner = true;
				h = t.serializer.serialize(t.getBody(), o);
			} else
				h = t.getBody().innerHTML;

			h = h.replace(/^\s*|\s*$/g, '');
			o.content = h;

			if (!o.no_events)
				t.onGetContent.dispatch(t, o);

			return o.content;
		},

		isDirty : function() {
			var t = this;

			return tinymce.trim(t.startContent) != tinymce.trim(t.getContent({format : 'raw', no_events : 1})) && !t.isNotDirty;
		},

		getContainer : function() {
			var t = this;

			if (!t.container)
				t.container = DOM.get(t.editorContainer || t.id + '_parent');

			return t.container;
		},

		getContentAreaContainer : function() {
			return this.contentAreaContainer;
		},

		getElement : function() {
			return DOM.get(this.settings.content_element || this.id);
		},

		getWin : function() {
			var t = this, e;

			if (!t.contentWindow) {
				e = DOM.get(t.id + "_ifr");

				if (e)
					t.contentWindow = e.contentWindow;
			}

			return t.contentWindow;
		},

		getDoc : function() {
			var t = this, w;

			if (!t.contentDocument) {
				w = t.getWin();

				if (w)
					t.contentDocument = w.document;
			}

			return t.contentDocument;
		},

		getBody : function() {
			return this.bodyElement || this.getDoc().body;
		},

		convertURL : function(u, n, e) {
			var t = this, s = t.settings;

			// Use callback instead
			if (s.urlconverter_callback)
				return t.execCallback('urlconverter_callback', u, e, true, n);

			// Don't convert link href since thats the CSS files that gets loaded into the editor also skip local file URLs
			if (!s.convert_urls || (e && e.nodeName == 'LINK') || u.indexOf('file:') === 0)
				return u;

			// Convert to relative
			if (s.relative_urls)
				return t.documentBaseURI.toRelative(u);

			// Convert to absolute
			u = t.documentBaseURI.toAbsolute(u, s.remove_script_host);

			return u;
		},

		addVisual : function(e) {
			var t = this, s = t.settings;

			e = e || t.getBody();

			if (!is(t.hasVisual))
				t.hasVisual = s.visual;

			each(t.dom.select('table,a', e), function(e) {
				var v;

				switch (e.nodeName) {
					case 'TABLE':
						v = t.dom.getAttrib(e, 'border');

						if (!v || v == '0') {
							if (t.hasVisual)
								t.dom.addClass(e, s.visual_table_class);
							else
								t.dom.removeClass(e, s.visual_table_class);
						}

						return;

					case 'A':
						v = t.dom.getAttrib(e, 'name');

						if (v) {
							if (t.hasVisual)
								t.dom.addClass(e, 'mceItemAnchor');
							else
								t.dom.removeClass(e, 'mceItemAnchor');
						}

						return;
				}
			});

			t.onVisualAid.dispatch(t, e, t.hasVisual);
		},

		remove : function() {
			var t = this, e = t.getContainer();

			t.removed = 1; // Cancels post remove event execution
			t.hide();

			t.execCallback('remove_instance_callback', t);
			t.onRemove.dispatch(t);

			// Clear all execCommand listeners this is required to avoid errors if the editor was removed inside another command
			t.onExecCommand.listeners = [];

			tinymce.remove(t);
			DOM.remove(e);
		},

		destroy : function(s) {
			var t = this;

			// One time is enough
			if (t.destroyed)
				return;

			if (!s) {
				tinymce.removeUnload(t.destroy);
				tinyMCE.onBeforeUnload.remove(t._beforeUnload);

				// Manual destroy
				if (t.theme && t.theme.destroy)
					t.theme.destroy();

				// Destroy controls, selection and dom
				t.controlManager.destroy();
				t.selection.destroy();
				t.dom.destroy();

				// Remove all events

				// Don't clear the window or document if content editable
				// is enabled since other instances might still be present
				if (!t.settings.content_editable) {
					Event.clear(t.getWin());
					Event.clear(t.getDoc());
				}

				Event.clear(t.getBody());
				Event.clear(t.formElement);
			}

			if (t.formElement) {
				t.formElement.submit = t.formElement._mceOldSubmit;
				t.formElement._mceOldSubmit = null;
			}

			t.contentAreaContainer = t.formElement = t.container = t.settings.content_element = t.bodyElement = t.contentDocument = t.contentWindow = null;

			if (t.selection)
				t.selection = t.selection.win = t.selection.dom = t.selection.dom.doc = null;

			t.destroyed = 1;
		},

		// Internal functions

		_addEvents : function() {
			// 'focus', 'blur', 'dblclick', 'beforedeactivate', submit, reset
			var t = this, i, s = t.settings, lo = {
				mouseup : 'onMouseUp',
				mousedown : 'onMouseDown',
				click : 'onClick',
				keyup : 'onKeyUp',
				keydown : 'onKeyDown',
				keypress : 'onKeyPress',
				submit : 'onSubmit',
				reset : 'onReset',
				contextmenu : 'onContextMenu',
				dblclick : 'onDblClick',
				paste : 'onPaste' // Doesn't work in all browsers yet
			};

			function eventHandler(e, o) {
				var ty = e.type;

				// Don't fire events when it's removed
				if (t.removed)
					return;

				// Generic event handler
				if (t.onEvent.dispatch(t, e, o) !== false) {
					// Specific event handler
					t[lo[e.fakeType || e.type]].dispatch(t, e, o);
				}
			};

			// Add DOM events
			each(lo, function(v, k) {
				switch (k) {
					case 'contextmenu':
						if (tinymce.isOpera) {
							// Fake contextmenu on Opera
							t.dom.bind(t.getBody(), 'mousedown', function(e) {
								if (e.ctrlKey) {
									e.fakeType = 'contextmenu';
									eventHandler(e);
								}
							});
						} else
							t.dom.bind(t.getBody(), k, eventHandler);
						break;

					case 'paste':
						t.dom.bind(t.getBody(), k, function(e) {
							eventHandler(e);
						});
						break;

					case 'submit':
					case 'reset':
						t.dom.bind(t.getElement().form || DOM.getParent(t.id, 'form'), k, eventHandler);
						break;

					default:
						t.dom.bind(s.content_editable ? t.getBody() : t.getDoc(), k, eventHandler);
				}
			});

			t.dom.bind(s.content_editable ? t.getBody() : (isGecko ? t.getDoc() : t.getWin()), 'focus', function(e) {
				t.focus(true);
			});


			// Fixes bug where a specified document_base_uri could result in broken images
			// This will also fix drag drop of images in Gecko
			if (tinymce.isGecko) {
				// Convert all images to absolute URLs
/*				t.onSetContent.add(function(ed, o) {
					each(ed.dom.select('img'), function(e) {
						var v;

						if (v = e.getAttribute('_mce_src'))
							e.src = t.documentBaseURI.toAbsolute(v);
					})
				});*/

				t.dom.bind(t.getDoc(), 'DOMNodeInserted', function(e) {
					var v;

					e = e.target;

					if (e.nodeType === 1 && e.nodeName === 'IMG' && (v = e.getAttribute('_mce_src')))
						e.src = t.documentBaseURI.toAbsolute(v);
				});
			}

			// Set various midas options in Gecko
			if (isGecko) {
				function setOpts() {
					var t = this, d = t.getDoc(), s = t.settings;

					if (isGecko && !s.readonly) {
						if (t._isHidden()) {
							try {
								if (!s.content_editable)
									d.designMode = 'On';
							} catch (ex) {
								// Fails if it's hidden
							}
						}

						try {
							// Try new Gecko method
							d.execCommand("styleWithCSS", 0, false);
						} catch (ex) {
							// Use old method
							if (!t._isHidden())
								try {d.execCommand("useCSS", 0, true);} catch (ex) {}
						}

						if (!s.table_inline_editing)
							try {d.execCommand('enableInlineTableEditing', false, false);} catch (ex) {}

						if (!s.object_resizing)
							try {d.execCommand('enableObjectResizing', false, false);} catch (ex) {}
					}
				};

				t.onBeforeExecCommand.add(setOpts);
				t.onMouseDown.add(setOpts);
			}

			// Workaround for bug, http://bugs.webkit.org/show_bug.cgi?id=12250
			// WebKit can't even do simple things like selecting an image
			// This also fixes so it's possible to select mceItemAnchors
			if (tinymce.isWebKit) {
				t.onClick.add(function(ed, e) {
					e = e.target;

					// Needs tobe the setBaseAndExtend or it will fail to select floated images
					if (e.nodeName == 'IMG' || (e.nodeName == 'A' && t.dom.hasClass(e, 'mceItemAnchor')))
						t.selection.getSel().setBaseAndExtent(e, 0, e, 1);
				});
			}

			// Add node change handlers
			t.onMouseUp.add(t.nodeChanged);
			//t.onClick.add(t.nodeChanged);
			t.onKeyUp.add(function(ed, e) {
				var c = e.keyCode;

				if ((c >= 33 && c <= 36) || (c >= 37 && c <= 40) || c == 13 || c == 45 || c == 46 || c == 8 || (tinymce.isMac && (c == 91 || c == 93)) || e.ctrlKey)
					t.nodeChanged();
			});

			// Add reset handler
			t.onReset.add(function() {
				t.setContent(t.startContent, {format : 'raw'});
			});

			// Add shortcuts
			if (s.custom_shortcuts) {
				if (s.custom_undo_redo_keyboard_shortcuts) {
					t.addShortcut('ctrl+z', t.getLang('undo_desc'), 'Undo');
					t.addShortcut('ctrl+y', t.getLang('redo_desc'), 'Redo');
				}

				// Add default shortcuts for gecko
				t.addShortcut('ctrl+b', t.getLang('bold_desc'), 'Bold');
				t.addShortcut('ctrl+i', t.getLang('italic_desc'), 'Italic');
				t.addShortcut('ctrl+u', t.getLang('underline_desc'), 'Underline');

				// BlockFormat shortcuts keys
				for (i=1; i<=6; i++)
					t.addShortcut('ctrl+' + i, '', ['FormatBlock', false, 'h' + i]);

				t.addShortcut('ctrl+7', '', ['FormatBlock', false, '<p>']);
				t.addShortcut('ctrl+8', '', ['FormatBlock', false, '<div>']);
				t.addShortcut('ctrl+9', '', ['FormatBlock', false, '<address>']);

				function find(e) {
					var v = null;

					if (!e.altKey && !e.ctrlKey && !e.metaKey)
						return v;

					each(t.shortcuts, function(o) {
						if (tinymce.isMac && o.ctrl != e.metaKey)
							return;
						else if (!tinymce.isMac && o.ctrl != e.ctrlKey)
							return;

						if (o.alt != e.altKey)
							return;

						if (o.shift != e.shiftKey)
							return;

						if (e.keyCode == o.keyCode || (e.charCode && e.charCode == o.charCode)) {
							v = o;
							return false;
						}
					});

					return v;
				};

				t.onKeyUp.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyPress.add(function(ed, e) {
					var o = find(e);

					if (o)
						return Event.cancel(e);
				});

				t.onKeyDown.add(function(ed, e) {
					var o = find(e);

					if (o) {
						o.func.call(o.scope);
						return Event.cancel(e);
					}
				});
			}

			if (tinymce.isIE) {
				// Fix so resize will only update the width and height attributes not the styles of an image
				// It will also block mceItemNoResize items
				t.dom.bind(t.getDoc(), 'controlselect', function(e) {
					var re = t.resizeInfo, cb;

					e = e.target;

					// Don't do this action for non image elements
					if (e.nodeName !== 'IMG')
						return;

					if (re)
						t.dom.unbind(re.node, re.ev, re.cb);

					if (!t.dom.hasClass(e, 'mceItemNoResize')) {
						ev = 'resizeend';
						cb = t.dom.bind(e, ev, function(e) {
							var v;

							e = e.target;

							if (v = t.dom.getStyle(e, 'width')) {
								t.dom.setAttrib(e, 'width', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'width', '');
							}

							if (v = t.dom.getStyle(e, 'height')) {
								t.dom.setAttrib(e, 'height', v.replace(/[^0-9%]+/g, ''));
								t.dom.setStyle(e, 'height', '');
							}
						});
					} else {
						ev = 'resizestart';
						cb = t.dom.bind(e, 'resizestart', Event.cancel, Event);
					}

					re = t.resizeInfo = {
						node : e,
						ev : ev,
						cb : cb
					};
				});

				t.onKeyDown.add(function(ed, e) {
					switch (e.keyCode) {
						case 8:
							// Fix IE control + backspace browser bug
							if (t.selection.getRng().item) {
								ed.dom.remove(t.selection.getRng().item(0));
								return Event.cancel(e);
							}
					}
				});

				/*if (t.dom.boxModel) {
					t.getBody().style.height = '100%';

					Event.add(t.getWin(), 'resize', function(e) {
						var docElm = t.getDoc().documentElement;

						docElm.style.height = (docElm.offsetHeight - 10) + 'px';
					});
				}*/
			}

			if (tinymce.isOpera) {
				t.onClick.add(function(ed, e) {
					Event.prevent(e);
				});
			}

			// Add custom undo/redo handlers
			if (s.custom_undo_redo) {
				function addUndo() {
					t.undoManager.typing = 0;
					t.undoManager.add();
				};

				t.dom.bind(t.getDoc(), 'focusout', function(e) {
					if (!t.removed && t.undoManager.typing)
						addUndo();
				});

				t.onKeyUp.add(function(ed, e) {
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45 || e.ctrlKey)
						addUndo();
				});

				t.onKeyDown.add(function(ed, e) {
					var rng, parent, bookmark;

					// IE has a really odd bug where the DOM might include an node that doesn't have
					// a proper structure. If you try to access nodeValue it would throw an illegal value exception.
					// This seems to only happen when you delete contents and it seems to be avoidable if you refresh the element
					// after you delete contents from it. See: #3008923
					if (isIE && e.keyCode == 46) {
						rng = t.selection.getRng();

						if (rng.parentElement) {
							parent = rng.parentElement();

							// Select next word when ctrl key is used in combo with delete
							if (e.ctrlKey) {
								rng.moveEnd('word', 1);
								rng.select();
							}

							// Delete contents
							t.selection.getSel().clear();

							// Check if we are within the same parent
							if (rng.parentElement() == parent) {
								bookmark = t.selection.getBookmark();

								try {
									// Update the HTML and hopefully it will remove the artifacts
									parent.innerHTML = parent.innerHTML;
								} catch (ex) {
									// And since it's IE it can sometimes produce an unknown runtime error
								}

								// Restore the caret position
								t.selection.moveToBookmark(bookmark);
							}

							// Block the default delete behavior since it might be broken
							e.preventDefault();
							return;
						}
					}

					// Is caracter positon keys
					if ((e.keyCode >= 33 && e.keyCode <= 36) || (e.keyCode >= 37 && e.keyCode <= 40) || e.keyCode == 13 || e.keyCode == 45) {
						if (t.undoManager.typing)
							addUndo();

						return;
					}

					if (!t.undoManager.typing) {
						t.undoManager.add();
						t.undoManager.typing = 1;
					}
				});

				t.onMouseDown.add(function() {
					if (t.undoManager.typing)
						addUndo();
				});
			}
		},

		_isHidden : function() {
			var s;

			if (!isGecko)
				return 0;

			// Weird, wheres that cursor selection?
			s = this.selection.getSel();
			return (!s || !s.rangeCount || s.rangeCount == 0);
		},

		// Fix for bug #1867292
		_fixNesting : function(s) {
			var d = [], i;

			s = s.replace(/<(\/)?([^\s>]+)[^>]*?>/g, function(a, b, c) {
				var e;

				// Handle end element
				if (b === '/') {
					if (!d.length)
						return '';

					if (c !== d[d.length - 1].tag) {
						for (i=d.length - 1; i>=0; i--) {
							if (d[i].tag === c) {
								d[i].close = 1;
								break;
							}
						}

						return '';
					} else {
						d.pop();

						if (d.length && d[d.length - 1].close) {
							a = a + '</' + d[d.length - 1].tag + '>';
							d.pop();
						}
					}
				} else {
					// Ignore these
					if (/^(br|hr|input|meta|img|link|param)$/i.test(c))
						return a;

					// Ignore closed ones
					if (/\/>$/.test(a))
						return a;

					d.push({tag : c}); // Push start element
				}

				return a;
			});

			// End all open tags
			for (i=d.length - 1; i>=0; i--)
				s += '</' + d[i].tag + '>';

			return s;
		}
	});
})(tinymce);

(function(tinymce) {
	// Added for compression purposes
	var each = tinymce.each, undefined, TRUE = true, FALSE = false;

	tinymce.EditorCommands = function(editor) {
		var dom = editor.dom,
			selection = editor.selection,
			commands = {state: {}, exec : {}, value : {}},
			settings = editor.settings,
			bookmark;

		function execCommand(command, ui, value) {
			var func;

			command = command.toLowerCase();
			if (func = commands.exec[command]) {
				func(command, ui, value);
				return TRUE;
			}

			return FALSE;
		};

		function queryCommandState(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.state[command])
				return func(command);

			return -1;
		};

		function queryCommandValue(command) {
			var func;

			command = command.toLowerCase();
			if (func = commands.value[command])
				return func(command);

			return FALSE;
		};

		function addCommands(command_list, type) {
			type = type || 'exec';

			each(command_list, function(callback, command) {
				each(command.toLowerCase().split(','), function(command) {
					commands[type][command] = callback;
				});
			});
		};

		// Expose public methods
		tinymce.extend(this, {
			execCommand : execCommand,
			queryCommandState : queryCommandState,
			queryCommandValue : queryCommandValue,
			addCommands : addCommands
		});

		// Private methods

		function execNativeCommand(command, ui, value) {
			if (ui === undefined)
				ui = FALSE;

			if (value === undefined)
				value = null;

			return editor.getDoc().execCommand(command, ui, value);
		};

		function isFormatMatch(name) {
			return editor.formatter.match(name);
		};

		function toggleFormat(name, value) {
			editor.formatter.toggle(name, value ? {value : value} : undefined);
		};

		function storeSelection(type) {
			bookmark = selection.getBookmark(type);
		};

		function restoreSelection() {
			selection.moveToBookmark(bookmark);
		};

		// Add execCommand overrides
		addCommands({
			// Ignore these, added for compatibility
			'mceResetDesignMode,mceBeginUndoLevel' : function() {},

			// Add undo manager logic
			'mceEndUndoLevel,mceAddUndoLevel' : function() {
				editor.undoManager.add();
			},

			'Cut,Copy,Paste' : function(command) {
				var doc = editor.getDoc(), failed;

				// Try executing the native command
				try {
					execNativeCommand(command);
				} catch (ex) {
					// Command failed
					failed = TRUE;
				}

				// Present alert message about clipboard access not being available
				if (failed || !doc.queryCommandSupported(command)) {
					if (tinymce.isGecko) {
						editor.windowManager.confirm(editor.getLang('clipboard_msg'), function(state) {
							if (state)
								open('http://www.mozilla.org/editor/midasdemo/securityprefs.html', '_blank');
						});
					} else
						editor.windowManager.alert(editor.getLang('clipboard_no_support'));
				}
			},

			// Override unlink command
			unlink : function(command) {
				if (selection.isCollapsed())
					selection.select(selection.getNode());

				execNativeCommand(command);
				selection.collapse(FALSE);
			},

			// Override justify commands to use the text formatter engine
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				var align = command.substring(7);

				// Remove all other alignments first
				each('left,center,right,full'.split(','), function(name) {
					if (align != name)
						editor.formatter.remove('align' + name);
				});

				toggleFormat('align' + align);
			},

			// Override list commands to fix WebKit bug
			'InsertUnorderedList,InsertOrderedList' : function(command) {
				var listElm, listParent;

				execNativeCommand(command);

				// WebKit produces lists within block elements so we need to split them
				// we will replace the native list creation logic to custom logic later on
				// TODO: Remove this when the list creation logic is removed
				listElm = dom.getParent(selection.getNode(), 'ol,ul');
				if (listElm) {
					listParent = listElm.parentNode;

					// If list is within a text block then split that block
					if (/^(H[1-6]|P|ADDRESS|PRE)$/.test(listParent.nodeName)) {
						storeSelection();
						dom.split(listParent, listElm);
						restoreSelection();
					}
				}
			},

			// Override commands to use the text formatter engine
			'Bold,Italic,Underline,Strikethrough' : function(command) {
				toggleFormat(command);
			},

			// Override commands to use the text formatter engine
			'ForeColor,HiliteColor,FontName' : function(command, ui, value) {
				toggleFormat(command, value);
			},

			FontSize : function(command, ui, value) {
				var fontClasses, fontSizes;

				// Convert font size 1-7 to styles
				if (value >= 1 && value <= 7) {
					fontSizes = tinymce.explode(settings.font_size_style_values);
					fontClasses = tinymce.explode(settings.font_size_classes);

					if (fontClasses)
						value = fontClasses[value - 1] || value;
					else
						value = fontSizes[value - 1] || value;
				}

				toggleFormat(command, value);
			},

			RemoveFormat : function(command) {
				editor.formatter.remove(command);
			},

			mceBlockQuote : function(command) {
				toggleFormat('blockquote');
			},

			FormatBlock : function(command, ui, value) {
				return toggleFormat(value || 'p');
			},

			mceCleanup : function() {
				var bookmark = selection.getBookmark();

				editor.setContent(editor.getContent({cleanup : TRUE}), {cleanup : TRUE});

				selection.moveToBookmark(bookmark);
			},

			mceRemoveNode : function(command, ui, value) {
				var node = value || selection.getNode();

				// Make sure that the body node isn't removed
				if (node != editor.getBody()) {
					storeSelection();
					editor.dom.remove(node, TRUE);
					restoreSelection();
				}
			},

			mceSelectNodeDepth : function(command, ui, value) {
				var counter = 0;

				dom.getParent(selection.getNode(), function(node) {
					if (node.nodeType == 1 && counter++ == value) {
						selection.select(node);
						return FALSE;
					}
				}, editor.getBody());
			},

			mceSelectNode : function(command, ui, value) {
				selection.select(value);
			},

			mceInsertContent : function(command, ui, value) {
				selection.setContent(value);
			},

			mceInsertRawHTML : function(command, ui, value) {
				selection.setContent('tiny_mce_marker');
				editor.setContent(editor.getContent().replace(/tiny_mce_marker/g, function() { return value }));
			},

			mceSetContent : function(command, ui, value) {
				editor.setContent(value);
			},

			'Indent,Outdent' : function(command) {
				var intentValue, indentUnit, value;

				// Setup indent level
				intentValue = settings.indentation;
				indentUnit = /[a-z%]+$/i.exec(intentValue);
				intentValue = parseInt(intentValue);

				if (!queryCommandState('InsertUnorderedList') && !queryCommandState('InsertOrderedList')) {
					each(selection.getSelectedBlocks(), function(element) {
						if (command == 'outdent') {
							value = Math.max(0, parseInt(element.style.paddingLeft || 0) - intentValue);
							dom.setStyle(element, 'paddingLeft', value ? value + indentUnit : '');
						} else
							dom.setStyle(element, 'paddingLeft', (parseInt(element.style.paddingLeft || 0) + intentValue) + indentUnit);
					});
				} else
					execNativeCommand(command);
			},

			mceRepaint : function() {
				var bookmark;

				if (tinymce.isGecko) {
					try {
						storeSelection(TRUE);

						if (selection.getSel())
							selection.getSel().selectAllChildren(editor.getBody());

						selection.collapse(TRUE);
						restoreSelection();
					} catch (ex) {
						// Ignore
					}
				}
			},

			mceToggleFormat : function(command, ui, value) {
				editor.formatter.toggle(value);
			},

			InsertHorizontalRule : function() {
				selection.setContent('<hr />');
			},

			mceToggleVisualAid : function() {
				editor.hasVisual = !editor.hasVisual;
				editor.addVisual();
			},

			mceReplaceContent : function(command, ui, value) {
				selection.setContent(value.replace(/\{\$selection\}/g, selection.getContent({format : 'text'})));
			},

			mceInsertLink : function(command, ui, value) {
				var link = dom.getParent(selection.getNode(), 'a');

				if (tinymce.is(value, 'string'))
					value = {href : value};

				if (!link) {
					execNativeCommand('CreateLink', FALSE, 'javascript:mctmp(0);');
					each(dom.select('a[href=javascript:mctmp(0);]'), function(link) {
						dom.setAttribs(link, value);
					});
				} else {
					if (value.href)
						dom.setAttribs(link, value);
					else
						editor.dom.remove(link, TRUE);
				}
			},
			
			selectAll : function() {
				var root = dom.getRoot(), rng = dom.createRng();

				rng.setStart(root, 0);
				rng.setEnd(root, root.childNodes.length);

				editor.selection.setRng(rng);
			}
		});

		// Add queryCommandState overrides
		addCommands({
			// Override justify commands
			'JustifyLeft,JustifyCenter,JustifyRight,JustifyFull' : function(command) {
				return isFormatMatch('align' + command.substring(7));
			},

			'Bold,Italic,Underline,Strikethrough' : function(command) {
				return isFormatMatch(command);
			},

			mceBlockQuote : function() {
				return isFormatMatch('blockquote');
			},

			Outdent : function() {
				var node;

				if (settings.inline_styles) {
					if ((node = dom.getParent(selection.getStart(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;

					if ((node = dom.getParent(selection.getEnd(), dom.isBlock)) && parseInt(node.style.paddingLeft) > 0)
						return TRUE;
				}

				return queryCommandState('InsertUnorderedList') || queryCommandState('InsertOrderedList') || (!settings.inline_styles && !!dom.getParent(selection.getNode(), 'BLOCKQUOTE'));
			},

			'InsertUnorderedList,InsertOrderedList' : function(command) {
				return dom.getParent(selection.getNode(), command == 'insertunorderedlist' ? 'UL' : 'OL');
			}
		}, 'state');

		// Add queryCommandValue overrides
		addCommands({
			'FontSize,FontName' : function(command) {
				var value = 0, parent;

				if (parent = dom.getParent(selection.getNode(), 'span')) {
					if (command == 'fontsize')
						value = parent.style.fontSize;
					else
						value = parent.style.fontFamily.replace(/, /g, ',').replace(/[\'\"]/g, '').toLowerCase();
				}

				return value;
			}
		}, 'value');

		// Add undo manager logic
		if (settings.custom_undo_redo) {
			addCommands({
				Undo : function() {
					editor.undoManager.undo();
				},

				Redo : function() {
					editor.undoManager.redo();
				}
			});
		}
	};
})(tinymce);
(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher;

	tinymce.UndoManager = function(editor) {
		var self, index = 0, data = [];

		function getContent() {
			return tinymce.trim(editor.getContent({format : 'raw', no_events : 1}));
		};

		return self = {
			typing : 0,

			onAdd : new Dispatcher(self),
			onUndo : new Dispatcher(self),
			onRedo : new Dispatcher(self),

			add : function(level) {
				var i, settings = editor.settings, lastLevel;

				level = level || {};
				level.content = getContent();

				// Add undo level if needed
				lastLevel = data[index];
				if (lastLevel && lastLevel.content == level.content) {
					if (index > 0 || data.length == 1)
						return null;
				}

				// Time to compress
				if (settings.custom_undo_redo_levels) {
					if (data.length > settings.custom_undo_redo_levels) {
						for (i = 0; i < data.length - 1; i++)
							data[i] = data[i + 1];

						data.length--;
						index = data.length;
					}
				}

				// Get a non intrusive normalized bookmark
				level.bookmark = editor.selection.getBookmark(2, true);

				// Crop array if needed
				if (index < data.length - 1) {
					// Treat first level as initial
					if (index == 0)
						data = [];
					else
						data.length = index + 1;
				}

				data.push(level);
				index = data.length - 1;

				self.onAdd.dispatch(self, level);
				editor.isNotDirty = 0;

				return level;
			},

			undo : function() {
				var level, i;

				if (self.typing) {
					self.add();
					self.typing = 0;
				}

				if (index > 0) {
					level = data[--index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					self.onUndo.dispatch(self, level);
				}

				return level;
			},

			redo : function() {
				var level;

				if (index < data.length - 1) {
					level = data[++index];

					editor.setContent(level.content, {format : 'raw'});
					editor.selection.moveToBookmark(level.bookmark);

					self.onRedo.dispatch(self, level);
				}

				return level;
			},

			clear : function() {
				data = [];
				index = self.typing = 0;
			},

			hasUndo : function() {
				return index > 0 || self.typing;
			},

			hasRedo : function() {
				return index < data.length - 1;
			}
		};
	};
})(tinymce);

(function(tinymce) {
	// Shorten names
	var Event = tinymce.dom.Event,
		isIE = tinymce.isIE,
		isGecko = tinymce.isGecko,
		isOpera = tinymce.isOpera,
		each = tinymce.each,
		extend = tinymce.extend,
		TRUE = true,
		FALSE = false;

	function cloneFormats(node) {
		var clone, temp, inner;

		do {
			if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(node.nodeName)) {
				if (clone) {
					temp = node.cloneNode(false);
					temp.appendChild(clone);
					clone = temp;
				} else {
					clone = inner = node.cloneNode(false);
				}

				clone.removeAttribute('id');
			}
		} while (node = node.parentNode);

		if (clone)
			return {wrapper : clone, inner : inner};
	};

	// Checks if the selection/caret is at the end of the specified block element
	function isAtEnd(rng, par) {
		var rng2 = par.ownerDocument.createRange();

		rng2.setStart(rng.endContainer, rng.endOffset);
		rng2.setEndAfter(par);

		// Get number of characters to the right of the cursor if it's zero then we are at the end and need to merge the next block element
		return rng2.cloneContents().textContent.length == 0;
	};

	function isEmpty(n) {
		n = n.innerHTML;

		n = n.replace(/<(img|hr|table|input|select|textarea)[ \>]/gi, '-'); // Keep these convert them to - chars
		n = n.replace(/<[^>]+>/g, ''); // Remove all tags

		return n.replace(/[ \u00a0\t\r\n]+/g, '') == '';
	};

	function splitList(selection, dom, li) {
		var listBlock, block;

		if (isEmpty(li)) {
			listBlock = dom.getParent(li, 'ul,ol');

			if (!dom.getParent(listBlock.parentNode, 'ul,ol')) {
				dom.split(listBlock, li);
				block = dom.create('p', 0, '<br _mce_bogus="1" />');
				dom.replace(block, li);
				selection.select(block, 1);
			}

			return FALSE;
		}

		return TRUE;
	};

	tinymce.create('tinymce.ForceBlocks', {
		ForceBlocks : function(ed) {
			var t = this, s = ed.settings, elm;

			t.editor = ed;
			t.dom = ed.dom;
			elm = (s.forced_root_block || 'p').toLowerCase();
			s.element = elm.toUpperCase();

			ed.onPreInit.add(t.setup, t);

			t.reOpera = new RegExp('(\\u00a0|&#160;|&nbsp;)<\/' + elm + '>', 'gi');
			t.rePadd = new RegExp('<p( )([^>]+)><\\\/p>|<p( )([^>]+)\\\/>|<p( )([^>]+)>\\s+<\\\/p>|<p><\\\/p>|<p\\\/>|<p>\\s+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR1 = new RegExp('<p( )([^>]+)>[\\s\\u00a0]+<\\\/p>|<p>[\\s\\u00a0]+<\\\/p>'.replace(/p/g, elm), 'gi');
			t.reNbsp2BR2 = new RegExp('<%p()([^>]+)>(&nbsp;|&#160;)<\\\/%p>|<%p>(&nbsp;|&#160;)<\\\/%p>'.replace(/%p/g, elm), 'gi');
			t.reBR2Nbsp = new RegExp('<p( )([^>]+)>\\s*<br \\\/>\\s*<\\\/p>|<p>\\s*<br \\\/>\\s*<\\\/p>'.replace(/p/g, elm), 'gi');

			function padd(ed, o) {
				if (isOpera)
					o.content = o.content.replace(t.reOpera, '</' + elm + '>');

				o.content = o.content.replace(t.rePadd, '<' + elm + '$1$2$3$4$5$6>\u00a0</' + elm + '>');

				if (!isIE && !isOpera && o.set) {
					// Use &nbsp; instead of BR in padded paragraphs
					o.content = o.content.replace(t.reNbsp2BR1, '<' + elm + '$1$2><br /></' + elm + '>');
					o.content = o.content.replace(t.reNbsp2BR2, '<' + elm + '$1$2><br /></' + elm + '>');
				} else
					o.content = o.content.replace(t.reBR2Nbsp, '<' + elm + '$1$2>\u00a0</' + elm + '>');
			};

			ed.onBeforeSetContent.add(padd);
			ed.onPostProcess.add(padd);

			if (s.forced_root_block) {
				ed.onInit.add(t.forceRoots, t);
				ed.onSetContent.add(t.forceRoots, t);
				ed.onBeforeGetContent.add(t.forceRoots, t);
			}
		},

		setup : function() {
			var t = this, ed = t.editor, s = ed.settings, dom = ed.dom, selection = ed.selection;

			// Force root blocks when typing and when getting output
			if (s.forced_root_block) {
				ed.onBeforeExecCommand.add(t.forceRoots, t);
				ed.onKeyUp.add(t.forceRoots, t);
				ed.onPreProcess.add(t.forceRoots, t);
			}

			if (s.force_br_newlines) {
				// Force IE to produce BRs on enter
				if (isIE) {
					ed.onKeyPress.add(function(ed, e) {
						var n;

						if (e.keyCode == 13 && selection.getNode().nodeName != 'LI') {
							selection.setContent('<br id="__" /> ', {format : 'raw'});
							n = dom.get('__');
							n.removeAttribute('id');
							selection.select(n);
							selection.collapse();
							return Event.cancel(e);
						}
					});
				}
			}

			if (s.force_p_newlines) {
				if (!isIE) {
					ed.onKeyPress.add(function(ed, e) {
						if (e.keyCode == 13 && !e.shiftKey && !t.insertPara(e))
							Event.cancel(e);
					});
				} else {
					// Ungly hack to for IE to preserve the formatting when you press
					// enter at the end of a block element with formatted contents
					// This logic overrides the browsers default logic with
					// custom logic that enables us to control the output
					tinymce.addUnload(function() {
						t._previousFormats = 0; // Fix IE leak
					});

					ed.onKeyPress.add(function(ed, e) {
						t._previousFormats = 0;

						// Clone the current formats, this will later be applied to the new block contents
						if (e.keyCode == 13 && !e.shiftKey && ed.selection.isCollapsed() && s.keep_styles)
							t._previousFormats = cloneFormats(ed.selection.getStart());
					});

					ed.onKeyUp.add(function(ed, e) {
						// Let IE break the element and the wrap the new caret location in the previous formats
						if (e.keyCode == 13 && !e.shiftKey) {
							var parent = ed.selection.getStart(), fmt = t._previousFormats;

							// Parent is an empty block
							if (!parent.hasChildNodes() && fmt) {
								parent = dom.getParent(parent, dom.isBlock);

								if (parent && parent.nodeName != 'LI') {
									parent.innerHTML = '';

									if (t._previousFormats) {
										parent.appendChild(fmt.wrapper);
										fmt.inner.innerHTML = '\uFEFF';
									} else
										parent.innerHTML = '\uFEFF';

									selection.select(parent, 1);
									ed.getDoc().execCommand('Delete', false, null);
									t._previousFormats = 0;
								}
							}
						}
					});
				}

				if (isGecko) {
					ed.onKeyDown.add(function(ed, e) {
						if ((e.keyCode == 8 || e.keyCode == 46) && !e.shiftKey)
							t.backspaceDelete(e, e.keyCode == 8);
					});
				}
			}

			// Workaround for missing shift+enter support, http://bugs.webkit.org/show_bug.cgi?id=16973
			if (tinymce.isWebKit) {
				function insertBr(ed) {
					var rng = selection.getRng(), br, div = dom.create('div', null, ' '), divYPos, vpHeight = dom.getViewPort(ed.getWin()).h;

					// Insert BR element
					rng.insertNode(br = dom.create('br'));

					// Place caret after BR
					rng.setStartAfter(br);
					rng.setEndAfter(br);
					selection.setRng(rng);

					// Could not place caret after BR then insert an nbsp entity and move the caret
					if (selection.getSel().focusNode == br.previousSibling) {
						selection.select(dom.insertAfter(dom.doc.createTextNode('\u00a0'), br));
						selection.collapse(TRUE);
					}

					// Create a temporary DIV after the BR and get the position as it
					// seems like getPos() returns 0 for text nodes and BR elements.
					dom.insertAfter(div, br);
					divYPos = dom.getPos(div).y;
					dom.remove(div);

					// Scroll to new position, scrollIntoView can't be used due to bug: http://bugs.webkit.org/show_bug.cgi?id=16117
					if (divYPos > vpHeight) // It is not necessary to scroll if the DIV is inside the view port.
						ed.getWin().scrollTo(0, divYPos);
				};

				ed.onKeyPress.add(function(ed, e) {
					if (e.keyCode == 13 && (e.shiftKey || (s.force_br_newlines && !dom.getParent(selection.getNode(), 'h1,h2,h3,h4,h5,h6,ol,ul')))) {
						insertBr(ed);
						Event.cancel(e);
					}
				});
			}

			// Padd empty inline elements within block elements
			// For example: <p><strong><em></em></strong></p> becomes <p><strong><em>&nbsp;</em></strong></p>
			ed.onPreProcess.add(function(ed, o) {
				each(dom.select('p,h1,h2,h3,h4,h5,h6,div', o.node), function(p) {
					if (isEmpty(p)) {
						each(dom.select('span,em,strong,b,i', o.node), function(n) {
							if (!n.hasChildNodes()) {
								n.appendChild(ed.getDoc().createTextNode('\u00a0'));
								return FALSE; // Break the loop one padding is enough
							}
						});
					}
				});
			});

			// IE specific fixes
			if (isIE) {
				// Replaces IE:s auto generated paragraphs with the specified element name
				if (s.element != 'P') {
					ed.onKeyPress.add(function(ed, e) {
						t.lastElm = selection.getNode().nodeName;
					});

					ed.onKeyUp.add(function(ed, e) {
						var bl, n = selection.getNode(), b = ed.getBody();

						if (b.childNodes.length === 1 && n.nodeName == 'P') {
							n = dom.rename(n, s.element);
							selection.select(n);
							selection.collapse();
							ed.nodeChanged();
						} else if (e.keyCode == 13 && !e.shiftKey && t.lastElm != 'P') {
							bl = dom.getParent(n, 'p');

							if (bl) {
								dom.rename(bl, s.element);
								ed.nodeChanged();
							}
						}
					});
				}
			}
		},

		find : function(n, t, s) {
			var ed = this.editor, w = ed.getDoc().createTreeWalker(n, 4, null, FALSE), c = -1;

			while (n = w.nextNode()) {
				c++;

				// Index by node
				if (t == 0 && n == s)
					return c;

				// Node by index
				if (t == 1 && c == s)
					return n;
			}

			return -1;
		},

		forceRoots : function(ed, e) {
			var t = this, ed = t.editor, b = ed.getBody(), d = ed.getDoc(), se = ed.selection, s = se.getSel(), r = se.getRng(), si = -2, ei, so, eo, tr, c = -0xFFFFFF;
			var nx, bl, bp, sp, le, nl = b.childNodes, i, n, eid;

			// Fix for bug #1863847
			//if (e && e.keyCode == 13)
			//	return TRUE;

			// Wrap non blocks into blocks
			for (i = nl.length - 1; i >= 0; i--) {
				nx = nl[i];

				// Ignore internal elements
				if (nx.nodeType === 1 && nx.getAttribute('_mce_type')) {
					bl = null;
					continue;
				}

				// Is text or non block element
				if (nx.nodeType === 3 || (!t.dom.isBlock(nx) && nx.nodeType !== 8 && !/^(script|mce:script|style|mce:style)$/i.test(nx.nodeName))) {
					if (!bl) {
						// Create new block but ignore whitespace
						if (nx.nodeType != 3 || /[^\s]/g.test(nx.nodeValue)) {
							// Store selection
							if (si == -2 && r) {
								if (!isIE) {
									// If selection is element then mark it
									if (r.startContainer.nodeType == 1 && (n = r.startContainer.childNodes[r.startOffset]) && n.nodeType == 1) {
										// Save the id of the selected element
										eid = n.getAttribute("id");
										n.setAttribute("id", "__mce");
									} else {
										// If element is inside body, might not be the case in contentEdiable mode
										if (ed.dom.getParent(r.startContainer, function(e) {return e === b;})) {
											so = r.startOffset;
											eo = r.endOffset;
											si = t.find(b, 0, r.startContainer);
											ei = t.find(b, 0, r.endContainer);
										}
									}
								} else {
									// Force control range into text range
									if (r.item) {
										tr = d.body.createTextRange();
										tr.moveToElementText(r.item(0));
										r = tr;
									}

									tr = d.body.createTextRange();
									tr.moveToElementText(b);
									tr.collapse(1);
									bp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(1);
									sp = tr.move('character', c) * -1;

									tr = r.duplicate();
									tr.collapse(0);
									le = (tr.move('character', c) * -1) - sp;

									si = sp - bp;
									ei = le;
								}
							}

							// Uses replaceChild instead of cloneNode since it removes selected attribute from option elements on IE
							// See: http://support.microsoft.com/kb/829907
							bl = ed.dom.create(ed.settings.forced_root_block);
							nx.parentNode.replaceChild(bl, nx);
							bl.appendChild(nx);
						}
					} else {
						if (bl.hasChildNodes())
							bl.insertBefore(nx, bl.firstChild);
						else
							bl.appendChild(nx);
					}
				} else
					bl = null; // Time to create new block
			}

			// Restore selection
			if (si != -2) {
				if (!isIE) {
					bl = b.getElementsByTagName(ed.settings.element)[0];
					r = d.createRange();

					// Select last location or generated block
					if (si != -1)
						r.setStart(t.find(b, 1, si), so);
					else
						r.setStart(bl, 0);

					// Select last location or generated block
					if (ei != -1)
						r.setEnd(t.find(b, 1, ei), eo);
					else
						r.setEnd(bl, 0);

					if (s) {
						s.removeAllRanges();
						s.addRange(r);
					}
				} else {
					try {
						r = s.createRange();
						r.moveToElementText(b);
						r.collapse(1);
						r.moveStart('character', si);
						r.moveEnd('character', ei);
						r.select();
					} catch (ex) {
						// Ignore
					}
				}
			} else if (!isIE && (n = ed.dom.get('__mce'))) {
				// Restore the id of the selected element
				if (eid)
					n.setAttribute('id', eid);
				else
					n.removeAttribute('id');

				// Move caret before selected element
				r = d.createRange();
				r.setStartBefore(n);
				r.setEndBefore(n);
				se.setRng(r);
			}
		},

		getParentBlock : function(n) {
			var d = this.dom;

			return d.getParent(n, d.isBlock);
		},

		insertPara : function(e) {
			var t = this, ed = t.editor, dom = ed.dom, d = ed.getDoc(), se = ed.settings, s = ed.selection.getSel(), r = s.getRangeAt(0), b = d.body;
			var rb, ra, dir, sn, so, en, eo, sb, eb, bn, bef, aft, sc, ec, n, vp = dom.getViewPort(ed.getWin()), y, ch, car;

			// If root blocks are forced then use Operas default behavior since it's really good
// Removed due to bug: #1853816
//			if (se.forced_root_block && isOpera)
//				return TRUE;

			// Setup before range
			rb = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			rb.setStart(s.anchorNode, s.anchorOffset);
			rb.collapse(TRUE);

			// Setup after range
			ra = d.createRange();

			// If is before the first block element and in body, then move it into first block element
			ra.setStart(s.focusNode, s.focusOffset);
			ra.collapse(TRUE);

			// Setup start/end points
			dir = rb.compareBoundaryPoints(rb.START_TO_END, ra) < 0;
			sn = dir ? s.anchorNode : s.focusNode;
			so = dir ? s.anchorOffset : s.focusOffset;
			en = dir ? s.focusNode : s.anchorNode;
			eo = dir ? s.focusOffset : s.anchorOffset;

			// If selection is in empty table cell
			if (sn === en && /^(TD|TH)$/.test(sn.nodeName)) {
				if (sn.firstChild.nodeName == 'BR')
					dom.remove(sn.firstChild); // Remove BR

				// Create two new block elements
				if (sn.childNodes.length == 0) {
					ed.dom.add(sn, se.element, null, '<br />');
					aft = ed.dom.add(sn, se.element, null, '<br />');
				} else {
					n = sn.innerHTML;
					sn.innerHTML = '';
					ed.dom.add(sn, se.element, null, n);
					aft = ed.dom.add(sn, se.element, null, '<br />');
				}

				// Move caret into the last one
				r = d.createRange();
				r.selectNodeContents(aft);
				r.collapse(1);
				ed.selection.setRng(r);

				return FALSE;
			}

			// If the caret is in an invalid location in FF we need to move it into the first block
			if (sn == b && en == b && b.firstChild && ed.dom.isBlock(b.firstChild)) {
				sn = en = sn.firstChild;
				so = eo = 0;
				rb = d.createRange();
				rb.setStart(sn, 0);
				ra = d.createRange();
				ra.setStart(en, 0);
			}

			// Never use body as start or end node
			sn = sn.nodeName == "HTML" ? d.body : sn; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			sn = sn.nodeName == "BODY" ? sn.firstChild : sn;
			en = en.nodeName == "HTML" ? d.body : en; // Fix for Opera bug: https://bugs.opera.com/show_bug.cgi?id=273224&comments=yes
			en = en.nodeName == "BODY" ? en.firstChild : en;

			// Get start and end blocks
			sb = t.getParentBlock(sn);
			eb = t.getParentBlock(en);
			bn = sb ? sb.nodeName : se.element; // Get block name to create

			// Return inside list use default browser behavior
			if (n = t.dom.getParent(sb, 'li,pre')) {
				if (n.nodeName == 'LI')
					return splitList(ed.selection, t.dom, n);

				return TRUE;
			}

			// If caption or absolute layers then always generate new blocks within
			if (sb && (sb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				sb = null;
			}

			// If caption or absolute layers then always generate new blocks within
			if (eb && (eb.nodeName == 'CAPTION' || /absolute|relative|fixed/gi.test(dom.getStyle(sb, 'position', 1)))) {
				bn = se.element;
				eb = null;
			}

			// Use P instead
			if (/(TD|TABLE|TH|CAPTION)/.test(bn) || (sb && bn == "DIV" && /left|right/gi.test(dom.getStyle(sb, 'float', 1)))) {
				bn = se.element;
				sb = eb = null;
			}

			// Setup new before and after blocks
			bef = (sb && sb.nodeName == bn) ? sb.cloneNode(0) : ed.dom.create(bn);
			aft = (eb && eb.nodeName == bn) ? eb.cloneNode(0) : ed.dom.create(bn);

			// Remove id from after clone
			aft.removeAttribute('id');

			// Is header and cursor is at the end, then force paragraph under
			if (/^(H[1-6])$/.test(bn) && isAtEnd(r, sb))
				aft = ed.dom.create(se.element);

			// Find start chop node
			n = sc = sn;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				sc = n;
			} while ((n = n.previousSibling ? n.previousSibling : n.parentNode));

			// Find end chop node
			n = ec = en;
			do {
				if (n == b || n.nodeType == 9 || t.dom.isBlock(n) || /(TD|TABLE|TH|CAPTION)/.test(n.nodeName))
					break;

				ec = n;
			} while ((n = n.nextSibling ? n.nextSibling : n.parentNode));

			// Place first chop part into before block element
			if (sc.nodeName == bn)
				rb.setStart(sc, 0);
			else
				rb.setStartBefore(sc);

			rb.setEnd(sn, so);
			bef.appendChild(rb.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Place secnd chop part within new block element
			try {
				ra.setEndAfter(ec);
			} catch(ex) {
				//console.debug(s.focusNode, s.focusOffset);
			}

			ra.setStart(en, eo);
			aft.appendChild(ra.cloneContents() || d.createTextNode('')); // Empty text node needed for Safari

			// Create range around everything
			r = d.createRange();
			if (!sc.previousSibling && sc.parentNode.nodeName == bn) {
				r.setStartBefore(sc.parentNode);
			} else {
				if (rb.startContainer.nodeName == bn && rb.startOffset == 0)
					r.setStartBefore(rb.startContainer);
				else
					r.setStart(rb.startContainer, rb.startOffset);
			}

			if (!ec.nextSibling && ec.parentNode.nodeName == bn)
				r.setEndAfter(ec.parentNode);
			else
				r.setEnd(ra.endContainer, ra.endOffset);

			// Delete and replace it with new block elements
			r.deleteContents();

			if (isOpera)
				ed.getWin().scrollTo(0, vp.y);

			// Never wrap blocks in blocks
			if (bef.firstChild && bef.firstChild.nodeName == bn)
				bef.innerHTML = bef.firstChild.innerHTML;

			if (aft.firstChild && aft.firstChild.nodeName == bn)
				aft.innerHTML = aft.firstChild.innerHTML;

			// Padd empty blocks
			if (isEmpty(bef))
				bef.innerHTML = '<br />';

			function appendStyles(e, en) {
				var nl = [], nn, n, i;

				e.innerHTML = '';

				// Make clones of style elements
				if (se.keep_styles) {
					n = en;
					do {
						// We only want style specific elements
						if (/^(SPAN|STRONG|B|EM|I|FONT|STRIKE|U)$/.test(n.nodeName)) {
							nn = n.cloneNode(FALSE);
							dom.setAttrib(nn, 'id', ''); // Remove ID since it needs to be unique
							nl.push(nn);
						}
					} while (n = n.parentNode);
				}

				// Append style elements to aft
				if (nl.length > 0) {
					for (i = nl.length - 1, nn = e; i >= 0; i--)
						nn = nn.appendChild(nl[i]);

					// Padd most inner style element
					nl[0].innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
					return nl[0]; // Move caret to most inner element
				} else
					e.innerHTML = isOpera ? '&nbsp;' : '<br />'; // Extra space for Opera so that the caret can move there
			};

			// Fill empty afterblook with current style
			if (isEmpty(aft))
				car = appendStyles(aft, en);

			// Opera needs this one backwards for older versions
			if (isOpera && parseFloat(opera.version()) < 9.5) {
				r.insertNode(bef);
				r.insertNode(aft);
			} else {
				r.insertNode(aft);
				r.insertNode(bef);
			}

			// Normalize
			aft.normalize();
			bef.normalize();

			function first(n) {
				return d.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, FALSE).nextNode() || n;
			};

			// Move cursor and scroll into view
			r = d.createRange();
			r.selectNodeContents(isGecko ? first(car || aft) : car || aft);
			r.collapse(1);
			s.removeAllRanges();
			s.addRange(r);

			// scrollIntoView seems to scroll the parent window in most browsers now including FF 3.0b4 so it's time to stop using it and do it our selfs
			y = ed.dom.getPos(aft).y;
			ch = aft.clientHeight;

			// Is element within viewport
			if (y < vp.y || y + ch > vp.y + vp.h) {
				ed.getWin().scrollTo(0, y < vp.y ? y : y - vp.h + 25); // Needs to be hardcoded to roughly one line of text if a huge text block is broken into two blocks
				//console.debug('SCROLL!', 'vp.y: ' + vp.y, 'y' + y, 'vp.h' + vp.h, 'clientHeight' + aft.clientHeight, 'yyy: ' + (y < vp.y ? y : y - vp.h + aft.clientHeight));
			}

			return FALSE;
		},

		backspaceDelete : function(e, bs) {
			var t = this, ed = t.editor, b = ed.getBody(), dom = ed.dom, n, se = ed.selection, r = se.getRng(), sc = r.startContainer, n, w, tn, walker;

			// Delete when caret is behind a element doesn't work correctly on Gecko see #3011651
			if (!bs && r.collapsed && sc.nodeType == 1 && r.startOffset == sc.childNodes.length) {
				walker = new tinymce.dom.TreeWalker(sc.lastChild, sc);

				// Walk the dom backwards until we find a text node
				for (n = sc.lastChild; n; n = walker.prev()) {
					if (n.nodeType == 3) {
						r.setStart(n, n.nodeValue.length);
						r.collapse(true);
						se.setRng(r);
						return;
					}
				}
			}

			// The caret sometimes gets stuck in Gecko if you delete empty paragraphs
			// This workaround removes the element by hand and moves the caret to the previous element
			if (sc && ed.dom.isBlock(sc) && !/^(TD|TH)$/.test(sc.nodeName) && bs) {
				if (sc.childNodes.length == 0 || (sc.childNodes.length == 1 && sc.firstChild.nodeName == 'BR')) {
					// Find previous block element
					n = sc;
					while ((n = n.previousSibling) && !ed.dom.isBlock(n)) ;

					if (n) {
						if (sc != b.firstChild) {
							// Find last text node
							w = ed.dom.doc.createTreeWalker(n, NodeFilter.SHOW_TEXT, null, FALSE);
							while (tn = w.nextNode())
								n = tn;

							// Place caret at the end of last text node
							r = ed.getDoc().createRange();
							r.setStart(n, n.nodeValue ? n.nodeValue.length : 0);
							r.setEnd(n, n.nodeValue ? n.nodeValue.length : 0);
							se.setRng(r);

							// Remove the target container
							ed.dom.remove(sc);
						}

						return Event.cancel(e);
					}
				}
			}
		}
	});
})(tinymce);

(function(tinymce) {
	// Shorten names
	var DOM = tinymce.DOM, Event = tinymce.dom.Event, each = tinymce.each, extend = tinymce.extend;

	tinymce.create('tinymce.ControlManager', {
		ControlManager : function(ed, s) {
			var t = this, i;

			s = s || {};
			t.editor = ed;
			t.controls = {};
			t.onAdd = new tinymce.util.Dispatcher(t);
			t.onPostRender = new tinymce.util.Dispatcher(t);
			t.prefix = s.prefix || ed.id + '_';
			t._cls = {};

			t.onPostRender.add(function() {
				each(t.controls, function(c) {
					c.postRender();
				});
			});
		},

		get : function(id) {
			return this.controls[this.prefix + id] || this.controls[id];
		},

		setActive : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setActive(s);

			return c;
		},

		setDisabled : function(id, s) {
			var c = null;

			if (c = this.get(id))
				c.setDisabled(s);

			return c;
		},

		add : function(c) {
			var t = this;

			if (c) {
				t.controls[c.id] = c;
				t.onAdd.dispatch(c, t);
			}

			return c;
		},

		createControl : function(n) {
			var c, t = this, ed = t.editor;

			each(ed.plugins, function(p) {
				if (p.createControl) {
					c = p.createControl(n, t);

					if (c)
						return false;
				}
			});

			switch (n) {
				case "|":
				case "separator":
					return t.createSeparator();
			}

			if (!c && ed.buttons && (c = ed.buttons[n]))
				return t.createButton(n, c);

			return t.add(c);
		},

		createDropMenu : function(id, s, cc) {
			var t = this, ed = t.editor, c, bm, v, cls;

			s = extend({
				'class' : 'mceDropDown',
				constrain : ed.settings.constrain_menus
			}, s);

			s['class'] = s['class'] + ' ' + ed.getParam('skin') + 'Skin';
			if (v = ed.getParam('skin_variant'))
				s['class'] += ' ' + ed.getParam('skin') + 'Skin' + v.substring(0, 1).toUpperCase() + v.substring(1);

			id = t.prefix + id;
			cls = cc || t._cls.dropmenu || tinymce.ui.DropMenu;
			c = t.controls[id] = new cls(id, s);
			c.onAddItem.add(function(c, o) {
				var s = o.settings;

				s.title = ed.getLang(s.title, s.title);

				if (!s.onclick) {
					s.onclick = function(v) {
						if (s.cmd)
							ed.execCommand(s.cmd, s.ui || false, s.value);
					};
				}
			});

			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();

					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createListBox : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (ed.settings.use_native_selects)
				c = new tinymce.ui.NativeListBox(id, s);
			else {
				cls = cc || t._cls.listbox || tinymce.ui.ListBox;
				c = new cls(id, s);
			}

			t.controls[id] = c;

			// Fix focus problem in Safari
			if (tinymce.isWebKit) {
				c.onPostRender.add(function(c, n) {
					// Store bookmark on mousedown
					Event.add(n, 'mousedown', function() {
						ed.bookmark = ed.selection.getBookmark(1);
					});

					// Restore on focus, since it might be lost
					Event.add(n, 'focus', function() {
						ed.selection.moveToBookmark(ed.bookmark);
						ed.bookmark = null;
					});
				});
			}

			if (c.hideMenu)
				ed.onMouseDown.add(c.hideMenu, c);

			return t.add(c);
		},

		createButton : function(id, s, cc) {
			var t = this, ed = t.editor, o, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.label = ed.translate(s.label);
			s.scope = s.scope || ed;

			if (!s.onclick && !s.menu_button) {
				s.onclick = function() {
					ed.execCommand(s.cmd, s.ui || false, s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				unavailable_prefix : ed.getLang('unavailable', ''),
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;

			if (s.menu_button) {
				cls = cc || t._cls.menubutton || tinymce.ui.MenuButton;
				c = new cls(id, s);
				ed.onMouseDown.add(c.hideMenu, c);
			} else {
				cls = t._cls.button || tinymce.ui.Button;
				c = new cls(id, s);
			}

			return t.add(c);
		},

		createMenuButton : function(id, s, cc) {
			s = s || {};
			s.menu_button = 1;

			return this.createButton(id, s, cc);
		},

		createSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				scope : s.scope,
				control_manager : t
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.splitbutton || tinymce.ui.SplitButton;
			c = t.add(new cls(id, s));
			ed.onMouseDown.add(c.hideMenu, c);

			return c;
		},

		createColorSplitButton : function(id, s, cc) {
			var t = this, ed = t.editor, cmd, c, cls, bm;

			if (t.get(id))
				return null;

			s.title = ed.translate(s.title);
			s.scope = s.scope || ed;

			if (!s.onclick) {
				s.onclick = function(v) {
					if (tinymce.isIE)
						bm = ed.selection.getBookmark(1);

					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			if (!s.onselect) {
				s.onselect = function(v) {
					ed.execCommand(s.cmd, s.ui || false, v || s.value);
				};
			}

			s = extend({
				title : s.title,
				'class' : 'mce_' + id,
				'menu_class' : ed.getParam('skin') + 'Skin',
				scope : s.scope,
				more_colors_title : ed.getLang('more_colors')
			}, s);

			id = t.prefix + id;
			cls = cc || t._cls.colorsplitbutton || tinymce.ui.ColorSplitButton;
			c = new cls(id, s);
			ed.onMouseDown.add(c.hideMenu, c);

			// Remove the menu element when the editor is removed
			ed.onRemove.add(function() {
				c.destroy();
			});

			// Fix for bug #1897785, #1898007
			if (tinymce.isIE) {
				c.onShowMenu.add(function() {
					// IE 8 needs focus in order to store away a range with the current collapsed caret location
					ed.focus();
					bm = ed.selection.getBookmark(1);
				});

				c.onHideMenu.add(function() {
					if (bm) {
						ed.selection.moveToBookmark(bm);
						bm = 0;
					}
				});
			}

			return t.add(c);
		},

		createToolbar : function(id, s, cc) {
			var c, t = this, cls;

			id = t.prefix + id;
			cls = cc || t._cls.toolbar || tinymce.ui.Toolbar;
			c = new cls(id, s);

			if (t.get(id))
				return null;

			return t.add(c);
		},

		createSeparator : function(cc) {
			var cls = cc || this._cls.separator || tinymce.ui.Separator;

			return new cls();
		},

		setControlType : function(n, c) {
			return this._cls[n.toLowerCase()] = c;
		},
	
		destroy : function() {
			each(this.controls, function(c) {
				c.destroy();
			});

			this.controls = null;
		}
	});
})(tinymce);

(function(tinymce) {
	var Dispatcher = tinymce.util.Dispatcher, each = tinymce.each, isIE = tinymce.isIE, isOpera = tinymce.isOpera;

	tinymce.create('tinymce.WindowManager', {
		WindowManager : function(ed) {
			var t = this;

			t.editor = ed;
			t.onOpen = new Dispatcher(t);
			t.onClose = new Dispatcher(t);
			t.params = {};
			t.features = {};
		},

		open : function(s, p) {
			var t = this, f = '', x, y, mo = t.editor.settings.dialog_type == 'modal', w, sw, sh, vp = tinymce.DOM.getViewPort(), u;

			// Default some options
			s = s || {};
			p = p || {};
			sw = isOpera ? vp.w : screen.width; // Opera uses windows inside the Opera window
			sh = isOpera ? vp.h : screen.height;
			s.name = s.name || 'mc_' + new Date().getTime();
			s.width = parseInt(s.width || 320);
			s.height = parseInt(s.height || 240);
			s.resizable = true;
			s.left = s.left || parseInt(sw / 2.0) - (s.width / 2.0);
			s.top = s.top || parseInt(sh / 2.0) - (s.height / 2.0);
			p.inline = false;
			p.mce_width = s.width;
			p.mce_height = s.height;
			p.mce_auto_focus = s.auto_focus;

			if (mo) {
				if (isIE) {
					s.center = true;
					s.help = false;
					s.dialogWidth = s.width + 'px';
					s.dialogHeight = s.height + 'px';
					s.scroll = s.scrollbars || false;
				}
			}

			// Build features string
			each(s, function(v, k) {
				if (tinymce.is(v, 'boolean'))
					v = v ? 'yes' : 'no';

				if (!/^(name|url)$/.test(k)) {
					if (isIE && mo)
						f += (f ? ';' : '') + k + ':' + v;
					else
						f += (f ? ',' : '') + k + '=' + v;
				}
			});

			t.features = s;
			t.params = p;
			t.onOpen.dispatch(t, s, p);

			u = s.url || s.file;
			u = tinymce._addVer(u);

			try {
				if (isIE && mo) {
					w = 1;
					window.showModalDialog(u, window, f);
				} else
					w = window.open(u, s.name, f);
			} catch (ex) {
				// Ignore
			}

			if (!w)
				alert(t.editor.getLang('popup_blocked'));
		},

		close : function(w) {
			w.close();
			this.onClose.dispatch(this);
		},

		createInstance : function(cl, a, b, c, d, e) {
			var f = tinymce.resolve(cl);

			return new f(a, b, c, d, e);
		},

		confirm : function(t, cb, s, w) {
			w = w || window;

			cb.call(s || this, w.confirm(this._decode(this.editor.getLang(t, t))));
		},

		alert : function(tx, cb, s, w) {
			var t = this;

			w = w || window;
			w.alert(t._decode(t.editor.getLang(tx, tx)));

			if (cb)
				cb.call(s || t);
		},

		resizeBy : function(dw, dh, win) {
			win.resizeBy(dw, dh);
		},

		// Internal functions

		_decode : function(s) {
			return tinymce.DOM.decode(s).replace(/\\n/g, '\n');
		}
	});
}(tinymce));
(function(tinymce) {
	function CommandManager() {
		var execCommands = {}, queryStateCommands = {}, queryValueCommands = {};

		function add(collection, cmd, func, scope) {
			if (typeof(cmd) == 'string')
				cmd = [cmd];

			tinymce.each(cmd, function(cmd) {
				collection[cmd.toLowerCase()] = {func : func, scope : scope};
			});
		};

		tinymce.extend(this, {
			add : function(cmd, func, scope) {
				add(execCommands, cmd, func, scope);
			},

			addQueryStateHandler : function(cmd, func, scope) {
				add(queryStateCommands, cmd, func, scope);
			},

			addQueryValueHandler : function(cmd, func, scope) {
				add(queryValueCommands, cmd, func, scope);
			},

			execCommand : function(scope, cmd, ui, value, args) {
				if (cmd = execCommands[cmd.toLowerCase()]) {
					if (cmd.func.call(scope || cmd.scope, ui, value, args) !== false)
						return true;
				}
			},

			queryCommandValue : function() {
				if (cmd = queryValueCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			},

			queryCommandState : function() {
				if (cmd = queryStateCommands[cmd.toLowerCase()])
					return cmd.func.call(scope || cmd.scope, ui, value, args);
			}
		});
	};

	tinymce.GlobalCommands = new CommandManager();
})(tinymce);
(function(tinymce) {
	tinymce.Formatter = function(ed) {
		var formats = {},
			each = tinymce.each,
			dom = ed.dom,
			selection = ed.selection,
			TreeWalker = tinymce.dom.TreeWalker,
			rangeUtils = new tinymce.dom.RangeUtils(dom),
			isValid = ed.schema.isValid,
			isBlock = dom.isBlock,
			forcedRootBlock = ed.settings.forced_root_block,
			nodeIndex = dom.nodeIndex,
			INVISIBLE_CHAR = '\uFEFF',
			MCE_ATTR_RE = /^(src|href|style)$/,
			FALSE = false,
			TRUE = true,
			undefined,
			pendingFormats = {apply : [], remove : []};

		function isArray(obj) {
			return obj instanceof Array;
		};

		function getParents(node, selector) {
			return dom.getParents(node, selector, dom.getRoot());
		};

		function isCaretNode(node) {
			return node.nodeType === 1 && (node.face === 'mceinline' || node.style.fontFamily === 'mceinline');
		};

		// Public functions

		function get(name) {
			return name ? formats[name] : formats;
		};

		function register(name, format) {
			if (name) {
				if (typeof(name) !== 'string') {
					each(name, function(format, name) {
						register(name, format);
					});
				} else {
					// Force format into array and add it to internal collection
					format = format.length ? format : [format];

					each(format, function(format) {
						// Set deep to false by default on selector formats this to avoid removing
						// alignment on images inside paragraphs when alignment is changed on paragraphs
						if (format.deep === undefined)
							format.deep = !format.selector;

						// Default to true
						if (format.split === undefined)
							format.split = !format.selector || format.inline;

						// Default to true
						if (format.remove === undefined && format.selector && !format.inline)
							format.remove = 'none';

						// Mark format as a mixed format inline + block level
						if (format.selector && format.inline) {
							format.mixed = true;
							format.block_expand = true;
						}

						// Split classes if needed
						if (typeof(format.classes) === 'string')
							format.classes = format.classes.split(/\s+/);
					});

					formats[name] = format;
				}
			}
		};

		function apply(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, rng, i;

			function moveStart(rng) {
				var container = rng.startContainer,
					offset = rng.startOffset,
					walker, node;

				// Move startContainer/startOffset in to a suitable node
				if (container.nodeType == 1 || container.nodeValue === "") {
					container = container.nodeType == 1 ? container.childNodes[offset] : container;

					// Might fail if the offset is behind the last element in it's container
					if (container) {
						walker = new TreeWalker(container, container.parentNode);
						for (node = walker.current(); node; node = walker.next()) {
							if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
								rng.setStart(node, 0);
								break;
							}
						}
					}
				}

				return rng;
			};

			function setElementFormat(elm, fmt) {
				fmt = fmt || format;

				if (elm) {
					each(fmt.styles, function(value, name) {
						dom.setStyle(elm, name, replaceVars(value, vars));
					});

					each(fmt.attributes, function(value, name) {
						dom.setAttrib(elm, name, replaceVars(value, vars));
					});

					each(fmt.classes, function(value) {
						value = replaceVars(value, vars);

						if (!dom.hasClass(elm, value))
							dom.addClass(elm, value);
					});
				}
			};

			function applyRngStyle(rng) {
				var newWrappers = [], wrapName, wrapElm;

				// Setup wrapper element
				wrapName = format.inline || format.block;
				wrapElm = dom.create(wrapName);
				setElementFormat(wrapElm);

				rangeUtils.walk(rng, function(nodes) {
					var currentWrapElm;

					function process(node) {
						var nodeName = node.nodeName.toLowerCase(), parentName = node.parentNode.nodeName.toLowerCase(), found;

						// Stop wrapping on br elements
						if (isEq(nodeName, 'br')) {
							currentWrapElm = 0;

							// Remove any br elements when we wrap things
							if (format.block)
								dom.remove(node);

							return;
						}

						// If node is wrapper type
						if (format.wrapper && matchNode(node, name, vars)) {
							currentWrapElm = 0;
							return;
						}

						// Can we rename the block
						if (format.block && !format.wrapper && isTextBlock(nodeName)) {
							node = dom.rename(node, wrapName);
							setElementFormat(node);
							newWrappers.push(node);
							currentWrapElm = 0;
							return;
						}

						// Handle selector patterns
						if (format.selector) {
							// Look for matching formats
							each(formatList, function(format) {
								if (dom.is(node, format.selector) && !isCaretNode(node)) {
									setElementFormat(node, format);
									found = true;
								}
							});

							// Continue processing if a selector match wasn't found and a inline element is defined
							if (!format.inline || found) {
								currentWrapElm = 0;
								return;
							}
						}

						// Is it valid to wrap this item
						if (isValid(wrapName, nodeName) && isValid(parentName, wrapName)) {
							// Start wrapping
							if (!currentWrapElm) {
								// Wrap the node
								currentWrapElm = wrapElm.cloneNode(FALSE);
								node.parentNode.insertBefore(currentWrapElm, node);
								newWrappers.push(currentWrapElm);
							}

							currentWrapElm.appendChild(node);
						} else {
							// Start a new wrapper for possible children
							currentWrapElm = 0;

							each(tinymce.grep(node.childNodes), process);

							// End the last wrapper
							currentWrapElm = 0;
						}
					};

					// Process siblings from range
					each(nodes, process);
				});

				// Cleanup
				each(newWrappers, function(node) {
					var childCount;

					function getChildCount(node) {
						var count = 0;

						each(node.childNodes, function(node) {
							if (!isWhiteSpaceNode(node) && !isBookmarkNode(node))
								count++;
						});

						return count;
					};

					function mergeStyles(node) {
						var child, clone;

						each(node.childNodes, function(node) {
							if (node.nodeType == 1 && !isBookmarkNode(node) && !isCaretNode(node)) {
								child = node;
								return FALSE; // break loop
							}
						});

						// If child was found and of the same type as the current node
						if (child && matchName(child, format)) {
							clone = child.cloneNode(FALSE);
							setElementFormat(clone);

							dom.replace(clone, node, TRUE);
							dom.remove(child, 1);
						}

						return clone || node;
					};

					childCount = getChildCount(node);

					// Remove empty nodes
					if (childCount === 0) {
						dom.remove(node, 1);
						return;
					}

					if (format.inline || format.wrapper) {
						// Merges the current node with it's children of similar type to reduce the number of elements
						if (!format.exact && childCount === 1)
							node = mergeStyles(node);

						// Remove/merge children
						each(formatList, function(format) {
							// Merge all children of similar type will move styles from child to parent
							// this: <span style="color:red"><b><span style="color:red; font-size:10px">text</span></b></span>
							// will become: <span style="color:red"><b><span style="font-size:10px">text</span></b></span>
							each(dom.select(format.inline, node), function(child) {
								removeFormat(format, vars, child, format.exact ? child : null);
							});
						});

						// Remove child if direct parent is of same type
						if (matchNode(node.parentNode, name, vars)) {
							dom.remove(node, 1);
							node = 0;
							return TRUE;
						}

						// Look for parent with similar style format
						if (format.merge_with_parents) {
							dom.getParent(node.parentNode, function(parent) {
								if (matchNode(parent, name, vars)) {
									dom.remove(node, 1);
									node = 0;
									return TRUE;
								}
							});
						}

						// Merge next and previous siblings if they are similar <b>text</b><b>text</b> becomes <b>texttext</b>
						if (node) {
							node = mergeSiblings(getNonWhiteSpaceSibling(node), node);
							node = mergeSiblings(node, getNonWhiteSpaceSibling(node, TRUE));
						}
					}
				});
			};

			if (format) {
				if (node) {
					rng = dom.createRng();

					rng.setStartBefore(node);
					rng.setEndAfter(node);

					applyRngStyle(expandRng(rng, formatList));
				} else {
					if (!selection.isCollapsed() || !format.inline) {
						// Apply formatting to selection
						bookmark = selection.getBookmark();
						applyRngStyle(expandRng(selection.getRng(TRUE), formatList));

						selection.moveToBookmark(bookmark);
						selection.setRng(moveStart(selection.getRng(TRUE)));
						ed.nodeChanged();
					} else
						performCaretAction('apply', name, vars);
				}
			}
		};

		function remove(name, vars, node) {
			var formatList = get(name), format = formatList[0], bookmark, i, rng;

			function moveStart(rng) {
				var container = rng.startContainer,
					offset = rng.startOffset,
					walker, node, nodes, tmpNode;

				// Convert text node into index if possible
				if (container.nodeType == 3 && offset >= container.nodeValue.length - 1) {
					container = container.parentNode;
					offset = nodeIndex(container) + 1;
				}

				// Move startContainer/startOffset in to a suitable node
				if (container.nodeType == 1) {
					nodes = container.childNodes;
					container = nodes[Math.min(offset, nodes.length - 1)];
					walker = new TreeWalker(container);

					// If offset is at end of the parent node walk to the next one
					if (offset > nodes.length - 1)
						walker.next();

					for (node = walker.current(); node; node = walker.next()) {
						if (node.nodeType == 3 && !isWhiteSpaceNode(node)) {
							// IE has a "neat" feature where it moves the start node into the closest element
							// we can avoid this by inserting an element before it and then remove it after we set the selection
							tmpNode = dom.create('a', null, INVISIBLE_CHAR);
							node.parentNode.insertBefore(tmpNode, node);

							// Set selection and remove tmpNode
							rng.setStart(node, 0);
							selection.setRng(rng);
							dom.remove(tmpNode);

							return;
						}
					}
				}
			};

			// Merges the styles for each node
			function process(node) {
				var children, i, l;

				// Grab the children first since the nodelist might be changed
				children = tinymce.grep(node.childNodes);

				// Process current node
				for (i = 0, l = formatList.length; i < l; i++) {
					if (removeFormat(formatList[i], vars, node, node))
						break;
				}

				// Process the children
				if (format.deep) {
					for (i = 0, l = children.length; i < l; i++)
						process(children[i]);
				}
			};

			function findFormatRoot(container) {
				var formatRoot;

				// Find format root
				each(getParents(container.parentNode).reverse(), function(parent) {
					var format;

					// Find format root element
					if (!formatRoot && parent.id != '_start' && parent.id != '_end') {
						// Is the node matching the format we are looking for
						format = matchNode(parent, name, vars);
						if (format && format.split !== false)
							formatRoot = parent;
					}
				});

				return formatRoot;
			};

			function wrapAndSplit(format_root, container, target, split) {
				var parent, clone, lastClone, firstClone, i, formatRootParent;

				// Format root found then clone formats and split it
				if (format_root) {
					formatRootParent = format_root.parentNode;

					for (parent = container.parentNode; parent && parent != formatRootParent; parent = parent.parentNode) {
						clone = parent.cloneNode(FALSE);

						for (i = 0; i < formatList.length; i++) {
							if (removeFormat(formatList[i], vars, clone, clone)) {
								clone = 0;
								break;
							}
						}

						// Build wrapper node
						if (clone) {
							if (lastClone)
								clone.appendChild(lastClone);

							if (!firstClone)
								firstClone = clone;

							lastClone = clone;
						}
					}

					// Never split block elements if the format is mixed
					if (split && (!format.mixed || !isBlock(format_root)))
						container = dom.split(format_root, container);

					// Wrap container in cloned formats
					if (lastClone) {
						target.parentNode.insertBefore(lastClone, target);
						firstClone.appendChild(target);
					}
				}

				return container;
			};

			function splitToFormatRoot(container) {
				return wrapAndSplit(findFormatRoot(container), container, container, true);
			};

			function unwrap(start) {
				var node = dom.get(start ? '_start' : '_end'),
					out = node[start ? 'firstChild' : 'lastChild'];

				// If the end is placed within the start the result will be removed
				// So this checks if the out node is a bookmark node if it is it
				// checks for another more suitable node
				if (isBookmarkNode(out))
					out = out[start ? 'firstChild' : 'lastChild'];

				dom.remove(node, true);

				return out;
			};

			function removeRngStyle(rng) {
				var startContainer, endContainer;

				rng = expandRng(rng, formatList, TRUE);

				if (format.split) {
					startContainer = getContainer(rng, TRUE);
					endContainer = getContainer(rng);

					if (startContainer != endContainer) {
						// Wrap start/end nodes in span element since these might be cloned/moved
						startContainer = wrap(startContainer, 'span', {id : '_start', _mce_type : 'bookmark'});
						endContainer = wrap(endContainer, 'span', {id : '_end', _mce_type : 'bookmark'});

						// Split start/end
						splitToFormatRoot(startContainer);
						splitToFormatRoot(endContainer);

						// Unwrap start/end to get real elements again
						startContainer = unwrap(TRUE);
						endContainer = unwrap();
					} else
						startContainer = endContainer = splitToFormatRoot(startContainer);

					// Update range positions since they might have changed after the split operations
					rng.startContainer = startContainer.parentNode;
					rng.startOffset = nodeIndex(startContainer);
					rng.endContainer = endContainer.parentNode;
					rng.endOffset = nodeIndex(endContainer) + 1;
				}

				// Remove items between start/end
				rangeUtils.walk(rng, function(nodes) {
					each(nodes, function(node) {
						process(node);
					});
				});
			};

			// Handle node
			if (node) {
				rng = dom.createRng();
				rng.setStartBefore(node);
				rng.setEndAfter(node);
				removeRngStyle(rng);
				return;
			}

			if (!selection.isCollapsed() || !format.inline) {
				bookmark = selection.getBookmark();
				removeRngStyle(selection.getRng(TRUE));
				selection.moveToBookmark(bookmark);

				// Check if start element still has formatting then we are at: "<b>text|</b>text" and need to move the start into the next text node
				if (match(name, vars, selection.getStart())) {
					moveStart(selection.getRng(true));
				}

				ed.nodeChanged();
			} else
				performCaretAction('remove', name, vars);
		};

		function toggle(name, vars, node) {
			if (match(name, vars, node))
				remove(name, vars, node);
			else
				apply(name, vars, node);
		};

		function matchNode(node, name, vars, similar) {
			var formatList = get(name), format, i, classes;

			function matchItems(node, format, item_name) {
				var key, value, items = format[item_name], i;

				// Check all items
				if (items) {
					// Non indexed object
					if (items.length === undefined) {
						for (key in items) {
							if (items.hasOwnProperty(key)) {
								if (item_name === 'attributes')
									value = dom.getAttrib(node, key);
								else
									value = getStyle(node, key);

								if (similar && !value && !format.exact)
									return;

								if ((!similar || format.exact) && !isEq(value, replaceVars(items[key], vars)))
									return;
							}
						}
					} else {
						// Only one match needed for indexed arrays
						for (i = 0; i < items.length; i++) {
							if (item_name === 'attributes' ? dom.getAttrib(node, items[i]) : getStyle(node, items[i]))
								return format;
						}
					}
				}

				return format;
			};

			if (formatList && node) {
				// Check each format in list
				for (i = 0; i < formatList.length; i++) {
					format = formatList[i];

					// Name name, attributes, styles and classes
					if (matchName(node, format) && matchItems(node, format, 'attributes') && matchItems(node, format, 'styles')) {
						// Match classes
						if (classes = format.classes) {
							for (i = 0; i < classes.length; i++) {
								if (!dom.hasClass(node, classes[i]))
									return;
							}
						}

						return format;
					}
				}
			}
		};

		function match(name, vars, node) {
			var startNode, i;

			function matchParents(node) {
				// Find first node with similar format settings
				node = dom.getParent(node, function(node) {
					return !!matchNode(node, name, vars, true);
				});

				// Do an exact check on the similar format element
				return matchNode(node, name, vars);
			};

			// Check specified node
			if (node)
				return matchParents(node);

			// Check pending formats
			if (selection.isCollapsed()) {
				for (i = pendingFormats.apply.length - 1; i >= 0; i--) {
					if (pendingFormats.apply[i].name == name)
						return true;
				}

				for (i = pendingFormats.remove.length - 1; i >= 0; i--) {
					if (pendingFormats.remove[i].name == name)
						return false;
				}

				return matchParents(selection.getNode());
			}

			// Check selected node
			node = selection.getNode();
			if (matchParents(node))
				return TRUE;

			// Check start node if it's different
			startNode = selection.getStart();
			if (startNode != node) {
				if (matchParents(startNode))
					return TRUE;
			}

			return FALSE;
		};

		function matchAll(names, vars) {
			var startElement, matchedFormatNames = [], checkedMap = {}, i, ni, name;

			// If the selection is collapsed then check pending formats
			if (selection.isCollapsed()) {
				for (ni = 0; ni < names.length; ni++) {
					// If the name is to be removed, then stop it from being added
					for (i = pendingFormats.remove.length - 1; i >= 0; i--) {
						name = names[ni];

						if (pendingFormats.remove[i].name == name) {
							checkedMap[name] = true;
							break;
						}
					}
				}

				// If the format is to be applied
				for (i = pendingFormats.apply.length - 1; i >= 0; i--) {
					for (ni = 0; ni < names.length; ni++) {
						name = names[ni];

						if (!checkedMap[name] && pendingFormats.apply[i].name == name) {
							checkedMap[name] = true;
							matchedFormatNames.push(name);
						}
					}
				}
			}

			// Check start of selection for formats
			startElement = selection.getStart();
			dom.getParent(startElement, function(node) {
				var i, name;

				for (i = 0; i < names.length; i++) {
					name = names[i];

					if (!checkedMap[name] && matchNode(node, name, vars)) {
						checkedMap[name] = true;
						matchedFormatNames.push(name);
					}
				}
			});

			return matchedFormatNames;
		};

		function canApply(name) {
			var formatList = get(name), startNode, parents, i, x, selector;

			if (formatList) {
				startNode = selection.getStart();
				parents = getParents(startNode);

				for (x = formatList.length - 1; x >= 0; x--) {
					selector = formatList[x].selector;

					// Format is not selector based, then always return TRUE
					if (!selector)
						return TRUE;

					for (i = parents.length - 1; i >= 0; i--) {
						if (dom.is(parents[i], selector))
							return TRUE;
					}
				}
			}

			return FALSE;
		};

		// Expose to public
		tinymce.extend(this, {
			get : get,
			register : register,
			apply : apply,
			remove : remove,
			toggle : toggle,
			match : match,
			matchAll : matchAll,
			matchNode : matchNode,
			canApply : canApply
		});

		// Private functions

		function matchName(node, format) {
			// Check for inline match
			if (isEq(node, format.inline))
				return TRUE;

			// Check for block match
			if (isEq(node, format.block))
				return TRUE;

			// Check for selector match
			if (format.selector)
				return dom.is(node, format.selector);
		};

		function isEq(str1, str2) {
			str1 = str1 || '';
			str2 = str2 || '';

			str1 = '' + (str1.nodeName || str1);
			str2 = '' + (str2.nodeName || str2);

			return str1.toLowerCase() == str2.toLowerCase();
		};

		function getStyle(node, name) {
			var styleVal = dom.getStyle(node, name);

			// Force the format to hex
			if (name == 'color' || name == 'backgroundColor')
				styleVal = dom.toHex(styleVal);

			// Opera will return bold as 700
			if (name == 'fontWeight' && styleVal == 700)
				styleVal = 'bold';

			return '' + styleVal;
		};

		function replaceVars(value, vars) {
			if (typeof(value) != "string")
				value = value(vars);
			else if (vars) {
				value = value.replace(/%(\w+)/g, function(str, name) {
					return vars[name] || str;
				});
			}

			return value;
		};

		function isWhiteSpaceNode(node) {
			return node && node.nodeType === 3 && /^([\s\r\n]+|)$/.test(node.nodeValue);
		};

		function wrap(node, name, attrs) {
			var wrapper = dom.create(name, attrs);

			node.parentNode.insertBefore(wrapper, node);
			wrapper.appendChild(node);

			return wrapper;
		};

		function expandRng(rng, format, remove) {
			var startContainer = rng.startContainer,
				startOffset = rng.startOffset,
				endContainer = rng.endContainer,
				endOffset = rng.endOffset, sibling, lastIdx;

			// This function walks up the tree if there is no siblings before/after the node
			function findParentContainer(container, child_name, sibling_name, root) {
				var parent, child;

				root = root || dom.getRoot();

				for (;;) {
					// Check if we can move up are we at root level or body level
					parent = container.parentNode;

					// Stop expanding on block elements or root depending on format
					if (parent == root || (!format[0].block_expand && isBlock(parent)))
						return container;

					for (sibling = parent[child_name]; sibling && sibling != container; sibling = sibling[sibling_name]) {
						if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
							return container;

						if (sibling.nodeType == 3 && !isWhiteSpaceNode(sibling))
							return container;
					}

					container = container.parentNode;
				}

				return container;
			};

			// If index based start position then resolve it
			if (startContainer.nodeType == 1 && startContainer.hasChildNodes()) {
				lastIdx = startContainer.childNodes.length - 1;
				startContainer = startContainer.childNodes[startOffset > lastIdx ? lastIdx : startOffset];

				if (startContainer.nodeType == 3)
					startOffset = 0;
			}

			// If index based end position then resolve it
			if (endContainer.nodeType == 1 && endContainer.hasChildNodes()) {
				lastIdx = endContainer.childNodes.length - 1;
				endContainer = endContainer.childNodes[endOffset > lastIdx ? lastIdx : endOffset - 1];

				if (endContainer.nodeType == 3)
					endOffset = endContainer.nodeValue.length;
			}

			// Exclude bookmark nodes if possible
			if (isBookmarkNode(startContainer.parentNode))
				startContainer = startContainer.parentNode;

			if (isBookmarkNode(startContainer))
				startContainer = startContainer.nextSibling || startContainer;

			if (isBookmarkNode(endContainer.parentNode))
				endContainer = endContainer.parentNode;

			if (isBookmarkNode(endContainer))
				endContainer = endContainer.previousSibling || endContainer;

			// Move start/end point up the tree if the leaves are sharp and if we are in different containers
			// Example * becomes !: !<p><b><i>*text</i><i>text*</i></b></p>!
			// This will reduce the number of wrapper elements that needs to be created
			// Move start point up the tree
			if (format[0].inline || format[0].block_expand) {
				startContainer = findParentContainer(startContainer, 'firstChild', 'nextSibling');
				endContainer = findParentContainer(endContainer, 'lastChild', 'previousSibling');
			}

			// Expand start/end container to matching selector
			if (format[0].selector && format[0].expand !== FALSE && !format[0].inline) {
				function findSelectorEndPoint(container, sibling_name) {
					var parents, i, y;

					if (container.nodeType == 3 && container.nodeValue.length == 0 && container[sibling_name])
						container = container[sibling_name];

					parents = getParents(container);
					for (i = 0; i < parents.length; i++) {
						for (y = 0; y < format.length; y++) {
							if (dom.is(parents[i], format[y].selector))
								return parents[i];
						}
					}

					return container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findSelectorEndPoint(startContainer, 'previousSibling');
				endContainer = findSelectorEndPoint(endContainer, 'nextSibling');
			}

			// Expand start/end container to matching block element or text node
			if (format[0].block || format[0].selector) {
				function findBlockEndPoint(container, sibling_name, sibling_name2) {
					var node;

					// Expand to block of similar type
					if (!format[0].wrapper)
						node = dom.getParent(container, format[0].block);

					// Expand to first wrappable block element or any block element
					if (!node)
						node = dom.getParent(container.nodeType == 3 ? container.parentNode : container, isBlock);

					// Exclude inner lists from wrapping
					if (node && format[0].wrapper)
						node = getParents(node, 'ul,ol').reverse()[0] || node;

					// Didn't find a block element look for first/last wrappable element
					if (!node) {
						node = container;

						while (node[sibling_name] && !isBlock(node[sibling_name])) {
							node = node[sibling_name];

							// Break on BR but include it will be removed later on
							// we can't remove it now since we need to check if it can be wrapped
							if (isEq(node, 'br'))
								break;
						}
					}

					return node || container;
				};

				// Find new startContainer/endContainer if there is better one
				startContainer = findBlockEndPoint(startContainer, 'previousSibling');
				endContainer = findBlockEndPoint(endContainer, 'nextSibling');

				// Non block element then try to expand up the leaf
				if (format[0].block) {
					if (!isBlock(startContainer))
						startContainer = findParentContainer(startContainer, 'firstChild', 'nextSibling');

					if (!isBlock(endContainer))
						endContainer = findParentContainer(endContainer, 'lastChild', 'previousSibling');
				}
			}

			// Setup index for startContainer
			if (startContainer.nodeType == 1) {
				startOffset = nodeIndex(startContainer);
				startContainer = startContainer.parentNode;
			}

			// Setup index for endContainer
			if (endContainer.nodeType == 1) {
				endOffset = nodeIndex(endContainer) + 1;
				endContainer = endContainer.parentNode;
			}

			// Return new range like object
			return {
				startContainer : startContainer,
				startOffset : startOffset,
				endContainer : endContainer,
				endOffset : endOffset
			};
		}

		function removeFormat(format, vars, node, compare_node) {
			var i, attrs, stylesModified;

			// Check if node matches format
			if (!matchName(node, format))
				return FALSE;

			// Should we compare with format attribs and styles
			if (format.remove != 'all') {
				// Remove styles
				each(format.styles, function(value, name) {
					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(getStyle(compare_node, name), value))
						dom.setStyle(node, name, '');

					stylesModified = 1;
				});

				// Remove style attribute if it's empty
				if (stylesModified && dom.getAttrib(node, 'style') == '') {
					node.removeAttribute('style');
					node.removeAttribute('_mce_style');
				}

				// Remove attributes
				each(format.attributes, function(value, name) {
					var valueOut;

					value = replaceVars(value, vars);

					// Indexed array
					if (typeof(name) === 'number') {
						name = value;
						compare_node = 0;
					}

					if (!compare_node || isEq(dom.getAttrib(compare_node, name), value)) {
						// Keep internal classes
						if (name == 'class') {
							value = dom.getAttrib(node, name);
							if (value) {
								// Build new class value where everything is removed except the internal prefixed classes
								valueOut = '';
								each(value.split(/\s+/), function(cls) {
									if (/mce\w+/.test(cls))
										valueOut += (valueOut ? ' ' : '') + cls;
								});

								// We got some internal classes left
								if (valueOut) {
									dom.setAttrib(node, name, valueOut);
									return;
								}
							}
						}

						// IE6 has a bug where the attribute doesn't get removed correctly
						if (name == "class")
							node.removeAttribute('className');

						// Remove mce prefixed attributes
						if (MCE_ATTR_RE.test(name))
							node.removeAttribute('_mce_' + name);

						node.removeAttribute(name);
					}
				});

				// Remove classes
				each(format.classes, function(value) {
					value = replaceVars(value, vars);

					if (!compare_node || dom.hasClass(compare_node, value))
						dom.removeClass(node, value);
				});

				// Check for non internal attributes
				attrs = dom.getAttribs(node);
				for (i = 0; i < attrs.length; i++) {
					if (attrs[i].nodeName.indexOf('_') !== 0)
						return FALSE;
				}
			}

			// Remove the inline child if it's empty for example <b> or <span>
			if (format.remove != 'none') {
				removeNode(node, format);
				return TRUE;
			}
		};

		function removeNode(node, format) {
			var parentNode = node.parentNode, rootBlockElm;

			if (format.block) {
				if (!forcedRootBlock) {
					function find(node, next, inc) {
						node = getNonWhiteSpaceSibling(node, next, inc);

						return !node || (node.nodeName == 'BR' || isBlock(node));
					};

					// Append BR elements if needed before we remove the block
					if (isBlock(node) && !isBlock(parentNode)) {
						if (!find(node, FALSE) && !find(node.firstChild, TRUE, 1))
							node.insertBefore(dom.create('br'), node.firstChild);

						if (!find(node, TRUE) && !find(node.lastChild, FALSE, 1))
							node.appendChild(dom.create('br'));
					}
				} else {
					// Wrap the block in a forcedRootBlock if we are at the root of document
					if (parentNode == dom.getRoot()) {
						if (!format.list_block || !isEq(node, format.list_block)) {
							each(tinymce.grep(node.childNodes), function(node) {
								if (isValid(forcedRootBlock, node.nodeName.toLowerCase())) {
									if (!rootBlockElm)
										rootBlockElm = wrap(node, forcedRootBlock);
									else
										rootBlockElm.appendChild(node);
								} else
									rootBlockElm = 0;
							});
						}
					}
				}
			}

			// Never remove nodes that isn't the specified inline element if a selector is specified too
			if (format.selector && format.inline && !isEq(format.inline, node))
				return;

			dom.remove(node, 1);
		};

		function getNonWhiteSpaceSibling(node, next, inc) {
			if (node) {
				next = next ? 'nextSibling' : 'previousSibling';

				for (node = inc ? node : node[next]; node; node = node[next]) {
					if (node.nodeType == 1 || !isWhiteSpaceNode(node))
						return node;
				}
			}
		};

		function isBookmarkNode(node) {
			return node && node.nodeType == 1 && node.getAttribute('_mce_type') == 'bookmark';
		};

		function mergeSiblings(prev, next) {
			var marker, sibling, tmpSibling;

			function compareElements(node1, node2) {
				// Not the same name
				if (node1.nodeName != node2.nodeName)
					return FALSE;

				function getAttribs(node) {
					var attribs = {};

					each(dom.getAttribs(node), function(attr) {
						var name = attr.nodeName.toLowerCase();

						// Don't compare internal attributes or style
						if (name.indexOf('_') !== 0 && name !== 'style')
							attribs[name] = dom.getAttrib(node, name);
					});

					return attribs;
				};

				function compareObjects(obj1, obj2) {
					var value, name;

					for (name in obj1) {
						// Obj1 has item obj2 doesn't have
						if (obj1.hasOwnProperty(name)) {
							value = obj2[name];

							// Obj2 doesn't have obj1 item
							if (value === undefined)
								return FALSE;

							// Obj2 item has a different value
							if (obj1[name] != value)
								return FALSE;

							// Delete similar value
							delete obj2[name];
						}
					}

					// Check if obj 2 has something obj 1 doesn't have
					for (name in obj2) {
						// Obj2 has item obj1 doesn't have
						if (obj2.hasOwnProperty(name))
							return FALSE;
					}

					return TRUE;
				};

				// Attribs are not the same
				if (!compareObjects(getAttribs(node1), getAttribs(node2)))
					return FALSE;

				// Styles are not the same
				if (!compareObjects(dom.parseStyle(dom.getAttrib(node1, 'style')), dom.parseStyle(dom.getAttrib(node2, 'style'))))
					return FALSE;

				return TRUE;
			};

			// Check if next/prev exists and that they are elements
			if (prev && next) {
				function findElementSibling(node, sibling_name) {
					for (sibling = node; sibling; sibling = sibling[sibling_name]) {
						if (sibling.nodeType == 3 && !isWhiteSpaceNode(sibling))
							return node;

						if (sibling.nodeType == 1 && !isBookmarkNode(sibling))
							return sibling;
					}

					return node;
				};

				// If previous sibling is empty then jump over it
				prev = findElementSibling(prev, 'previousSibling');
				next = findElementSibling(next, 'nextSibling');

				// Compare next and previous nodes
				if (compareElements(prev, next)) {
					// Append nodes between
					for (sibling = prev.nextSibling; sibling && sibling != next;) {
						tmpSibling = sibling;
						sibling = sibling.nextSibling;
						prev.appendChild(tmpSibling);
					}

					// Remove next node
					dom.remove(next);

					// Move children into prev node
					each(tinymce.grep(next.childNodes), function(node) {
						prev.appendChild(node);
					});

					return prev;
				}
			}

			return next;
		};

		function isTextBlock(name) {
			return /^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(name);
		};

		function getContainer(rng, start) {
			var container, offset, lastIdx;

			container = rng[start ? 'startContainer' : 'endContainer'];
			offset = rng[start ? 'startOffset' : 'endOffset'];

			if (container.nodeType == 1) {
				lastIdx = container.childNodes.length - 1;

				if (!start && offset)
					offset--;

				container = container.childNodes[offset > lastIdx ? lastIdx : offset];
			}

			return container;
		};

		function performCaretAction(type, name, vars) {
			var i, currentPendingFormats = pendingFormats[type],
				otherPendingFormats = pendingFormats[type == 'apply' ? 'remove' : 'apply'];

			function hasPending() {
				return pendingFormats.apply.length || pendingFormats.remove.length;
			};

			function resetPending() {
				pendingFormats.apply = [];
				pendingFormats.remove = [];
			};

			function perform(caret_node) {
				// Apply pending formats
				each(pendingFormats.apply.reverse(), function(item) {
					apply(item.name, item.vars, caret_node);
				});

				// Remove pending formats
				each(pendingFormats.remove.reverse(), function(item) {
					remove(item.name, item.vars, caret_node);
				});

				dom.remove(caret_node, 1);
				resetPending();
			};

			// Check if it already exists then ignore it
			for (i = currentPendingFormats.length - 1; i >= 0; i--) {
				if (currentPendingFormats[i].name == name)
					return;
			}

			currentPendingFormats.push({name : name, vars : vars});

			// Check if it's in the other type, then remove it
			for (i = otherPendingFormats.length - 1; i >= 0; i--) {
				if (otherPendingFormats[i].name == name)
					otherPendingFormats.splice(i, 1);
			}

			// Pending apply or remove formats
			if (hasPending()) {
				ed.getDoc().execCommand('FontName', false, 'mceinline');
				pendingFormats.lastRng = selection.getRng();

				// IE will convert the current word
				each(dom.select('font,span'), function(node) {
					var bookmark;

					if (isCaretNode(node)) {
						bookmark = selection.getBookmark();
						perform(node);
						selection.moveToBookmark(bookmark);
						ed.nodeChanged();
					}
				});

				// Only register listeners once if we need to
				if (!pendingFormats.isListening && hasPending()) {
					pendingFormats.isListening = true;

					each('onKeyDown,onKeyUp,onKeyPress,onMouseUp'.split(','), function(event) {
						ed[event].addToTop(function(ed, e) {
							// Do we have pending formats and is the selection moved has moved
							if (hasPending() && !tinymce.dom.RangeUtils.compareRanges(pendingFormats.lastRng, selection.getRng())) {
								each(dom.select('font,span'), function(node) {
									var textNode, rng;

									// Look for marker
									if (isCaretNode(node)) {
										textNode = node.firstChild;

										if (textNode) {
											perform(node);

											rng = dom.createRng();
											rng.setStart(textNode, textNode.nodeValue.length);
											rng.setEnd(textNode, textNode.nodeValue.length);
											selection.setRng(rng);
											ed.nodeChanged();
										} else
											dom.remove(node);
									}
								});

								// Always unbind and clear pending styles on keyup
								if (e.type == 'keyup' || e.type == 'mouseup')
									resetPending();
							}
						});
					});
				}
			}
		};
	};
})(tinymce);

tinymce.onAddEditor.add(function(tinymce, ed) {
	var filters, fontSizes, dom, settings = ed.settings;

	if (settings.inline_styles) {
		fontSizes = tinymce.explode(settings.font_size_style_values);

		function replaceWithSpan(node, styles) {
			tinymce.each(styles, function(value, name) {
				if (value)
					dom.setStyle(node, name, value);
			});

			dom.rename(node, 'span');
		};

		filters = {
			font : function(dom, node) {
				replaceWithSpan(node, {
					backgroundColor : node.style.backgroundColor,
					color : node.color,
					fontFamily : node.face,
					fontSize : fontSizes[parseInt(node.size) - 1]
				});
			},

			u : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'underline'
				});
			},

			strike : function(dom, node) {
				replaceWithSpan(node, {
					textDecoration : 'line-through'
				});
			}
		};

		function convert(editor, params) {
			dom = editor.dom;

			if (settings.convert_fonts_to_spans) {
				tinymce.each(dom.select('font,u,strike', params.node), function(node) {
					filters[node.nodeName.toLowerCase()](ed.dom, node);
				});
			}
		};

		ed.onPreProcess.add(convert);

		ed.onInit.add(function() {
			ed.selection.onSetContent.add(convert);
		});
	}
});

