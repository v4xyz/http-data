// 数据持久层
const data_persistence = require('./warehouse-database');
const { createDbInstance } = data_persistence;
// 数据缓冲层
const data_cache = require('./redux-cache');
const { createActionHandler } = data_cache;

exports.createDbInstance = createDbInstance;
exports.createActionHandler = createActionHandler;
