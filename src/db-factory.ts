import sqlite3 from "sqlite3";
import { Database, open } from "sqlite";

export async function initDB(): Promise<Database> {
  return open({
    driver: sqlite3.Database,
    filename: "db.sqlite3",
  });
}

export async function initSchema(db: Database): Promise<void> {
  await db.run(
    `CREATE TABLE IF NOT EXISTS listing
     (
         id          INTEGER PRIMARY KEY,
         make        TEXT,
         price       INTEGER,
         mileage     numeric,
         seller_type TEXT
     )`
  );
  await db.run(
    `CREATE TABLE IF NOT EXISTS contact
     (
         listing_id   INTEGER,
         contact_date INTEGER,
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
