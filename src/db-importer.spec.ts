import { DbImporter } from "./db-importer";
import { ContactRepository, ListingRepository } from "./repository";
import { setupEmptyTestDBWithSchema } from "./test-helper";
import { Contact, Listing } from "./model";
import { Database } from "sqlite";

describe("db-importer", () => {
  let db: Database;
  let contactRepository: ContactRepository;
  let listingRepository: ListingRepository;
  let dbImporter: DbImporter;

  beforeEach(async () => {
    db = await setupEmptyTestDBWithSchema();
    contactRepository = new ContactRepository(db);
    listingRepository = new ListingRepository(db);
    dbImporter = new DbImporter(listingRepository, contactRepository);
  });

  describe("listings", () => {
    it("should successfully import listings", async () => {
      await dbImporter.tryImportCsv(
        "id,make,price,mileage,seller_type\n" +
          "1,BMW,35000,2000,dealer\n" +
          "2,Audi,40000,4000,private"
      );
      const rows = await listingRepository.all();
      const expected: Listing[] = [
        {
          id: 1,
          make: "BMW",
          price: 35000,
          mileage: 2000,
          sellerType: "dealer",
        },
        {
          id: 2,
          make: "Audi",
          price: 40000,
          mileage: 4000,
          sellerType: "private",
        },
      ];
      expect(rows).toEqual(expected);
    });

    it("should not import listing with unexpected columns", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type,unexpected\n" +
            " 1,BMW,35000,2000,dealer,sample"
        )
      ).toBeRejected();
    });

    it("should not import listing with negative id", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "-1,BMW,35000,2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with negative price", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,-5,2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with negative mileage", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,35000,-2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with unexpected dealer type", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,35000,2000,unexpected"
        )
      ).toBeRejected();
    });

    it("should not import listing with missing id", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + ",BMW,35000,2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with missing make", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,,35000,2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with missing price", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,,2000,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with missing mileage", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,35000,,dealer"
        )
      ).toBeRejected();
    });

    it("should not import listing with missing sellerType", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "id,make,price,mileage,seller_type\n" + "1,BMW,35000,2000,"
        )
      ).toBeRejected();
    });
  });

  describe("contacts", () => {
    it("should successfully import contacts for listing", async () => {
      await dbImporter.tryImportCsv(
        "id,make,price,mileage,seller_type\n" +
          "1,BMW,35000,2000,dealer\n" +
          "2,Audi,40000,4000,private"
      );
      await dbImporter.tryImportCsv(
        "listing_id,contact_date\n" + "1,1615110387574\n" + "1,1615110387575"
      );
      const rows = await contactRepository.all();
      const expected: Contact[] = [
        {
          listingId: 1,
          contactDate: 1615110387574,
        },
        {
          listingId: 1,
          contactDate: 1615110387575,
        },
      ];
      expect(rows).toEqual(expected);
    });

    it("should not import contacts with unexpected columns", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "listing_id,contact_date,unexpected\n" + "1,1615110387574,test"
        )
      ).toBeRejected();
    });

    it("should not import contacts for non-existing listings", async () => {
      await expectAsync(
        dbImporter.tryImportCsv(
          "listing_id,contact_date\n" + "1,1615110387574\n" + "1,1615110387575"
        )
      ).toBeRejected();
    });

    it("should not import contacts with missing listing id", async () => {
      await expectAsync(
        dbImporter.tryImportCsv("listing_id,contact_date\n" + ",1615110387574")
      ).toBeRejected();
    });

    it("should not import contacts with missing contact_date", async () => {
      await expectAsync(
        dbImporter.tryImportCsv("listing_id,contact_date\n" + "1,")
      ).toBeRejected();
    });
  });
});
