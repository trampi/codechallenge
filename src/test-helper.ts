import { Database, open } from "sqlite";
import sqlite3 from "sqlite3";
import { configureConnection } from "./db-factory";

export async function initMemoryDB(): Promise<Database> {
  const db = await open({
    driver: sqlite3.Database,
    filename: ":memory:",
  });
  await configureConnection(db);
  return db;
}
