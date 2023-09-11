import type { ConfigModule } from "@medusajs/types";
import { getConfigFile } from "medusa-core-utils";
import { Router } from "express";
import cors from "cors";

import analyticsRouter from "./routes/analytics";

export default function (rootDirectory: string): Router | Router[] {
  const app = Router();

  const { configModule } = getConfigFile(rootDirectory, "medusa-config");
  const { plugins, projectConfig } = configModule as ConfigModule;

  const adminCorsOptions = {
    origin: projectConfig.admin_cors.split(","),
    credentials: true,
  };

  const regexAdminAnalytics = new RegExp("^/admin/analytics");

  app.use(regexAdminAnalytics, cors(adminCorsOptions));
  analyticsRouter(app);

  return app;
}
