import { IsEnum, IsOptional } from "class-validator";
import type { Request, Response } from "express";
import MicroAnalyticsService, {
  Period,
} from "../../../services/micro-analytics";
import { validator } from "../../../utils/validator";

export default async (req: Request, res: Response) => {
  console.log("v2");
  const microAnalyticsService: MicroAnalyticsService = req.scope.resolve(
    "microAnalyticsService"
  );

  try {
    const validated = await validator(GetDashboardStatsValidator, req.query);
    console.log(validated.period);

    const result = await microAnalyticsService.getDashboardStats({
      period: validated.period,
    });
    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({
        message: error.message,
      });
      return;
    }

    res.status(400).json({
      message: "Invalid request",
    });
  }
};

const periodEnum = ["day", "week", "month", "year", "all"] as const;

export class GetDashboardStatsValidator {
  @IsOptional()
  @IsEnum(periodEnum satisfies ReadonlyArray<Period>, { each: true })
  period: Period;
}
