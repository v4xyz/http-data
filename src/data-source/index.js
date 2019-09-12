// 数据持久化
const data_persistence = require('./warehouse-database');
exports.data_persistence = data_persistence;
exports.MODEL_SCHEMA = MODEL_SCHEMA = data_persistence.schemas;
exports.schemaNames = schemaNames  = Object.keys(data_persistence.schemas);

// 数据缓冲层
const data_cache = require('./redux-cache');
exports.data_cache = data_cache;

exports.actionHandler = {
    ...data_cache.actionHandler
};
