// SQL Server adapter for CodexLing
// This file exports the same interface as before but uses SQL Server as backend
export { ensureDatabase, readDatabase, writeDatabase, closeConnection, getConnection } from "./sqlserver.js";
