const utils = require('../../util');

const createReducers = ({ schemaNames } ) => {
	// 根据warehouse schema 映射 redux state reducer
	const modelReducer = schemaNames.reduce((acc, schemaName) => {
		const schemaNameCCase = utils.camelCase(schemaName);
		const sNameUCase = utils.snakeCase(schemaName).toUpperCase();
		// console.log(schemaName)

		acc[schemaNameCCase] = (function (modelName) {

			return function (state = {}, action) {
				const { data = {}, dataList = [] } = action;
				const { _id } = data;
				const _ids = dataList.map(item => item._id);
				const dataListObj = dataList.reduce((acc, item) => {
					const { _id } = item;
					acc[_id] = item;

					return acc
				}, {});
				// 根据需要提供委外的通用reducer操作, 如 default
				const actions = {
					// ..._actions,
			   		// 获取model列表
					[`${ modelName }_LIST`]: () => {

						return state;
					},
			   		// 获取model详情
					[`${ modelName }_DETAIL`]: () => {

						return state;
					},
					// 新增model
					[`${ modelName }_ADD`]: () => {

						return {
							...state,
							entities: {
								...state.entities,
								list: {
									...state.entities.list,
									[_id]: {...data}
								}
							},
							result: [...state.result, _id],
						};
					},
					// 批量新增model
					[`${ modelName }_BATCH_ADD`]: () => {

						return {
							...state,
							entities: {
								...state.entities,
								list: {
									...state.entities.list,
									...dataListObj,
								}
							},
							result: [...state.result, ..._ids],
						};
					},				
					// 更新model
					[`${ modelName }_EDIT`]: () => {
						const updatedItem = state.entities.list[_id];

						return {
							...state,
								entities: {
									...state.entities,
									list: {
										...state.entities.list,
										[_id]: {...updatedItem, ...data}
									}
								},
						};
					},
					// 批量更新model
					[`${ modelName }_BATCH_EDIT`]: () => {
						const updatedItem = state.entities.list[_id];

						return {
							...state,
								entities: {
									...state.entities,
									list: {
										...state.entities.list,
										...dataListObj,
									}
								},
						};
					},				
					// 删除model
					[`${ modelName }_DEL`]: () => {

						return state;
					},			
					'DATABASE_LOADED': () => {

						return action.params[schemaNameCCase];
					},			
					default: () => {

						return state;
					}
				}

				return (actions[action.type] || actions['default'])()
			}
		})(sNameUCase)

		return acc;
	}, {});
};

module.exports = {
	createReducers,
};
