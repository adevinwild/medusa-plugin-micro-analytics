import { useAdminCustomQuery } from "medusa-react";
import { useState } from "react";
import type {
  Period,
  DashboardStatsResponse,
} from "../../../services/micro-analytics";

export default function useDashboard() {
  const [period, setPeriod] = useState<Period>("day");

  const query = useAdminCustomQuery(
    "/analytics/dashboard",
    ["analytics", "dashboard", period],
    {
      period,
    }
  );

  const metrics: DashboardStatsResponse | null = query.data ?? null;

  return {
    ...query,
    metrics,
    period,
    setPeriod,
  };
}
