import { format } from "date-fns";
import { MoreThanOrEqual } from "typeorm";

export const SQL_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss.SSS";

export const MoreThanOrEqualDate = (date: Date) =>
  MoreThanOrEqual(format(date, SQL_DATE_FORMAT));

export const BetweenDate = (start: Date, end: Date) => ({
  $gte: format(start, SQL_DATE_FORMAT),
  $lte: format(end, SQL_DATE_FORMAT),
});
