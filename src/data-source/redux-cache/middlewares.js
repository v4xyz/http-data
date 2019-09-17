const { denormalize, schema } = require('normalizr');
const utils = require('../../util');

/**
 * 与warehouse database进行同步
 * @param  {[type]} store [description]
 * @return {[type]}       [description]
 */
exports.syncWithDb = ({ db, DB_MODEL, schemas, SCHEMAS }) => {

	return store => next => action => {
		if (action.model) {
			const { type, params, model } = action;
			const modelCCase = utils.camelCase(model);
			const modelSCase = utils.snakeCase(model).toUpperCase();
			const typeSuffix = type.replace(`${ modelSCase }_`, '');
			const schema = utils.getWrappedSchema(schemas[model]);
			const primaryKey = schema.primaryKey;
			const dbModel = DB_MODEL[model];
			const state = store.getState();
			const subState =state[modelCCase];
			const { result, entities } = subState;			
			const modelList = denormalize(result, [SCHEMAS[model]], entities)
			console.log(model, typeSuffix);
			const stdHandlers = {
				'LIST': () => {
					Object.assign(action.params, {modelList})
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
							}).catch(e => {
								console.log(e)
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
	};
}
