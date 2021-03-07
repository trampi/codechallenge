import {
  AverageListingSellingPriceReportGenerator,
  AveragePriceMostContactedListingsReportGenerator,
  CarsByMakeReportGenerator,
} from "./reports";
import { setupEmptyTestDBWithSchema } from "./test-helper";
import { Database } from "sqlite";
import { ContactRepository, ListingRepository } from "./repository";

describe("reports", () => {
  let db: Database;
  let listingRepository: ListingRepository;
  let contactRepository: ContactRepository;

  async function prepareMockData() {
    await listingRepository.insertManyTransactional([
      {
        id: 1,
        sellerType: "private",
        price: 123,
        mileage: 100,
        make: "BMW",
      },
      {
        id: 2,
        sellerType: "dealer",
        price: 5000,
        mileage: 200,
        make: "BMW",
      },
      {
        id: 3,
        sellerType: "dealer",
        price: 10000,
        mileage: 200,
        make: "Audi",
      },
    ]);

    await contactRepository.insertManyTransactional([
      {
        listingId: 1,
        contactDate: 123,
      },
      {
        listingId: 2,
        contactDate: 123,
      },
      {
        listingId: 2,
        contactDate: 123,
      },
      {
        listingId: 3,
        contactDate: 123,
      },
      {
        listingId: 3,
        contactDate: 123,
      },
      {
        listingId: 3,
        contactDate: 123,
      },
    ]);
  }

  beforeEach(async () => {
    db = await setupEmptyTestDBWithSchema();
    listingRepository = new ListingRepository(db);
    contactRepository = new ContactRepository(db);
  });

  describe("AverageListingSellingPriceReportGenerator", () => {
    it("should generate an empty report with no data", async () => {
      const averageListingSellingPriceReportGenerator = new AverageListingSellingPriceReportGenerator(
        db
      );
      expect(
        await averageListingSellingPriceReportGenerator.generate()
      ).toEqual({});
    });

    it("should generate a filled report with correct data", async () => {
      await prepareMockData();
      const averageListingSellingPriceReportGenerator = new AverageListingSellingPriceReportGenerator(
        db
      );
      expect(
        await averageListingSellingPriceReportGenerator.generate()
      ).toEqual({
        dealer: {
          averagePrice: 7500,
          formattedAveragePrice: "€ 7.500,-",
        },
        private: {
          averagePrice: 123,
          formattedAveragePrice: "€ 123,-",
        },
      });
    });
  });

  describe("CarsByMakeReportGenerator", () => {
    it("should generate correct reports", async () => {
      await prepareMockData();
      const makeReportGenerator = new CarsByMakeReportGenerator(db);
      const report = await makeReportGenerator.generate();
      expect(report).toEqual({
        BMW: {
          count: 2,
          formattedPercent: "66%",
        },
        Audi: {
          count: 1,
          formattedPercent: "33%",
        },
      });
    });
  });

  describe("AveragePriceMostContactedListingsReportGenerator", () => {
    it("should generate correct reports", async () => {
      await prepareMockData();
      const averagePriceReportGenerator = new AveragePriceMostContactedListingsReportGenerator(
        db
      );
      const report = await averagePriceReportGenerator.generate();
      expect(report).toEqual({
        averagePrice: 10000,
        formattedAveragePrice: "€ 10.000,-",
      });
    });
  });
});
