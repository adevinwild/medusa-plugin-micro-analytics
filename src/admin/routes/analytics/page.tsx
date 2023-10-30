import { RouteConfig } from "@medusajs/admin";
import { PieChart } from "lucide-react";

import Overview from "../../features/overview";

const Page = () => {
  return <Overview />;
};

export const config: RouteConfig = {
  link: {
    label: "Analytics",
    icon: () => <PieChart size={16} />,
  },
};

export default Page;
