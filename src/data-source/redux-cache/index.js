const { denormalize } = require('normalizr');
const { createStore, combineReducers, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;
const logger = require('redux-logger').default;
const { schemaNames } = require('../');
const { SCHEMAS, ACTIONS, default_types } = require('./actions');
const reducers = require('./reducers');
const { syncWithDb, i18nService } = require('./middlewares');
// redux中间件
const middleWares = [
	thunk,
	logger,
	syncWithDb,
	i18nService,
	// store => next => action => {
	// 	if (action.type === 'LANG_ITEM_DETAIL') {
	// 		action.params.test = 'hello'
	// 	}
	// 	console.log(action)
	// 	return next(action)
	// }
];
const store = createStore(combineReducers(reducers), applyMiddleware(...middleWares));
const util = require('../../util');
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;

/**
 * 触发action到store获取最新的state
 * @param  {[type]}   options.params    [description]
 * @param  {[type]}   options.action    [description]
 * @param  {[type]}   options.storeName [description]
 * @param  {Function} options.onSuccess [description]
 * @param  {Function} onError           [description]
 * @return {[type]}                     [description]
 */
function commit2Store({
	params,
	type,
	action,
	storeName,
	onSuccess = (data) => data,
	onError = (err) => err,
}) {

	return new Promise((resolve, reject) => {

		const unsubscribe = store.subscribe(function() {
			try {
				const { [storeName] : { result, entities } } = store.getState();
				// console.log(store.getState())

				resolve(onSuccess({result, entities, params, type}));
				unsubscribe();
			} catch (e) {
				console.log(e)
				resolve(onError(e));
				unsubscribe();
			}
		});

		try {
			store.dispatch(action(params));
		} catch (e) {
			console.log(e);
			resolve(onError(e));
			unsubscribe();
		}
	});	
}

/**
 * 载入数据库数据
 * @return {[type]} [description]
 */
function loadDb() {

	store.dispatch(ACTIONS.loadDb());		
}

// 映射model对象基本操作
const actionHandler = schemaNames.reduce((acc, schemaName) => {
	const schemaNameCCAse = util.camelCase(schemaName);
	const storeActions = default_types
		.map(type => {
			return util.upperFirst(util.camelCase(type))
		})
		.reduce((actionAcc, action) => {
		const storeAction = `${ schemaNameCCAse }${ action }`;

		// 对应具体url响应的处理
		actionAcc[storeAction] = function (params) {
			const actionData = ACTIONS[storeAction](params)
			return  commit2Store({
				type: action,
				params,
				action: ACTIONS[storeAction],
				storeName: schemaNameCCAse,
				onSuccess: ({result, entities, params, type}) => {
					const { modelList = [] } = params
					const handlerType = {
						'List': () => {
							const { 
								page = DEFAULT_PAGE,
								limit = DEFAULT_LIMIT,
							} = params;							
							const total = modelList.length;
							const validPage = page < 1 ? 0 : (page > Math.floor(total/limit) ? Math.floor(total/limit) : page - 1);							
							
							return util.formatListResp({
								list: modelList.slice(validPage * limit, (validPage + 1) * limit),
								total,
								params: {
									page: validPage,
								},
							})							
						},
						'Detail': () => {

							return entities.list[params._id] || {}		
						},
						'Add': () => {
							
							return {};
						},
						'Edit': () => {

							return entities.list[params._id] || {}
						},
						'Del': () => {
							
						},
						default: () => {
							return {}
						}
					};
					console.log(action)
					return (handlerType[type] || handlerType['default'])()
				}
			});
		}

		return actionAcc;
	}, {});
	
	Object.assign(acc, storeActions);


	return acc;
}, {});

module.exports = {
	SCHEMAS,
	_store: store,
	actionHandler: {
		...actionHandler,
		loadDb,	
	},
};
