export function createReviewDate(year: number, monthIndex: number, day: number) {
  return new Date(Date.UTC(year, monthIndex, day, 12, 0, 0, 0));
}

export function createReviewDateFromLocalParts(base: Date) {
  return createReviewDate(base.getFullYear(), base.getMonth(), base.getDate());
}
