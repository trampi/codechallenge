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
