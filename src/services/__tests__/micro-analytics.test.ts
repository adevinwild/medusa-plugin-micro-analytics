import { LineItem, Order } from "@medusajs/medusa";
import { FindOperator, FindOptionsWhere } from "typeorm";

import { BetweenDate, MoreThanOrEqualDate } from "../../utils/date";
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

      if (q.where[0].created_at) {
        return Promise.resolve([]);
      }

      // When "all"
      return Promise.resolve([lineItemFixture]);
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
      const query = microAnalyticsService._getPeriodQuery(
        "day"
      ) as FindOptionsWhere<Order>;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(MoreThanOrEqualDate(today));
    });

    it("should return a query for the current week", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "week"
      ) as FindOptionsWhere<Order>;

      const now = new Date();
      const oneWeek = 7;
      const oneWeekAgo = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - oneWeek
      );

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(MoreThanOrEqualDate(oneWeekAgo));
    });

    it("should return a query for the current month", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "month"
      ) as FindOptionsWhere<Order>;

      const now = new Date();
      const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        BetweenDate(firstDayMonth, lastDayMonth)
      );
    });

    it("should return a query for the current year", () => {
      const query = microAnalyticsService._getPeriodQuery(
        "year"
      ) as FindOptionsWhere<Order>;

      const now = new Date();
      const firstDayYear = new Date(now.getFullYear(), 0, 1);
      const lastDayYear = new Date(now.getFullYear(), 11, 31);

      expect(query).toHaveProperty("created_at");
      expect(query.created_at).toStrictEqual(
        BetweenDate(firstDayYear, lastDayYear)
      );
    });

    it("should return an empty query for all time", () => {
      const query = microAnalyticsService._getPeriodQuery("all");

      expect(query).toStrictEqual({});
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
