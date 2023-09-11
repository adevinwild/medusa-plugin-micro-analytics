import type { Request, Response } from "express";
import MicroAnalyticsService from "../../../services/micro-analytics";

export default async (req: Request, res: Response) => {
  const microAnalyticsService: MicroAnalyticsService = req.scope.resolve(
    "microAnalyticsService"
  );
  const result = await microAnalyticsService.getDashboardStats();
  res.json(result);
};
