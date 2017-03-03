var Util = {
	/**
	 * Accepts an object with any level of nested properties and returns the child defined in string
	 * 
	 * @param object - the parent object that we want to disset
	 * @param string - a string definition of the child to get using dot (.) and bracket ([]) notation
	 *                  so the value `result.obj.docsList[4].name` would attempt to get that value if exists
	 * @param pattern - ignore (used internally)
	 * @returns object|undefined
	 */
	getObjectHash: function (object:any, string:string, pattern?:any):any|undefined {
		return string.split(pattern || /(\[|\].?)/).reduce(function (obj:any, next:string) {
			if (!next || obj.ref === undefined) return obj;

			if (next[0] == "[") {
				obj.isBracketed = true;
				return obj;
			}

			if (obj.isBracketed) {
				if (next[0] == "]") {
					obj.isBracketed = false;
					return obj;
				}

				obj.ref = obj.ref[next];
			} else {
				obj.ref = next.indexOf('.') === -1 ? obj.ref[next] : Util.getObjectHash(obj.ref, next, ".");
			}

			return obj;
		}, { isBracketed: false, ref: object }).ref;
	},

	/**
	 * Converts a given value to a number with an optional default value or '0'
	 */
	toNum: function (val:any, _defaultVal?:number):number {
		let converted:number = parseInt(val);

		return !isNaN(converted) && typeof converted === "number" ? converted : _defaultVal || 0;
	},

	stringEmpty: function (string:string|null):boolean {
		return typeof string === "string" && string.length > 0;
	},

	nonEmptyArray: function (array:any[]|null):boolean {
		return Array.isArray(array) && array.length > 0;
	},

	arrayLength: function (array:any[], defaultLen:number = 0) {
		return Util.nonEmptyArray(array) && array.length || defaultLen;
	}
};