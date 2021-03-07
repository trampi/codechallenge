import express, { Express } from "express";
import fileUpload from "express-fileupload";
import { ContactRepository, ListingRepository } from "./repository";
import { initFileDB, initSchema } from "./db-factory";
import { DbImporter } from "./db-importer";
import { readFileSync } from "fs";
import {
  AverageListingSellingPriceReport,
  AverageListingSellingPriceReportGenerator,
  AveragePriceMostContactedListingsReportGenerator,
  AveragePriceReport,
  CarsByMakeReport,
  CarsByMakeReportGenerator,
  TopListingsByMonthReport,
  TopListingsByMonthReportGenerator,
} from "./reports";

main().catch((e) => console.error("error during startup", e));

export interface Reports {
  averageListingSellingPriceReport: AverageListingSellingPriceReport;
  carsByMakeReport: CarsByMakeReport;
  averagePriceReport: AveragePriceReport;
  topListingsByMonthReport: TopListingsByMonthReport[][];
}

function registerEndpoints(
  app: Express,
  dbImporter: DbImporter,
  averageListingSellingPriceReportGenerator: AverageListingSellingPriceReportGenerator,
  carsByMakeReportGenerator: CarsByMakeReportGenerator,
  averagePriceReportGenerator: AveragePriceMostContactedListingsReportGenerator,
  topListingsByMonthReportGenerator: TopListingsByMonthReportGenerator
) {
  async function generateReports(): Promise<Reports> {
    const averageListingSellingPriceReport = await averageListingSellingPriceReportGenerator.generate();
    const carsByMakeReport = await carsByMakeReportGenerator.generate();
    const averagePriceReport = await averagePriceReportGenerator.generate();
    const topListingsByMonthReport = await topListingsByMonthReportGenerator.generate();
    return {
      averageListingSellingPriceReport,
      carsByMakeReport,
      averagePriceReport,
      topListingsByMonthReport,
    };
  }

  app.get("/", async (_req, res) => {
    try {
      res.render("index", await generateReports());
    } catch (e) {
      console.error("unexpected error", e);
      res.sendStatus(500);
    }
  });

  app.get("/json", async (_req, res) => {
    try {
      res.json({ reports: await generateReports() });
    } catch (e) {
      console.error("unexpected error", e);
      res.sendStatus(500);
    }
  });

  app.post("/upload", async (req, res) => {
    let csvUpload = req.files?.["csv"];

    if (!csvUpload) {
      console.info("no data supplied");
      res.sendStatus(400);
      return;
    }

    if (Array.isArray(csvUpload)) {
      console.info("invalid input, expected single file");
      res.sendStatus(400);
      return;
    }

    try {
      await dbImporter.tryImportCsv(csvUpload.data);
      res.sendStatus(204);
    } catch (e) {
      console.error("invalid data supplied during upload", e);
      res.sendStatus(400);
      return;
    }
  });
}

export async function main() {
  const app = express();
  app.use(
    fileUpload({
      limits: {
        fileSize: 50 * 1024 * 1024,
      },
    })
  );

  const port = 3000;

  const db = await initFileDB();
  const contactRepository = new ContactRepository(db);
  const listingRepository = new ListingRepository(db);
  const dbImporter = new DbImporter(listingRepository, contactRepository);
  const averageListingSellingPriceReportGenerator = new AverageListingSellingPriceReportGenerator(
    db
  );
  const carsByMakeReportGenerator = new CarsByMakeReportGenerator(db);
  const averagePriceReportGenerator = new AveragePriceMostContactedListingsReportGenerator(
    db
  );
  const topListingsByMonthReportGenerator = new TopListingsByMonthReportGenerator(
    db
  );

  await initSchema(db);
  await initSampleData(contactRepository, dbImporter);

  app.set("view engine", "hbs");

  registerEndpoints(
    app,
    dbImporter,
    averageListingSellingPriceReportGenerator,
    carsByMakeReportGenerator,
    averagePriceReportGenerator,
    topListingsByMonthReportGenerator
  );

  app.listen(port, () => {
    console.log(`server is listening on ${port}`);
  });
}

async function initSampleData(
  contactRepository: ContactRepository,
  dbImporter: DbImporter
) {
  const listingCount = await contactRepository.count();
  if (listingCount === 0) {
    console.info("importing sample data");
    await dbImporter.tryImportCsv(
      readFileSync("sample-data/listings.csv", "utf8")
    );
    await dbImporter.tryImportCsv(
      readFileSync("sample-data/contacts.csv", "utf8")
    );
  } else {
    console.info("skipping dummy data import");
  }
}
