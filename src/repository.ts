import { Database } from "sqlite";
import { Contact, Listing } from "./model";

export interface Repository<T> {
  insert(data: T): Promise<void>;
}

export abstract class AbstractRepository<T> implements Repository<T> {
  constructor(protected db: Database) {}

  abstract insert(data: T): Promise<void>;

  async insertManyTransactional(data: T[]) {
    try {
      await this.db.run("BEGIN TRANSACTION");
      for (const datum of data) {
        await this.insert(datum);
      }
      await this.db.run("COMMIT");
    } catch (e) {
      await this.db.run("ROLLBACK");
      throw e;
    }
  }
}

export class ContactRepository extends AbstractRepository<Contact> {
  public async insert(contact: Contact): Promise<void> {
    await this.db.run(
      "INSERT INTO contact (listing_id, contact_date) VALUES ($listingId, $contactDate)",
      prependDollarToPropertNames(contact)
    );
  }

  public async count(): Promise<number> {
    let result = await this.db.get("SELECT COUNT(*) as count from contact");
    return result.count;
  }

  async all(): Promise<Contact[]> {
    return await this.db.all<Contact[]>(
      "select listing_id as listingId, contact_date as contactDate from contact"
    );
  }
}

export class ListingRepository extends AbstractRepository<Listing> {
  public async insert(listing: Listing): Promise<void> {
    await this.db.run(
      "INSERT INTO listing (id, make, price, mileage, seller_type) VALUES ($id, $make, $price, $mileage, $sellerType)",
      prependDollarToPropertNames(listing)
    );
  }

  async all(): Promise<Listing[]> {
    return await this.db.all<Listing[]>(
      "select id, make, price, mileage, seller_type as sellerType from listing"
    );
  }
}

function prependDollarToPropertNames(object: any) {
  const result: { [key: string]: number | string } = {};
  for (let key in object) {
    if (object.hasOwnProperty(key) && object[key] !== undefined) {
      result["$" + key] = object[key];
    }
  }
  return result;
}
