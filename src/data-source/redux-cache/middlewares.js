const { normalize, denormalize } = require('normalizr');
const utils = require('../../util');
const { default_types, SCHEMAS } = require('./actions');
const { db, DB_MODEL, schemas } = require('../warehouse-database');

/**
 * 与warehouse database进行同步
 * @param  {[type]} store [description]
 * @return {[type]}       [description]
 */
exports.syncWithDb = store => next => action => {
	if (action.model) {
		const { type, params, model } = action;
		const modelCCase = utils.camelCase(model);
		const modelSCase = utils.snakeCase(model).toUpperCase();
		const typeSuffix = type.replace(`${ modelSCase }_`, '');
		const schema = utils.getWrappedSchema(schemas[model]);
		const primaryKey = schema.primaryKey;
		const dbModel = DB_MODEL[model];
		console.log(model, typeSuffix);
		const stdHandlers = {
			'LIST': () => {

				return next(action);
			},
			'DETAIL': () => {

				return next(action);
			},
			'ADD': () => {
				const state = store.getState();
				const { [modelCCase]: { entities, result } } = state;

				if (dbModel.find({[primaryKey]: params[primaryKey]}).data.length > 0) {
					// 不需要触发任何action到store
					// 不能新增重复的langItem
					throw {
						errorCode: `ERROR_ADD_DUPLICATE_${ modelSCase }`,
						data: params[primaryKey],
					};
				} else {
					return dbModel.insert(params)
						.then(data => {
							// 更新数据库存储
							db.save();
							next({
								...action,
								data,
							});
						});
				}

				return next(action);
			},
			'EDIT': () => {

				return dbModel.updateById(params._id, params)
					.then(data => {
						// 更新数据库存储
						db.save();
						next({
							...action,
							data,
						});
					})
			},
			'DEL': () => {

				return next(action);
			},
			'BATCH_DEL': () => {

				return next(action);
			},
			'default': () => {

				return next(action);
			}
		};

		return (stdHandlers[typeSuffix] || stdHandlers['default'])()
	} else {

		return next(action)
	}
}
