export type RawSearchParams = Record<string, string | string[] | undefined>;

export function getFirstSearchParamValue(
  value: string | string[] | undefined,
) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function pickSearchParamValues<const T extends readonly string[]>(
  searchParams: RawSearchParams,
  keys: T,
): { [K in T[number]]: string | undefined } {
  return keys.reduce(
    (result, key) => ({
      ...result,
      [key]: getFirstSearchParamValue(searchParams[key]),
    }),
    {} as { [K in T[number]]: string | undefined },
  );
}
