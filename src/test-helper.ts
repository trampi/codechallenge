import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { configureConnection, initSchema } from "./db-factory";

export async function initMemoryDB(): Promise<Database> {
  const db = await open({
    driver: sqlite3.Database,
    filename: ":memory:",
  });
  await configureConnection(db);
  return db;
}

export async function setupEmptyTestDBWithSchema(): Promise<Database> {
  const db = await initMemoryDB();
  await initSchema(db);
  return db;
}
