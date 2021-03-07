export type SellerType = "private" | "dealer" | "other";

export interface Listing {
  id: number;
  make: string; // TODO: normalize?
  price: number;
  mileage: number;
  sellerType: SellerType; // TODO: normalize in db?
}

export interface Contact {
  listingId: number;
  contactDate: number;
}
