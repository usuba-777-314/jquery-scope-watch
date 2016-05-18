/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   *
   * @class scope.RepeatWorker
   */
  export class RepeatWorker {
    /**
     *
     * @member scope.RepeatWorker#startComment
     * @private
     * @type {Comment}
     */
    private startComment: Comment;

    /**
     *
     * @member scope.RepeatWorker#endComment
     * @private
     * @type {Comment}
     */
    private endComment: Comment;

    /**
     * @member scope.RepeatWorker#keys
     * @private
     * @type {*[]}
     */
    private keys: any[] = [];

    /**
     * @member scope.RepeatWorker#rowMap
     * @private
     * @type {RowMap}
     */
    private rowMap: RowMap = new RowMap();

    /**
     * @constructor
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {string} valueKey
     * @param {(s: Scope) => JQuery} rowGenerator
     * @param {string} primaryKey
     */
    constructor(private scope: Scope,
                private expression: any,
                private valueKey: string,
                private rowGenerator: (s: Scope) => JQuery,
                private primaryKey?: string) {

      this.startComment = document.createComment('start repeater');
      this.endComment = document.createComment('end repeater');

      scope.on('destroy', () => this.rowMap.values.forEach((r: IRow) => r.elem.remove()));

      scope.watchCollection(expression, this.render.bind(this));
    }

    /**
     *
     * @method scope.Repeater.generate
     * @static
     * @param {scope.Scope} scope
     * @param {*} expression
     * @param {string} valueKey
     * @param {(s: Scope) => JQuery} rowGenerator
     * @param {string} primaryKey
     * @returns {JQuery}
     */
    static generate(scope: Scope,
                    expression: any,
                    valueKey: string,
                    rowGenerator: (s: Scope) => JQuery,
                    primaryKey?: string): JQuery {

      var repeater = new RepeatWorker(scope, expression, valueKey, rowGenerator, primaryKey);

      return $([repeater.startComment, repeater.endComment]);
    }

    /**
     *
     * @method scope.Repeater#render
     * @private
     * @param {{}} src
     */
    private render(src: {}) {
      var col = this.getCollection(src);
      col.forEach((data: IData, index: number) => {
        var row = this.rowMap.get(data.key);
        if (!row) this.rowMap.put(data.key, (row = this.generateRow(data.value)));
        row.scope[this.valueKey] = data.value;
        if (data.key === this.keys[index]) return;

        var $prevRow = index ? this.rowMap.get(this.keys[index - 1]).elem : $(this.startComment);
        $prevRow.after(row.elem);

        var oldIndex = this.keys.indexOf(data.key);
        if (oldIndex > -1) this.keys.splice(oldIndex, 1);
        this.keys.splice(index, 0, data.key);
      });
      for (var i = col.length; i < this.keys.length; i ++) this.destroyRow(this.keys[i]);
      this.keys.length = col.length;
    }

    /**
     *
     * @method scope.Repeater#destroyRow
     * @private
     * @param {*} key
     */
    private destroyRow(key: any) {

      var row = this.rowMap.get(key);
      if (!row) return;

      row.scope.destroy();
      row.elem.remove();
      delete this.rowMap.remove(key);
    }

    /**
     *
     * @method scope.Repeater#generateRow
     * @private
     * @returns {IRow}
     */
    private generateRow(value: any): IRow {

      var scope = this.scope.generate();
      scope[this.valueKey] = value;

      var $elem = this.rowGenerator(scope);

      return {
        elem: $elem,
        scope: scope
      };
    }

    /**
     *
     * @method scope.Repeater#getCollection
     * @private
     * @param {{}} src
     * @returns {IData[]}
     */
    private getCollection(src: {}): IData[] {
      var keys = src instanceof Array ? (<any[]>src).map((v: any, i: number) => i)
        : src ? Object.keys(src).filter((k: any) => src.hasOwnProperty(k))
        : [];
      return (<any[]>keys).map((key: any) => {
        return {
          key: this.primaryKey ? src[key][this.primaryKey] : src[key],
          value: src[key]
        }
      });
    }
  }

  /**
   *
   * @interface IData
   */
  interface IData {
    key: any;
    value: any;
  }

  /**
   * @class RowMap
   */
  class RowMap {
    /**
     * @member RowMap#_values
     * @private
     * @type {IData[]}
     */
    private _values: IRowMappingObject[] = [];

    /**
     * @method RowMap#put
     * @param {*} key
     * @param {IRow} row
     * @returns {RowMap}
     */
    put(key: any, row: IRow): RowMap {
      this.remove(key);
      this._values.push({key: key, row: row});
      return this;
    }

    /**
     * @method RowMap#remove
     * @param {*} key
     * @returns {RowMap}
     */
    remove(key: any): RowMap {
      var index = this._values.map((o: IRowMappingObject) => o.key).indexOf(key);
      if (index === -1) return this;
      this._values.splice(index, 1);
      return this;
    }

    /**
     * @method RowMap#get
     * @param {*} key
     * @returns {IRow} value
     */
    get(key: any): IRow {
      var index = this._values.map((o: IRowMappingObject) => o.key).indexOf(key);
      return index > -1 ? this._values[index].row : null;
    }

    /**
     * @method RowMap#values
     * @returns {*[]}
     */
    get values(): IRow[] {
      return this._values.map((o: IRowMappingObject) => o.row);
    }
  }

  interface IRowMappingObject {
    key: any;
    row: IRow;
  }

  /**
   *
   * @interface IRow
   */
  interface IRow {
    elem: JQuery;
    scope: Scope;
  }
}
