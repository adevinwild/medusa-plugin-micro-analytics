import type { Router } from "express";

import getDashboardStats from "./get-dashboard-stats";

export default (router: Router) => {
  router.get("/admin/analytics/dashboard", getDashboardStats);
  return router;
};
