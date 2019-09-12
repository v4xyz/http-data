const _ = require('lodash');

/**
 * 格式化list响应数据
 * @param  {[type]} options.list      [description]
 * @param  {[type]} options.total     [description]
 * @param  {[type]} options.pageIndex [description]
 * @return {[type]}                   [description]
 */
function formatListResp({list, total, params}) {

	return  {
		rows: list,
		total: total,
		pageIndex: params.page || 1,
	}
}

/**
 * Deprecated --> 与_.upperFirst方法重复
 * 将首字母转换为大写 eg. langDict ==> LangDict
 * @param  {String} str [description]
 * @return {String}     [description]
 */
function toUpperCaseInitial(str = '') {
	return 	str.replace(/\w/, s1 => s1.toUpperCase());
}

function getWrappedSchema (schema) {

	return new Proxy(schema, {
		get: (obj, prop) => {
			const existingKeys = Object.keys(obj)
			const data = obj[prop]
			const primaryKey = existingKeys.find(key => obj[key].primaryKey)
			const newObj = {
				...obj,
				primaryKey
			}

			return newObj[prop]
		}
	});
}

module.exports = {
	..._,
	formatListResp,
	toUpperCaseInitial,
	getWrappedSchema,
};
