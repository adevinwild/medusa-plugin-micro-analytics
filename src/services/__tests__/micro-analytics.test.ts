import { LineItem, Order } from "@medusajs/medusa";
import { Between, FindOperator, FindOptionsWhere, Not } from "typeorm";
import {
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";

import { MockManager, MockRepository } from "../../utils/tests";
import lineItemFixture from "../__fixtures__/line-item-winter-jacket.json";
import MicroAnalyticsService from "../micro-analytics";

type QueryParameter<T> = {
  where: Record<keyof T, FindOperator<T>> | Record<keyof T, FindOperator<T>>[];
};

describe("MicroAnalyticsService", () => {
  const manager = MockManager;

  const orderRepository = MockRepository({
    count: (q: QueryParameter<Order>) => {
      return Promise.resolve(1);
    },
  });

  const lineItemRepository = MockRepository({
    find: (q: QueryParameter<LineItem>) => {
      if (!Array.isArray(q.where)) {
        return Promise.resolve([]);
      }

      // If the query is for "all" the time, return the fixture
      if (q.where.every((query) => query.created_at.type === "not")) {
        return Promise.resolve([lineItemFixture]);
      }

      return Promise.resolve([]);
    },
  });

  const customerRepository = MockRepository({});

  const microAnalyticsService = new MicroAnalyticsService({
    manager,
    orderRepository,
    lineItemRepository,
    customerRepository,
  } as any);

  describe("_getPeriodQuery", () => {
    it("should return a query for the current day", () => {
      const query = microAnalyticsService._getPeriodQuery("day", new Date(0));

      const now = new Date(0);

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        Between(
          now,
          new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
        )
      );
    });

    it("should return a query for the current week", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "week"
      ) as FindOptionsWhere<Order>;

      const now = new Date();

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        Between(startOfWeek(now), endOfWeek(now))
      );
    });

    it("should return a query for the current month", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "month"
      ) as FindOptionsWhere<Order>;

      const now = new Date();

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        Between(startOfMonth(now), endOfMonth(now))
      );
    });

    it("should return a query for the current year", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "year"
      ) as FindOptionsWhere<Order>;

      const now = new Date();

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        Between(startOfYear(now), endOfYear(now))
      );
    });

    it("should return a date from", () => {
      const query = microAnalyticsService._getPeriodQuery("all");

      expect(query).toStrictEqual({
        created_at: Not(null),
      });
    });
  });

  describe("getProductsStats", () => {
    it("should return the correct stats", async () => {
      const stats = await microAnalyticsService.getProductsStats({
        period: "all",
      });

      expect(stats).toEqual({
        solded: 1,
        mostSolded: {
          id: "prod_01HCCTCZ3NVYWN9Z07W38N94ED",
          variant_id: "variant_01HCCTCZ53KJG8RWN9K3J6NZYC",
          title: "Winter Jacket",
          thumbnail: null,
          quantity: 1,
        },
      });
    });

    it("should return null if no products are found", async () => {
      const stats = await microAnalyticsService.getProductsStats({
        period: "day",
      });

      expect(stats).toEqual({
        solded: 0,
        mostSolded: null,
      });
    });
  });

  describe("getOrdersStats", () => {
    it("returns the correct stats when the period is `all`", async () => {
      const result = await microAnalyticsService.getOrdersStats({
        period: "all",
      });

      expect(orderRepository.count).toHaveBeenCalledTimes(4);

      expect(result).toEqual({
        total: 1,
        completed: 1,
        pending: 1,
        canceled: 1,
      });
    });
  });
});
