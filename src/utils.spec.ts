import { formatCurrency } from "./utils";

describe("utils", () => {
  it("#formatCurrency should format as expected", () => {
    expect(formatCurrency(3529)).toEqual("€ 3.529,-");
    expect(formatCurrency(25037.338)).toEqual("€ 25.037,-");
    expect(formatCurrency(12345678)).toEqual("€ 12.345.678,-");
    expect(formatCurrency(1234567)).toEqual("€ 1.234.567,-");
    expect(formatCurrency(0)).toEqual("€ 0,-");
  });
});
