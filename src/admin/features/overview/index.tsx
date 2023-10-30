import { CheckIcon, CircleSlash, Timer } from "lucide-react";
import MostSoldedProductCard from "./components/cards/most-solded-product";
import RevenueChartCard from "./components/cards/revenue-chart";
import SimpleCard from "./components/cards/simple";
import SelectPeriod from "./components/select-period";
import useDashboard from "./use-dashboard";

const Overview = () => {
  const { metrics, isLoading, period, setPeriod } = useDashboard();

  if (!metrics || isLoading) {
    return (
      <div className="min-h-[100vh] flex items-center justify-center">
        Loading
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <div className="mb-6 flex justify-between items-center gap-x-6">
        <div className="grid align-center gap-y-2">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <h2 className="text-base text-grey-50">
            Dive into your store's performance metrics. Understand sales trends,
            customer behaviors, and inventory insights to drive your business
            forward.
          </h2>
        </div>
        <SelectPeriod period={period} setPeriod={setPeriod} />
      </div>
      <div className="flex flex-col gap-y-10 pb-8">
        <div className="gap-x-10 grid grid-cols-3">
          <SimpleCard
            icon={CheckIcon}
            title="Orders completed"
            value={metrics.orders.completed}
          />
          <SimpleCard
            icon={Timer}
            title="Orders pending"
            value={metrics.orders.pending}
          />
          <SimpleCard
            icon={CircleSlash}
            title="Orders canceled"
            value={metrics.orders.canceled}
          />
        </div>
        <div className="flex gap-x-10">
          <RevenueChartCard
            title="Estimated revenue"
            revenue={metrics.revenue}
          />
          <MostSoldedProductCard
            title="Top product"
            product={metrics.products.mostSolded}
          />
        </div>
      </div>
    </div>
  );
};

export default Overview;
