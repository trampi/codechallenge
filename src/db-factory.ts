import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

export async function initFileDB(): Promise<Database> {
  const database = await open({
    driver: sqlite3.Database,
    filename: "db.sqlite3",
  });
  await configureConnection(database);
  return database;
}

export async function configureConnection(db: Database): Promise<void> {
  await db.get("PRAGMA foreign_keys = ON");
}

export async function initSchema(db: Database): Promise<void> {
  await db.run(
    `CREATE TABLE IF NOT EXISTS listing
     (
         id          INTEGER PRIMARY KEY,
         make        TEXT    NOT NULL,
         price       INTEGER NOT NULL,
         mileage     NUMERIC NOT NULL,
         seller_type TEXT    NOT NULL
     )`
  );
  await db.run(
    `CREATE TABLE IF NOT EXISTS contact
     (
         listing_id   INTEGER NOT NULL,
         contact_date INTEGER NOT NULL,
         FOREIGN KEY (listing_id) REFERENCES listing (id)
     )`
  );

  // TODO: benchmark and add indeces if necessary
  // await db.run(
  //   `
  //       CREATE INDEX seller_type_idx on listing (seller_type)
  //   `
  // );
}
