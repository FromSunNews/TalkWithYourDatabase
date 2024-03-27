"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const environment_1 = require("./environment");
// const mysqlPool = mysql.createPool({
//   host: env.DB_HOST,
//   port: env.DB_PORT,
//   user: env.DB_USER,
//   password: env.DB_PASSWORD,
//   database: env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
//   idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0
// })
// export default mysqlPool
exports.connection = mysql2_1.default.createConnection({
    host: environment_1.env.DB_HOST,
    user: environment_1.env.DB_USER,
    password: environment_1.env.DB_PASSWORD,
    database: environment_1.env.DB_NAME,
});
//# sourceMappingURL=db.connection.js.map