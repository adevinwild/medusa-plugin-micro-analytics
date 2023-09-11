import { useAdminCustomQuery } from "medusa-react";

export default function useListMetrics() {
  // const metrics = [
  //   {
  //     icon: ShoppingCart,
  //     title: "Orders Placed",
  //     value: "0",
  //   },
  //   {
  //     icon: Check,
  //     title: "Orders Completed",
  //     value: "0",
  //   },
  //   {
  //     icon: DollarSign,
  //     title: "Revenue",
  //     value: "$ 0.00",
  //   },
  // ];

  const query = useAdminCustomQuery("/analytics", ["analytics"]);

  return query;
}
