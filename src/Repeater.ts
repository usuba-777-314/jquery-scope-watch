/**
 * Namespace of the jquery-scope-watch.
 * @namespace
 */
module scope {

  /**
   *
   * @class scope.Repeater
   */
  export class Repeater {

    /**
     *
     * @member scope.Repeater#startComment
     * @private
     * @type {Comment}
     */
    private startComment: Comment;

    /**
     *
     * @member scope.Repeater#endComment
     * @private
     * @type {Comment}
     */
    private endComment: Comment;

    /**
     * @member scope.Repeater#keys
     * @type {any[]}
     */
    private keys: any[] = [];

    /**
     * @member scope.Repeater#rowMap
     * @type {IRowMap}
     */
    private rowMap: IRowMap = {};

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

      scope.on('destroy', () => $.each(this.rowMap, (k: number, r: IRow) => {

        if (r.scope) r.scope.destroy();
        r.elem.remove();
      }));

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
    static generate(scope: Scope,
                    expression: any,
                    valueKey: string,
                    rowGenerator: (s: Scope) => JQuery,
                    primaryKey?: string): JQuery {

      var repeater = new Repeater(scope, expression, valueKey, rowGenerator, primaryKey);

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

        var row = this.rowMap[data.key] =
          this.rowMap[data.key] || this.generateRow(data.value);
        row.scope[this.valueKey] = data.value;

        if (data.key === this.keys[index]) return;

        var $prevRow = index ? this.rowMap[this.keys[index - 1]].elem : $(this.startComment);
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
     * @param {any} key
     */
    private destroyRow(key: any) {

      var row = this.rowMap[key];
      if (!row) return;

      row.scope.destroy();
      row.elem.remove();
      delete this.rowMap[key]
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
          key: this.primaryKey ? src[key][this.primaryKey] : key,
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
   *
   * @interface IRowMap
   */
  interface IRowMap {

    [key: string]: IRow;
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
