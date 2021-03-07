import parseSync from "csv-parse/lib/sync";
import { propertiesMatch } from "./utils";
import { ContactRepository, ListingRepository } from "./repository";
import { Contact, Listing, SellerType } from "./model";

export class DbImporter {
  constructor(
    private listingRepository: ListingRepository,
    private contactRepository: ContactRepository
  ) {}

  async tryImportCsv(csv: Buffer | string) {
    const csvRows: Array<{ [key: string]: string }> = parseSync(csv, {
      columns: true,
    });

    if (csvRows.length === 0 || !Array.isArray(csvRows)) {
      throw new Error("no data supplied");
    }

    const listingHeader = ["id", "make", "price", "mileage", "seller_type"];
    const contactHeader = ["listing_id", "contact_date"];

    if (propertiesMatch(listingHeader, csvRows[0]!)) {
      const listingRows = csvRows.map((row) => this.mapListing(row));
      await this.listingRepository.insertManyTransactional(listingRows);
    } else if (propertiesMatch(contactHeader, csvRows[0]!)) {
      const contactRows = csvRows.map((row) => this.mapContact(row));
      await this.contactRepository.insertManyTransactional(contactRows);
    } else {
      throw new Error("unexpected data");
    }
  }

  private assertNonNegativeNumber(number: number, type: string) {
    if (number < 0 || isNaN(number)) {
      throw new Error("invalid number for type " + type + ": " + number);
    }
  }

  private parseNonNegativeNumber(idString: string) {
    let id = parseInt(idString, 10);
    this.assertNonNegativeNumber(id, "id");
    return id;
  }

  private isValidSellerType(sellerType: string): sellerType is SellerType {
    let validSellerTypes = ["private", "dealer", "other"];
    return validSellerTypes.includes(sellerType);
  }

  private mapListing(listing: Record<string, string>): Listing {
    const id = this.parseNonNegativeNumber(listing["id"]!);
    const mileage = this.parseNonNegativeNumber(listing["mileage"]!);
    const price = this.parseNonNegativeNumber(listing["price"]!);
    const make = listing["make"]!;
    const sellerType = listing["seller_type"]!;
    if (!this.isValidSellerType(sellerType)) {
      throw new Error("invalid seller type: " + sellerType);
    }
    if (!make || make.trim() === "") {
      throw new Error("make has to be set");
    }

    return {
      id,
      make,
      mileage,
      price,
      sellerType,
    };
  }

  private mapContact(contact: Record<string, string>): Contact {
    return {
      listingId: this.parseNonNegativeNumber(contact["listing_id"]!),
      contactDate: this.parseNonNegativeNumber(contact["contact_date"]!),
    };
  }
}
