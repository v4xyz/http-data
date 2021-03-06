const { normalize, schema } = require('normalizr');
const utils = require('../../util');
// 获取具体ACTION_TYPE字符串
const getActionTypeStr = (schemaName, type) => {
	const sNameUCase = utils.snakeCase(schemaName).toUpperCase();

	return `${ sNameUCase }_${ type }`; 
};
const default_types = [
	'LIST',                 // 获取model列表  
	'DETAIL',               // 获取model详情   
	'ADD',                  // 创建model
	'BATCH_ADD',			// 创建model(批量操作)
	'EDIT',     ,           // 更新model
	'BATCH_EDIT',			// 更新model(批量操作)
	'DEL',                  // 删除model
	'BATCH_DEL',			// 删除model(批量操作)
];
// 分配schema 不同类型action type
const getSchemaAction = schemaName => {

	return default_types.map(type => {

		return getActionTypeStr(schemaName, type);
	});
};
const createActions = ({ schemaNames }) => {
	// console.log(schemaNames)
	// 根据warehouse schema 映射 normalize entity
	const SCHEMAS = schemaNames
		.reduce((acc, schemaName) => {
			acc[schemaName] = new schema.Entity('list', undefined, { idAttribute: '_id' });

			return acc;
		}, {});
	// 生成默认ACTION_TYPE
	const DEFAULT_ACTION_TYPE = schemaNames
		.map(getSchemaAction)
		// nodejs v10.15.2 版本Array还不支持flat、flatMap方法
		.join()
		.split(',');

	const ACTION_TYPE = [
		...DEFAULT_ACTION_TYPE,
	].reduce((acc, item) => {
		acc[item] = item

		return acc
	}, {});

	const getActionObj = ({schemaName, type, params}) => {
		const actionType = getActionTypeStr(schemaName, type);
		const actionData = {
			'LIST': () => {

				return {
					type: actionType,
					params,
					model: schemaName,
				};			
			},
			'DETAIL': () => {

				return {
					type: actionType,
					params,
					model: schemaName,
				};
			}, 
			'ADD': () => {

				return {
					type: actionType,
					params,
					model: schemaName,
				};			
			},
			'EDIT': () => {

				return {
					type: actionType,
					params,
					model: schemaName,
				}
			},
			'DEL': () => {

				return {
					type: actionType,
					params,
					model: schemaName,
				}
			},
			'default': () => {
				
				return {
					type: actionType,
					params,
					model: schemaName,
				}
			}
		};

		return (actionData[type] || actionData['default'])(); 
	};

	const _ACTIONS = schemaNames.reduce((acc, schemaName) => {	 
		
		const modelActions = default_types.reduce((typeAcc, type) => {
			typeAcc[utils.camelCase(`${ schemaName }_${ type }`)] = function (params) {

				return getActionObj({
					schemaName,
					type,
					params
				});
			}
			return typeAcc;
		}, {});

		Object.assign(acc, modelActions);

		return acc;
	}, {});
	// console.log(_ACTIONS)

	const ACTIONS = {
		loadDb: ({ db, DB_MODEL }) => {

			return (dispatch) => {

				db.load().then((data) => {
					const dbData = schemaNames.reduce((acc, schemaName) => {
						const schemaNameCCase = utils.camelCase(schemaName);					
						acc[schemaNameCCase] = normalize(DB_MODEL[schemaName].toArray(), [SCHEMAS[schemaName]])

						return acc;
					}, {})

					console.log('database loaded ...');
					dispatch({
						type: 'DATABASE_LOADED',
						params: {
							...dbData,
						},
					})
				});
			};
		},		
		..._ACTIONS,
	};

	return {
		ACTIONS,
		SCHEMAS
	};
};

module.exports = {
	createActions,
	default_types,
};
