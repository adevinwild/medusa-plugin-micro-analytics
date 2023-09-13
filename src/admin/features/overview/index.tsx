"use client"

import { useAdminCustomQuery } from "medusa-react";
import MetricCard from "../../components/metric-card";
import { CheckIcon } from "lucide-react";

const Overview = () => {
  const query = useAdminCustomQuery("/analytics/dashboard", ["analytics", "dashboard"])
  if (!query.data || query.isLoading) return <div>Loading...</div>

  return <div className="gap-x-small grid grid-cols-3">
    <MetricCard icon={CheckIcon} title="Orders completed" value={query.data.orders.completed} />
    <MetricCard icon={CheckIcon} title="Orders pending" value={query.data.orders.pending} />
  </div>;
};

export default Overview;
