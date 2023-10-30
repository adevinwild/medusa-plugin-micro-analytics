import { Container } from "@medusajs/ui";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DashboardStatsResponse } from "../../../../../services/micro-analytics";

type Props = {
  title: string;
  revenue: DashboardStatsResponse["revenue"];
  className?: string;
};

const RevenueChartCard = (props: Props) => {
  const { title } = props;

  const previousRevenue = parseFloat(
    (props.revenue.previous.total / 100).toString()
  );
  const currentRevenue = parseFloat(
    (props.revenue.current.total / 100).toString()
  );

  return (
    <Container className="flex flex-col gap-y-1.5 p-8">
      <div className="flex flex-col gap-y-1.5">
        <p className="text-lg capitalize text-grey-90 font-medium">{title}</p>
        <div className="w-full h-[20rem] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={[
                {
                  name: props.revenue.previous.date,
                  Revenue: previousRevenue,
                },
                {
                  name: props.revenue.current.date,
                  Revenue: currentRevenue,
                },
              ]}
              width={320}
              height={320}
            >
              <XAxis dataKey="name" />
              <YAxis unit="$" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="Revenue"
                className="stroke-current text-blue-500"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Container>
  );
};

export default RevenueChartCard;
