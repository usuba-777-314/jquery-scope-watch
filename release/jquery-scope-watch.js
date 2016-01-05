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
        }
        /**
         * Shallow copy a value.
         * @method scope.CollectionWatcher.copy
         * @static
         * @private
         * @param {any} value
         * @returns {any} Value after shallow copying.
         */
        CollectionWatcher.copy = function (value) {
            if (!(value != null && typeof value === 'object')) {
                return value;
            }
            if (Array.isArray(value)) {
                var array = [];
                value.forEach(function (v, i) { return array[i] = v; });
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
    })();
    scope.CollectionWatcher = CollectionWatcher;
})(scope || (scope = {}));
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
            return this.root.generate();
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * @method scope.Scope.watch
         * @static
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.watch = function (expression, apply) {
            return this.root.watch(expression, apply);
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * Shallow watch the properties of an object, and to applied.
         * @method scope.Scope.watchCollection
         * @static
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.watchCollection = function (expression, apply) {
            return this.root.watchCollection(expression, apply);
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope.apply
         * @static
         */
        Scope.apply = function () {
            this.root.apply();
        };
        /**
         * Remove all scopes.
         * @method scope.Scope.destroy
         * @static
         */
        Scope.destroy = function () {
            this.root.destroy();
        };
        /**
         * Generate a new child scope.
         * @method scope.Scope#generate
         * @returns {scope.Scope}
         */
        Scope.prototype.generate = function () {
            var scope = Object.create(this);
            scope.parent = this;
            this.children.push(scope);
            return scope;
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * @method scope.Scope#watch
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watch = function (expression, apply) {
            var _this = this;
            var valueGetter;
            switch (typeof expression) {
                case 'string':
                    valueGetter = function () { return _this.parse(expression); };
                    break;
                case 'Function':
                    valueGetter = expression;
                    break;
                default: valueGetter = function () { return expression; };
            }
            var watcher = new scope_1.Watcher(valueGetter, apply);
            this.watchers.push(watcher);
            return function () {
                _this.watchers.splice(_this.watchers.indexOf(watcher), 1);
            };
        };
        /**
         * Registers a apply callback to be executed the value changes.
         * Shallow watch the properties of an object, and to applied.
         * @method scope.Scope#watchCollection
         * @param {any} expression
         * @param {(newValue: any, oldValue: any) => void} apply
         * @returns {Function} A deregistration function for this apply.
         */
        Scope.prototype.watchCollection = function (expression, apply) {
            var _this = this;
            var valueGetter;
            switch (typeof expression) {
                case 'string':
                    valueGetter = function () { return _this.parse(expression); };
                    break;
                case 'Function':
                    valueGetter = expression;
                    break;
                default: valueGetter = function () { return expression; };
            }
            var watcher = new scope_1.CollectionWatcher(valueGetter, apply);
            this.watchers.push(watcher);
            return function () {
                _this.watchers.splice(_this.watchers.indexOf(watcher), 1);
            };
        };
        /**
         * If the values has been changed, it apply.
         * @method scope.Scope#apply
         */
        Scope.prototype.apply = function () {
            this.watchers.forEach(function (w) { return w.call(); });
            this.children.forEach(function (s) { return s.apply(); });
        };
        /**
         * Remove the current scope (and all of its children) from parent scope.
         * @method scope.Scope#destory
         */
        Scope.prototype.destroy = function () {
            if (this.destroyed)
                return;
            this.destroyed = true;
            $.extend([], this.children).forEach(function (scope) { return scope.destroy(); });
            if (this.parent)
                this.parent.children.splice(this.parent.children.indexOf(this), 1);
            this.parent = null;
            this.children = null;
            this.watchers = null;
            if (this === Scope.root)
                Scope._root = undefined;
        };
        /**
         *
         * @method scope.Scope#repeat
         * @param {any} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         * @returns {JQuery}
         */
        Scope.prototype.repeat = function (expression, valueKey, rowGenerator, primaryKey) {
            return scope_1.Repeater.generate(this, expression, valueKey, rowGenerator, primaryKey);
        };
        /**
         * Parse a expression.
         * @method scope.Scope#parse
         * @private
         * @param {string} expression
         * @returns {any} Value after Parsing.
         */
        Scope.prototype.parse = function (expression) {
            return expression
                .split('.')
                .reduce(function (o, k) { return o && o[k]; }, this);
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
        Object.defineProperty(Scope.prototype, "root", {
            /**
             * Reference to the root scope.
             * @method scope.Scope#root
             * @returns {scope.Scope}
             */
            get: function () {
                return Scope.root;
            },
            enumerable: true,
            configurable: true
        });
        return Scope;
    })();
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
     *
     * @class scope.Repeater
     */
    var Repeater = (function () {
        /**
         * @constructor
         * @param {scope.Scope} scope
         * @param {any} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         */
        function Repeater(scope, expression, valueKey, rowGenerator, primaryKey) {
            this.scope = scope;
            this.expression = expression;
            this.valueKey = valueKey;
            this.rowGenerator = rowGenerator;
            this.primaryKey = primaryKey;
            /**
             * @member scope.Repeater#keys
             * @type {any[]}
             */
            this.keys = [];
            /**
             * @member scope.Repeater#rowMap
             * @type {IRowMap}
             */
            this.rowMap = {};
            this.startComment = document.createComment('start repeater');
            this.endComment = document.createComment('end repeater');
            scope.watchCollection(expression, this.render.bind(this));
        }
        /**
         *
         * @method scope.Repeater.generate
         * @static
         * @param {scope.Scope} scope
         * @param {any} expression
         * @param {string} valueKey
         * @param {(s: Scope) => JQuery} rowGenerator
         * @param {string} primaryKey
         * @returns {JQuery}
         */
        Repeater.generate = function (scope, expression, valueKey, rowGenerator, primaryKey) {
            var repeater = new Repeater(scope, expression, valueKey, rowGenerator, primaryKey);
            return $([repeater.startComment, repeater.endComment]);
        };
        /**
         *
         * @method scope.Repeater#render
         * @private
         * @param {{}} src
         */
        Repeater.prototype.render = function (src) {
            var _this = this;
            var col = this.getCollection(src);
            col.forEach(function (data, index) {
                var row = _this.rowMap[data.key] =
                    _this.rowMap[data.key] || _this.generateRow(data.value);
                row.scope[_this.valueKey] = data.value;
                if (data.key === _this.keys[index])
                    return;
                var $prevRow = index ? _this.rowMap[_this.keys[index - 1]].elem : $(_this.startComment);
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
         * @method scope.Repeater#destroyRow
         * @private
         * @param {any} key
         */
        Repeater.prototype.destroyRow = function (key) {
            var row = this.rowMap[key];
            if (!row)
                return;
            row.scope.destroy();
            row.elem.remove();
            delete this.rowMap[key];
        };
        /**
         *
         * @method scope.Repeater#generateRow
         * @private
         * @returns {IRow}
         */
        Repeater.prototype.generateRow = function (value) {
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
         * @method scope.Repeater#getCollection
         * @private
         * @param {{}} src
         * @returns {IData[]}
         */
        Repeater.prototype.getCollection = function (src) {
            var _this = this;
            return Object.keys(src)
                .filter(function (k) { return src.hasOwnProperty(k); })
                .map(function (key) {
                return {
                    key: _this.primaryKey ? src[key][_this.primaryKey] : key,
                    value: src[key]
                };
            });
        };
        return Repeater;
    })();
    scope_2.Repeater = Repeater;
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
        }
        /**
         * If the value has been changed, it apply.
         * @method scope.Watcher#call
         */
        Watcher.prototype.call = function () {
            this.oldValue = this.newValue;
            this.newValue = this.valueGetter();
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
    })();
    scope.Watcher = Watcher;
})(scope || (scope = {}));