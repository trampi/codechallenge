export function propertiesMatch(expectedKeys: Array<string>, obj: object) {
  const keys = Object.keys(obj);
  return flatArrayEquals(expectedKeys, keys);
}

export function flatArrayEquals<T>(arr1: Array<T>, arr2: Array<T>) {
  return (
    arr1 &&
    arr2 &&
    arr1.length === arr2.length &&
    arr1.every((value, index) => value === arr2[index])
  );
}

function thousandSeparatorNumbers(currency: number) {
  const parts = [];

  if (currency < 0) {
    throw new Error("formatting negative numbers not supported");
  }

  if (currency === 0) {
    parts.push(0);
  } else {
    while (currency > 0) {
      const part = Math.floor(currency % 1000);
      currency = Math.floor(currency / 1000);
      if (currency > 0) {
        parts.push(part.toString(10).padStart(3, "0"));
      } else {
        parts.push(part);
      }
    }
  }
  return parts.reverse().join(".");
}

export function formatCurrency(currency: number) {
  return "€ " + thousandSeparatorNumbers(currency) + ",-";
}

export function formatMileage(mileage: number) {
  return thousandSeparatorNumbers(mileage) + " KM";
}
