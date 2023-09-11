"use client";

import { useMemo } from "react";

import { EndpointMetric } from "../../../models/endpoint-metric";
import MetricCard from "../../components/metric-card";
import useListMetrics from "./use-metrics";

type Props = {};

const Overview = (props: Props) => {
  const query = useListMetrics();
  const metrics: EndpointMetric[] = query.data || [];

  const groupedMetrics: Record<string, EndpointMetric[]> = useMemo(() => {
    if (!metrics.length) return {};

    return metrics.reduce((acc, metric) => {
      const { path } = metric;

      if (!acc[path]) {
        acc[path] = [];
      }

      acc[path].push(metric);

      return acc;
    }, {});
  }, [metrics]);

  console.log({ groupedMetrics });

  return (
    <div className="gap-x-small grid grid-cols-3">
      {Object.keys(groupedMetrics).map((path, idx) => {
        const metrics = groupedMetrics[path];

        return (
          <MetricCard
            key={idx}
            icon={null}
            title={path}
            value={`${metrics.length} requests`}
          />
        );
      })}

      {/* {!!metrics.length && */}
      {/* metrics.map((metric, idx) => <MetricCard key={idx} {...metric} />)} */}
    </div>
  );
};

export default Overview;
