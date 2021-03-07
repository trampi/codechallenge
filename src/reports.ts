import { Database } from "sqlite";
import { formatCurrency } from "./utils";

export interface ReportGenerator<T> {
  generate(): Promise<T>;
}

export class AverageListingSellingPriceReportGenerator
  implements ReportGenerator<AverageListingSellingPriceReport> {
  constructor(private db: Database) {}

  async generate(): Promise<AverageListingSellingPriceReport> {
    const rows = await this.db.all(
      "select avg(price) as avgPrice, seller_type as sellerType from listing GROUP BY seller_type"
    );

    const result: AverageListingSellingPriceReport = {};

    for (let row of rows) {
      result[row.sellerType] = {
        averagePrice: row.avgPrice,
        formattedAveragePrice: formatCurrency(row.avgPrice),
      };
    }

    return result;
  }
}

export interface AverageListingSellingPriceReport {
  [sellerType: string]: {
    averagePrice: number;
    formattedAveragePrice: string;
  };
}

export class CarsByMakeReportGenerator
  implements ReportGenerator<CarsByMakeReport> {
  constructor(private db: Database) {}

  async generate(): Promise<CarsByMakeReport> {
    const rows = await this.db.all(
      "select make, count(*) as makeCount from listing GROUP BY make ORDER BY makeCount DESC"
    );

    const allListingCount = rows
      .map((row) => row.makeCount)
      .reduce((acc, curr) => acc + curr, 0);

    const result: CarsByMakeReport = {};
    for (let row of rows) {
      result[row.make] = {
        count: row.makeCount,
        formattedPercent:
          Math.floor((row.makeCount / allListingCount) * 100) + "%",
      };
    }
    return result;
  }
}

export interface CarsByMakeReport {
  [make: string]: {
    count: number;
    formattedPercent: string;
  };
}

export class AveragePriceMostContactedListingsReportGenerator
  implements ReportGenerator<AveragePriceReport> {
  constructor(private db: Database) {}

  async generate(): Promise<AveragePriceReport> {
    const mostContactedListingRows = await this.db
      .all(`select listing_id as listingId, count(listing_id) as count
            from contact
            group by listing_id
            order by count DESC
      `);

    const mostContactedListingIds: number[] = mostContactedListingRows
      .slice(0, Math.ceil(mostContactedListingRows.length * 0.3))
      .map((row) => row.listingId);

    // sorry, I usually do not concatenate sql-strings, but node-sqlite3 does not seem to support
    // in queries with prepared statement variables
    // using a better sqlite library would have prevented this
    // however, while it is not beautiful it is not a security issue as the ids
    // are not user supplied
    const { avgPrice } = await this.db.get(
      "select avg(price) as avgPrice from listing where id in (" +
        mostContactedListingIds.join(",") +
        ")"
    );

    return {
      averagePrice: avgPrice,
      formattedAveragePrice: formatCurrency(avgPrice),
    };
  }
}

export interface AveragePriceReport {
  averagePrice: number;
  formattedAveragePrice: string;
}

export class TopListingsByMonthReportGenerator
  implements ReportGenerator<TopListingsByMonthReport[][]> {
  constructor(private db: Database) {}

  async generate(): Promise<TopListingsByMonthReport[][]> {
    const months = await this.db.all(
      `select distinct strftime('%m.%Y', datetime(contact_date / 1000, 'unixepoch')) as month from contact order by contact_date`
    );

    const results: TopListingsByMonthReport[][] = [];

    for (const { month } of months) {
      const mostContactedListingsInMonth: TopListingsByMonthReport[] = await this.db.all<any>(
        `select listing_id as listingId,
                make,
                price,
                mileage,
                count(listing_id)                                             as contactCount,
                strftime('%m.%Y', datetime(contact_date / 1000, 'unixepoch')) as month
         from contact
                  join listing on contact.listing_id = listing.id
         where month = $month
         group by listing_id
         order by contactCount desc
         limit 5;
        `,
        { $month: month }
      );

      for (let i = 0; i < mostContactedListingsInMonth.length; i++) {
        mostContactedListingsInMonth[i]!.ranking = i + 1;
        mostContactedListingsInMonth[i]!.formattedPrice = formatCurrency(
          mostContactedListingsInMonth[i]!.price
        );
      }

      results.push(mostContactedListingsInMonth);
    }

    return results;
  }
}

export interface TopListingsByMonthReport {
  formattedPrice: string;
  month: string;
  ranking: number;
  listingId: number;
  make: string;
  price: number;
  mileage: number;
  contactsCount: number;
}
