import { useState } from "react";

import SegmentedControl, {
  SegmentedControlItem,
} from "../../components/segmented-control";
import Overview from "../../features/overview";
import ApiOverview from "../../features/api";
import Settings from "../../features/settings";
import { PieChart } from "lucide-react";
import { RouteConfig } from "@medusajs/admin";
import { Select } from "@medusajs/ui";

const controls: SegmentedControlItem[] = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "Monitoring",
    value: "monitoring",
  },
  {
    label: "Settings",
    value: "settings",
  },
];

const render = {
  overview: Overview,
  monitoring: ApiOverview,
  settings: Settings,
};

const Page = () => {
  const [activeControl, setActiveControl] = useState("overview");

  const CurrentView = render[activeControl];

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <h2 className="text-base text-grey-50">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec
          euismod, nisl eget fermentum aliquam.
        </h2>
      </div>

      <div className="flex items-center justify-between w-full mb-4">
        <SegmentedControl
          data={controls}
          value={activeControl}
          onChange={setActiveControl}
        />
        <div className="max-w-[10rem] w-full flex items-center justify-end">
          <Select value={"today"}>
            <Select.Trigger className="bg-white">
              <Select.Value placeholder="Select a timestamp" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={"today"}>Today</Select.Item>
              <Select.Item value={"week"}>This week</Select.Item>
              <Select.Item value={"month"}>This month</Select.Item>
              <Select.Item value={"year"}>This year</Select.Item>
              <Select.Item value={"all"}>All time</Select.Item>
            </Select.Content>
          </Select>
        </div>
      </div>

      <CurrentView />
    </div>
  );
};

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: () => <PieChart size={16} />,
  },
};

export default Page;
