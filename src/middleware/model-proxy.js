/**
 * 代理数据model CURD 方法
 * @return {[type]} [description]
 */
const debug = require('debug')('model-proxy');
const router = require('koa-router')();
const controller = require('../controller');
const utils = require('../util');

async function handleModelEevnt(ctx, next) {
	const params = {
		'GET': ctx.query,
		'POST': ctx.request.body,
	};
  // console.log(ctx.method)

  try {
		if (ctx.isTargetModel) {
			const ctrlMethod = utils.camelCase(ctx.path);
			console.log(controller[ctrlMethod], params[ctx.method]);
    	ctx.body = await controller[ctrlMethod](params[ctx.method]);
			// ctx.body = `${ ctx.params.model } 详情`;
		}
		next();
  } catch (e) {
    ctx.body = e;
  }
}

module.exports = ({MODEL_SCHEMA}) => {
	// console.log(MODEL_SCHEMA)
	const models = Object.keys(MODEL_SCHEMA);

	return router
		.param('model', (model, ctx, next) => {
			const modelName = utils.upperFirst(model); // eg. langDict ==> LangDict
			const isTargetModel = models.includes(modelName);

			console.log(`代理 ${ modelName } CURD 操作 ===> `, isTargetModel)
			ctx.isTargetModel = isTargetModel;

			if (isTargetModel && (JSON.stringify(MODEL_SCHEMA[modelName]) !== '{}')) {							
				ctx.taretModel = modelName;
			} else {
				ctx.body = '未定义model';
			}

			return next();
		})
		.post('/:model/list', handleModelEevnt)
		.get('/:model/detail', handleModelEevnt)
		.post('/:model/add', handleModelEevnt)
		.post('/:model/batchAdd', handleModelEevnt)
		.post('/:model/edit', handleModelEevnt)
		.post('/:model/batchEdit', handleModelEevnt)
		.get('/:model/del', handleModelEevnt)
		.routes()
}
