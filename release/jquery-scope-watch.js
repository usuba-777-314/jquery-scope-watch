/*!
 * jquery-scope-watch v0.0.0 - Watch the value, and to applied.
 * Copyright 2015 hironobu-igawa
 * license MIT
 */
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_1) {
    /**
     * Watch of scope.
     * @class scope.Scope
     */
    var Scope = (function () {
        function Scope() {
            /**
             * Reference to the parent scope.
             * @member scope.Scope#parent
             * @type {scope.Scope}
             */
            this.parent = undefined;
            /**
             * Reference to child scopes.
             * @member scope.Scope#children
             * @type {scope.Scope}
             */
            this.children = [];
            /**
             * Reference to watchers.
             * @member scope.Scope#watchers
             * @private
             * @type {Array}
             */
            this.watchers = [];
            /**
             * Reference to listeners.
             * @member scope.Scope#listeners
             * @private
             * @type {{}}
             */
            this.listeners = {};
            /**
             * "true" after destroy method is called.
             * "false" before that.
             * @member scope.Scope#destroyed
             * @private
             * @type {boolean}
             */
            this.destroyed = false;
        }
        /**
         * Generate a new child scope of the root scope.
         * @method scope.Scope.generate
         * @static
         * @returns {scope.Scope}
         */
        Scope.generate = function () {
            return Scope.root.generate();
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope.apply
         * @static
         */
        Scope.apply = function () {
            Scope.root.apply();
        };
        /**
         * Generate a new child scope.
         * @method scope.Scope#generate
         * @returns {scope.Scope}
         */
        Scope.prototype.generate = function () {
            var scope = Object.create(this);
            scope.parent = this;
            scope.children = [];
            scope.watchers = [];
            scope.listeners = [];
            scope.destroyed = false;
            this.children.push(scope);
            return scope;
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * @method scope.Scope#watch
         * @param {*} expression
         * @param {(newValue?: any, oldValue?: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watch = function (expression, apply) {
            var _this = this;
            var watcher = new scope_1.Watcher(this.generateValueGetter(expression), apply);
            this.watchers.push(watcher);
            return function () { _this.watchers.splice(_this.watchers.indexOf(watcher), 1); };
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * Shallow watch the properties of an object, and to applied.
         * @method scope.Scope#watchCollection
         * @param {*} expression
         * @param {(newValue?: any, oldValue?: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watchCollection = function (expression, apply) {
            var _this = this;
            var watcher = new scope_1.CollectionWatcher(this.generateValueGetter(expression), apply);
            this.watchers.push(watcher);
            return function () { _this.watchers.splice(_this.watchers.indexOf(watcher), 1); };
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope#apply
         */
        Scope.prototype.apply = function () {
            if (this.destroyed)
                return;
            this.watchers.forEach(function (w) { return w.call(); });
            this.children.forEach(function (s) { return s.apply(); });
        };
        /**
         * Listens on events of a given type.
         * @method scope.Scope#on
         * @param {string} name
         * @param {(args: *, argsN: *) => void} listener
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.on = function (name, listener) {
            var _this = this;
            if (!this.listeners[name])
                this.listeners[name] = [];
            this.listeners[name].push(listener);
            return function () {
                var index = _this.listeners[name].indexOf(listener);
                if (index === -1)
                    return;
                _this.listeners[name].splice(_this.listeners[name].indexOf(listener), 1);
            };
        };
        /**
         * Notice an event 'name' to children scopes.
         * @method scope.Scope#broadcast
         * @param {string} name
         * @param {*} args, argsN
         */
        Scope.prototype.broadcast = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.destroyed)
                return;
            if (this.listeners[name])
                this.listeners[name].forEach(function (l) { return l.apply(null, args); });
            this.children.forEach(function (s) { return s.broadcast(name, args); });
        };
        /**
         * Notice an event 'name' to parent scopes.
         * @method scope.Scope#emit
         * @param {string} name
         * @param {*} args, argsN
         */
        Scope.prototype.emit = function (name) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            if (this.destroyed)
                return;
            if (this.listeners[name])
                this.listeners[name].forEach(function (l) { return l.apply(null, args); });
            this.parent.emit(name, args);
        };
        /**
         * Remove the current scope (and all of its children) from parent scope.
         * @method scope.Scope#destory
         */
        Scope.prototype.destroy = function () {
            if (this.destroyed)
                return;
            var destroy = function (scope) {
                $.extend([], this.children).forEach(function (s) { return destroy(s); });
                scope.destroyed = true;
                if (scope.parent)
                    scope.parent.children.splice(scope.parent.children.indexOf(scope), 1);
                scope.parent = null;
                scope.children = null;
                scope.watchers = null;
                scope.listeners = null;
            };
            this.broadcast('destroy');
            destroy(this);
            if (this === Scope.root)
                Scope._root = undefined;
        };
        /**
         * Bind value to DOM text.
         * @param {*} expression
         * @param {*} selector
         */
        Scope.prototype.bind = function (expression, selector) {
            scope_1.BindWorker.apply(this, expression, $(selector));
        };
        /**
         * Show DOM, if expression result is true.
         * Otherwise hide DOM.
         * @param {*} expression
         * @param {*} selector
         */
        Scope.prototype.show = function (expression, selector) {
            scope_1.ShowWorker.apply(this, expression, $(selector));
        };
        /**
         * Hide DOM, if expression result is true.
         * Otherwise show DOM.
         * @param {*} expression
         * @param {*} selector
         */
        Scope.prototype.hide = function (expression, selector) {
            scope_1.HideWorker.apply(this, expression, $(selector));
        };
        /**
         * Add class to DOM, if expression result is true.
         * Otherwise remove class from DOM.
         * @param {*} expression
         * @param {*} selector
         * @param {string} klass
         */
        Scope.prototype.klass = function (expression, selector, klass) {
            scope_1.KlassWorker.apply(this, expression, $(selector), klass);
        };
        /**
         * Bind value attr of DOM.
         * @param {*} expression
         * @param {*} selector
         * @param {string} attr
         */
        Scope.prototype.attr = function (expression, selector, attr) {
            scope_1.AttrWorker.apply(this, expression, $(selector), attr);
        };
        /**
         * Call callback when click.
         * @param {*} selector
         * @param {string|Function} callback
         */
        Scope.prototype.click = function (selector, callback) {
            scope_1.ClickWorker.apply(this, $(selector), callback);
        };
        /**
         * Return InputWorker instance.
         * Bind scope value to input value, and bind input value to scope value.
         * @param {string} expression
         * @param {*} selector
         * @returns {InputWorker}
         */
        Scope.prototype.input = function (expression, selector) {
            return scope_1.InputWorker.generate(this, expression, $(selector));
        };
        /**
         * Return SelectWorker instance.
         * Bind scope value to input value, and bind input value to scope value.
         * @param {string} expression
         * @param {*} selector
         * @param {*} dataExpression
         * @param {string} valueKey
         * @param {string} labelKey
         * @returns {SelectWorker}
         */
        Scope.prototype.select = function (expression, selector, dataExpression, valueKey, labelKey) {
            return scope_1.SelectWorker.generate(this, expression, $(selector), dataExpression, valueKey, labelKey);
        };
        /**
         * Call callback when submit.
         * @param {*} selector
         * @param {string|Function} callback
         */
        Scope.prototype.submit = function (selector, callback) {
            scope_1.SubmitWorker.apply(this, $(selector), callback);
        };
        /**
         *
         * @method scope.Scope#repeat
         * @param {*} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         * @returns {JQuery}
         */
        Scope.prototype.repeat = function (expression, valueKey, rowGenerator, primaryKey) {
            return scope_1.RepeatWorker.generate(this, expression, valueKey, rowGenerator, primaryKey);
        };
        /**
         * Generate getter to expression result.
         * @param expression
         * @returns {(): any}
         */
        Scope.prototype.generateValueGetter = function (expression) {
            switch (typeof expression) {
                case 'string': return scope_1.Parser.generate(expression).bind(null, this);
                case 'function': return expression;
                default: return function () { return expression; };
            }
        };
        Object.defineProperty(Scope, "root", {
            /**
             * Reference to the root scope.
             * @method scope.Scope.root
             * @static
             * @returns {scope.Scope}
             */
            get: function () {
                return Scope._root || (Scope._root = new Scope());
            },
            enumerable: true,
            configurable: true
        });
        return Scope;
    }());
    scope_1.Scope = Scope;
})(scope || (scope = {}));
/// <reference path="Scope.ts" />
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope) {
    $.scope = scope.Scope;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_2) {
    /**
     * Parser for expression
     * @class scope.Parser
     */
    var Parser = (function () {
        function Parser() {
        }
        /**
         * Generate parser instance.
         * @param _expression
         * @return {}
         */
        Parser.generate = function (_expression) {
            var expression = Parser.compile(_expression);
            var getter = function (scope) {
                try {
                    eval('var ' + Parser.SCOPE + ' = scope');
                    return eval(expression);
                }
                catch (e) { }
            };
            var setter = function (scope, value) {
                try {
                    eval('var ' + Parser.SCOPE + ' = scope');
                    return eval(expression + ' = value');
                }
                catch (e) { }
            };
            return $.extend(getter, { assign: setter });
        };
        Parser.compile = function (expression) {
            return expression.replace(/[a-zA-Z$_][a-zA-Z$_0-9\.]*/g, function (str) { return Parser.SCOPE + '.' + str; });
        };
        Parser.SCOPE = 'scope';
        return Parser;
    }());
    scope_2.Parser = Parser;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_3) {
    /**
     * Worker to bind value attr of DOM
     * @class scope.AttrWorker
     */
    var AttrWorker = (function () {
        function AttrWorker() {
        }
        /**
         * Bind value attr of DOM.
         * @method scope.AttrWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {JQuery} $target
         * @param {string} attr
         */
        AttrWorker.apply = function (scope, expression, $target, attr) {
            scope.watch(expression, function (v) { return $target.attr(attr, v || null); });
        };
        return AttrWorker;
    }());
    scope_3.AttrWorker = AttrWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_4) {
    /**
     * Worker to bind value to DOM text
     * @class scope.BindWorker
     */
    var BindWorker = (function () {
        function BindWorker() {
        }
        /**
         * Bind value to DOM text.
         * Value is parse expression result.
         * @method scope.BindWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {JQuery} $target
         */
        BindWorker.apply = function (scope, expression, $target) {
            scope.watch(expression, function (v) { return $target.text(v || ''); });
        };
        return BindWorker;
    }());
    scope_4.BindWorker = BindWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_5) {
    /**
     * Worker to call callback where click
     * @class scope.ClickWorker
     */
    var ClickWorker = (function () {
        function ClickWorker() {
        }
        /**
         * Call callback where click
         * @method scope.ClickWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {JQuery} $target
         * @param {string|Function} _callback
         */
        ClickWorker.apply = function (scope, $target, _callback) {
            var callback = ClickWorker.compile(scope, _callback);
            var wrapper = function (event) {
                callback(event);
                $.scope.apply();
            };
            $target.on('click', wrapper);
            scope.on('destroy', function () { return $target.off('click', wrapper); });
        };
        /**
         * Compile expression to callback, if callback is expression.
         * @param {Scope} scope
         * @param {string|Function} callback
         * @returns {Function}
         */
        ClickWorker.compile = function (scope, callback) {
            return typeof callback === 'string'
                ? scope_5.Parser.generate(callback).bind(null, scope)
                : callback;
        };
        return ClickWorker;
    }());
    scope_5.ClickWorker = ClickWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_6) {
    /**
     * Worker to hide DOM
     * @class scope.HideWorker
     */
    var HideWorker = (function () {
        function HideWorker() {
        }
        /**
         * Hide DOM, if expression result is true.
         * Otherwise show DOM.
         * @method scope.HideWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {JQuery} $target
         */
        HideWorker.apply = function (scope, expression, $target) {
            scope.watch(expression, function (f) { return f ? $target.hide() : $target.show(); });
        };
        return HideWorker;
    }());
    scope_6.HideWorker = HideWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_7) {
    /**
     * Worker to Bind scope value to input value, and bind input value to scope value
     * @class scope.InputWorker
     */
    var InputWorker = (function () {
        /**
         * @constructor
         * @param {Scope} scope
         * @param {string} expression
         * @param {JQuery} $input
         */
        function InputWorker(scope, expression, $input) {
            this.scope = scope;
            this.expression = expression;
            this.$input = $input;
            this.callbacks = [];
        }
        /**
         * Generate InputWorker instance.
         * Bind scope value to input value, and bind input value to scope value.
         * @param {Scope} scope
         * @param {string} expression
         * @param {JQuery} $input
         */
        InputWorker.generate = function (scope, expression, $input) {
            var worker = new InputWorker(scope, expression, $input);
            worker.init();
            return worker;
        };
        /**
         * Call callback when change.
         * @param {string|Function} callback
         */
        InputWorker.prototype.change = function (callback) {
            this.callbacks.push(this.compile(callback));
        };
        /**
         * Initialize "input event/watch event".
         * Bind scope value to input value, and bind input value to scope value.
         * @private
         * @method scope.InputWorker#init
         */
        InputWorker.prototype.init = function () {
            var _this = this;
            this.scope.watch(this.expression, function (newValue) {
                if (!_this.isChanged(newValue))
                    return;
                _this.$input.val(newValue);
            });
            var setter = scope_7.Parser.generate(this.expression).assign;
            var inputCallback = function (event) {
                if (!_this.isChanged(_this.$input.val()))
                    return;
                setter(_this.scope, _this.$input.val());
                _this.callbacks.forEach(function (c) { return c(event); });
                $.scope.apply();
            };
            this.$input.on('change input', inputCallback);
            this.scope.on('destroy', function () { return _this.$input.off('change input', function () { }); });
        };
        /**
         * Compile expression to callback, if callback is expression.
         * @method scope.InputWorker#compile
         * @param {string|Function} callback
         * @returns {Function}
         */
        InputWorker.prototype.compile = function (callback) {
            return typeof callback === 'string'
                ? scope_7.Parser.generate(callback).bind(null, this.scope)
                : callback;
        };
        /**
         * If value was change, return true.
         * Otherwise return false.
         * @method scope.InputWorker#isChanged
         * @param {*} value
         * @return {boolean}
         */
        InputWorker.prototype.isChanged = function (value) {
            if (this.value === value)
                return false;
            this.value = value;
            return true;
        };
        return InputWorker;
    }());
    scope_7.InputWorker = InputWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_8) {
    /**
     * Worker to toggle class of DOM
     * @class scope.KlassWorker
     */
    var KlassWorker = (function () {
        function KlassWorker() {
        }
        /**
         * Add class to DOM, if expression result is true.
         * Otherwise remove class from DOM.
         * @method scope.KlassWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {JQuery} $target
         * @param {string} klass
         */
        KlassWorker.apply = function (scope, expression, $target, klass) {
            scope.watch(expression, function (f) { return f ? $target.addClass(klass) : $target.removeClass(klass); });
        };
        return KlassWorker;
    }());
    scope_8.KlassWorker = KlassWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_9) {
    /**
     *
     * @class scope.RepeatWorker
     */
    var RepeatWorker = (function () {
        /**
         * @constructor
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         */
        function RepeatWorker(scope, expression, valueKey, rowGenerator, primaryKey) {
            var _this = this;
            this.scope = scope;
            this.expression = expression;
            this.valueKey = valueKey;
            this.rowGenerator = rowGenerator;
            this.primaryKey = primaryKey;
            /**
             * @member scope.RepeatWorker#keys
             * @private
             * @type {*[]}
             */
            this.keys = [];
            /**
             * @member scope.RepeatWorker#rowMap
             * @private
             * @type {RowMap}
             */
            this.rowMap = new RowMap();
            this.startComment = document.createComment('start repeater');
            this.endComment = document.createComment('end repeater');
            scope.on('destroy', function () { return _this.rowMap.values.forEach(function (r) { return r.elem.remove(); }); });
            scope.watchCollection(expression, this.render.bind(this));
        }
        /**
         *
         * @method scope.RepeatWorker.generate
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         * @returns {JQuery}
         */
        RepeatWorker.generate = function (scope, expression, valueKey, rowGenerator, primaryKey) {
            var repeater = new RepeatWorker(scope, expression, valueKey, rowGenerator, primaryKey);
            return $([repeater.startComment, repeater.endComment]);
        };
        /**
         *
         * @method scope.RepeatWorker#render
         * @private
         * @param {{}} src
         */
        RepeatWorker.prototype.render = function (src) {
            var _this = this;
            var col = this.getCollection(src);
            col.forEach(function (data, index) {
                var row = _this.rowMap.get(data.key);
                if (!row)
                    _this.rowMap.put(data.key, (row = _this.generateRow(data.value)));
                row.scope[_this.valueKey] = data.value;
                if (data.key === _this.keys[index])
                    return;
                var $prevRow = index ? _this.rowMap.get(_this.keys[index - 1]).elem : $(_this.startComment);
                $prevRow.after(row.elem);
                var oldIndex = _this.keys.indexOf(data.key);
                if (oldIndex > -1)
                    _this.keys.splice(oldIndex, 1);
                _this.keys.splice(index, 0, data.key);
            });
            for (var i = col.length; i < this.keys.length; i++)
                this.destroyRow(this.keys[i]);
            this.keys.length = col.length;
        };
        /**
         *
         * @method scope.RepeatWorker#destroyRow
         * @private
         * @param {*} key
         */
        RepeatWorker.prototype.destroyRow = function (key) {
            var row = this.rowMap.get(key);
            if (!row)
                return;
            row.scope.destroy();
            row.elem.remove();
            delete this.rowMap.remove(key);
        };
        /**
         *
         * @method scope.RepeatWorker#generateRow
         * @private
         * @returns {IRow}
         */
        RepeatWorker.prototype.generateRow = function (value) {
            var scope = this.scope.generate();
            scope[this.valueKey] = value;
            var $elem = this.rowGenerator(scope);
            return {
                elem: $elem,
                scope: scope
            };
        };
        /**
         *
         * @method scope.RepeatWorker#getCollection
         * @private
         * @param {{}} src
         * @returns {IData[]}
         */
        RepeatWorker.prototype.getCollection = function (src) {
            var _this = this;
            var keys = src instanceof Array ? src.map(function (v, i) { return i; })
                : src ? Object.keys(src).filter(function (k) { return src.hasOwnProperty(k); })
                    : [];
            return keys.map(function (key) {
                return {
                    key: _this.primaryKey ? src[key][_this.primaryKey] : src[key],
                    value: src[key]
                };
            });
        };
        return RepeatWorker;
    }());
    scope_9.RepeatWorker = RepeatWorker;
    /**
     * @class RowMap
     */
    var RowMap = (function () {
        function RowMap() {
            /**
             * @member RowMap#_values
             * @private
             * @type {IData[]}
             */
            this._values = [];
        }
        /**
         * @method RowMap#put
         * @param {*} key
         * @param {IRow} row
         * @returns {RowMap}
         */
        RowMap.prototype.put = function (key, row) {
            this.remove(key);
            this._values.push({ key: key, row: row });
            return this;
        };
        /**
         * @method RowMap#remove
         * @param {*} key
         * @returns {RowMap}
         */
        RowMap.prototype.remove = function (key) {
            var index = this._values.map(function (o) { return o.key; }).indexOf(key);
            if (index === -1)
                return this;
            this._values.splice(index, 1);
            return this;
        };
        /**
         * @method RowMap#get
         * @param {*} key
         * @returns {IRow} value
         */
        RowMap.prototype.get = function (key) {
            var index = this._values.map(function (o) { return o.key; }).indexOf(key);
            return index > -1 ? this._values[index].row : null;
        };
        Object.defineProperty(RowMap.prototype, "values", {
            /**
             * @method RowMap#values
             * @returns {*[]}
             */
            get: function () {
                return this._values.map(function (o) { return o.row; });
            },
            enumerable: true,
            configurable: true
        });
        return RowMap;
    }());
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_10) {
    /**
     * Worker to Bind scope value to select value, and bind select value to scope value
     * @class scope.SelectWorker
     */
    var SelectWorker = (function () {
        /**
         * @constructor
         * @param {Scope} scope
         * @param {string} expression
         * @param {JQuery} $select
         * @param {string} dataExpression
         * @param {string} valueKey
         * @param {string} labelKey
         */
        function SelectWorker(scope, expression, $select, dataExpression, valueKey, labelKey) {
            this.scope = scope;
            this.expression = expression;
            this.$select = $select;
            this.dataExpression = dataExpression;
            this.valueKey = valueKey;
            this.labelKey = labelKey;
            this.value = NaN;
            this.callbacks = [];
        }
        /**
         * Generate SelectWorker instance.
         * Bind scope value to input value, and bind input value to scope value.
         * @param {Scope} scope
         * @param {string} expression
         * @param {JQuery} $select
         * @param {*} dataExpression
         * @param {string} valueKey
         * @param {string} labelKey
         */
        SelectWorker.generate = function (scope, expression, $select, dataExpression, valueKey, labelKey) {
            var worker = new SelectWorker(scope, expression, $select, dataExpression, valueKey, labelKey);
            worker.init();
            return worker;
        };
        /**
         * Call callback when change.
         * @param {string|Function} callback
         */
        SelectWorker.prototype.change = function (callback) {
            this.callbacks.push(this.compile(callback));
        };
        /**
         * Initialize "input event/watch event".
         * Bind scope value to input value, and bind input value to scope value.
         * @private
         * @method scope.SelectWorker#init
         */
        SelectWorker.prototype.init = function () {
            var _this = this;
            this.scope.repeat(this.dataExpression, 'option', function (scope) {
                var $option = $('<option>');
                var valueKey = _this.valueKey ? 'option.' + _this.valueKey : 'option';
                var labelKey = _this.labelKey ? 'option.' + _this.labelKey : 'option';
                scope.attr(valueKey, $option, 'value');
                scope.attr(labelKey, $option, 'label');
                scope.watch(valueKey, function (v) { return $option.data(SelectWorker.OPTION_VALUE_KEY, v || null); });
                return $option;
            }, this.valueKey).appendTo(this.$select);
            this.scope.watch(this.expression, function (newValue) {
                if (!_this.isChanged(newValue))
                    return;
                _this.$select.val(newValue);
            });
            var setter = scope_10.Parser.generate(this.expression).assign;
            var inputCallback = function (event) {
                if (!_this.isChanged(_this.getSelectValue()))
                    return;
                setter(_this.scope, _this.getSelectValue());
                _this.callbacks.forEach(function (c) { return c(event); });
                $.scope.apply();
            };
            this.$select.on('change input', inputCallback);
            this.scope.on('destroy', function () { return _this.$select.off('change input', function () { }); });
        };
        /**
         * Compile expression to callback, if callback is expression.
         * @method scope.SelectWorker#compile
         * @param {string|Function} callback
         * @returns {Function}
         */
        SelectWorker.prototype.compile = function (callback) {
            return typeof callback === 'string'
                ? scope_10.Parser.generate(callback).bind(null, this.scope)
                : callback;
        };
        /**
         * If value was change, return true.
         * Otherwise return false.
         * @method scope.SelectWorker#isChanged
         * @param {*} value
         * @return {boolean}
         */
        SelectWorker.prototype.isChanged = function (value) {
            if (this.value === value)
                return false;
            this.value = value;
            return true;
        };
        /**
         * Return input value.
         * @method scope.SelectWorker#getSelectValue
         * @return {*}
         */
        SelectWorker.prototype.getSelectValue = function () {
            return this.$select.find('option:selected').data(SelectWorker.OPTION_VALUE_KEY);
        };
        /**
         * @static
         * @private
         * @member scope.SelectWorker.OPTION_VALUE_KEY
         * @type {string}
         */
        SelectWorker.OPTION_VALUE_KEY = '_select_option_value';
        return SelectWorker;
    }());
    scope_10.SelectWorker = SelectWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_11) {
    /**
     * Worker to show DOM
     * @class scope.ShowWorker
     */
    var ShowWorker = (function () {
        function ShowWorker() {
        }
        /**
         * Show DOM, if expression result is true.
         * Otherwise hide DOM.
         * @method scope.ShowWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {*} expression
         * @param {JQuery} $target
         */
        ShowWorker.apply = function (scope, expression, $target) {
            scope.watch(expression, function (f) { return f ? $target.show() : $target.hide(); });
        };
        return ShowWorker;
    }());
    scope_11.ShowWorker = ShowWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope_12) {
    /**
     * Worker to call callback where submit
     * @class scope.SubmitWorker
     */
    var SubmitWorker = (function () {
        function SubmitWorker() {
        }
        /**
         * Call callback where submit
         * @method scope.SubmitWorker.apply
         * @static
         * @param {scope.Scope} scope
         * @param {JQuery} $target
         * @param {string|Function} _callback
         */
        SubmitWorker.apply = function (scope, $target, _callback) {
            var callback = SubmitWorker.compile(scope, _callback);
            var wrapper = function (event) {
                event.preventDefault();
                callback(event);
                $.scope.apply();
            };
            $target.on('submit', wrapper);
            scope.on('destroy', function () { return $target.off('submit', wrapper); });
        };
        /**
         * Compile expression to callback, if callback is expression.
         * @param {Scope} scope
         * @param {string|Function} callback
         * @returns {Function}
         */
        SubmitWorker.compile = function (scope, callback) {
            return typeof callback === 'string'
                ? scope_12.Parser.generate(callback).bind(null, scope)
                : callback;
        };
        return SubmitWorker;
    }());
    scope_12.SubmitWorker = SubmitWorker;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope) {
    /**
     * Shallow watch the properties of an object, and to applied.
     * @class scope.CollectionWatcher
     */
    var CollectionWatcher = (function () {
        /**
         * @constructor
         * @param {() => any} valueGetter
         * @param {(newValue: any, oldValue: any) => void} apply
         */
        function CollectionWatcher(valueGetter, apply) {
            this.valueGetter = valueGetter;
            this.apply = apply;
            this.newValue = NaN;
            this.oldValue = NaN;
        }
        /**
         * Shallow copy a value.
         * @method scope.CollectionWatcher.copy
         * @static
         * @private
         * @param {*} value
         * @returns {*} Value after shallow copying.
         */
        CollectionWatcher.copy = function (value) {
            if (!(value != null && typeof value === 'object')) {
                return value;
            }
            if (Array.isArray(value)) {
                var array = [];
                for (var k in value)
                    if (value.hasOwnProperty(k))
                        array[k] = value[k];
                return array;
            }
            var obj = {};
            for (var k in value)
                if (value.hasOwnProperty(k))
                    obj[k] = value[k];
            return obj;
        };
        /**
         * If the value has been changed, it apply.
         * @method scope.CollectionWatcher#call
         */
        CollectionWatcher.prototype.call = function () {
            var value = this.valueGetter();
            this.oldValue = this.newValue;
            this.newValue = CollectionWatcher.copy(this.valueGetter());
            if (!this.isChange())
                return;
            this.apply(value, this.oldValue);
        };
        /**
         * Check if the value has been changed.
         * @method scope.CollectionWatcher#isChange
         * @private
         * @returns {boolean} Return "true" if the value has been changed, else "false".
         */
        CollectionWatcher.prototype.isChange = function () {
            var _this = this;
            if (this.newValue == null || this.oldValue == null)
                return this.newValue != this.oldValue;
            if (typeof this.newValue !== 'object' || typeof this.oldValue !== 'object')
                return this.newValue !== this.oldValue;
            return Object.keys(this.newValue).concat(Object.keys(this.oldValue))
                .some(function (k) { return _this.newValue[k] !== _this.oldValue[k]; });
        };
        return CollectionWatcher;
    }());
    scope.CollectionWatcher = CollectionWatcher;
})(scope || (scope = {}));
/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
var scope;
(function (scope) {
    /**
     * Watch a value, and to applied.
     * @class scope.Watcher
     */
    var Watcher = (function () {
        /**
         * @constructor
         * @param {() => any} valueGetter
         * @param {(newValue: any, oldValue: any) => void} apply
         */
        function Watcher(valueGetter, apply) {
            this.valueGetter = valueGetter;
            this.apply = apply;
            this.newValue = NaN;
            this.oldValue = NaN;
        }
        /**
         * If the value has been changed, it apply.
         * @method scope.Watcher#call
         */
        Watcher.prototype.call = function () {
            this.oldValue = this.newValue;
            this.newValue = this.valueGetter();
            if (!this.apply)
                return;
            if (!this.isChange())
                return;
            this.apply(this.newValue, this.oldValue);
        };
        /**
         * Check if the value has been changed.
         * @method scope.Watcher#isChange
         * @private
         * @returns {boolean} Return "true" if the value has been changed, else "false".
         */
        Watcher.prototype.isChange = function () {
            return this.newValue !== this.oldValue;
        };
        return Watcher;
    }());
    scope.Watcher = Watcher;
})(scope || (scope = {}));
