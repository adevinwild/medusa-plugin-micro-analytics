import { LineItem } from "@medusajs/medusa";
import { Customer } from "@medusajs/medusa/dist/models/customer";
import {
  FulfillmentStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@medusajs/medusa/dist/models/order";
import { BaseService } from "medusa-interfaces";
import {
  EntityManager,
  FindOneOptions,
  FindOptionsWhere,
  Repository,
} from "typeorm";
import { BetweenDate, MoreThanOrEqualDate } from "../utils/date";

type Container = {
  manager: EntityManager;
  orderRepository: Repository<Order>;
  lineItemRepository: Repository<LineItem>;
  customerRepository: Repository<Customer>;
};

type MostSoldProduct = {
  id: string;
  variant_id: string;
  title: string;
  quantity: number;
};

type DashboardStatsResponse = {
  orders: {
    total: number;
    completed: number;
    pending: number;
    canceled: number;
  };
  products: {
    solded: number;
    mostSolded: MostSoldProduct;
  };
  customers: {
    total: number;
  };
  revenue: {
    total: number;
  };
};

export type Period = "day" | "week" | "month" | "year" | "all";

type FindStatsOptions = {
  period: Period;
};

const defaultOptions: FindStatsOptions = {
  period: "day",
};

class MicroAnalyticsService extends BaseService {
  constructor(private readonly container: Container) {
    super();
  }

  _getPeriodQuery(period: Period): FindOneOptions["where"] {
    const now = new Date();

    switch (period) {
      case "day": {
        const today = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

        return {
          created_at: MoreThanOrEqualDate(today),
        };
      }
      case "week": {
        const oneWeek = 7;
        const oneWeekAgo = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() - oneWeek
        );

        return {
          created_at: MoreThanOrEqualDate(oneWeekAgo),
        };
      }
      case "month": {
        const firstDayMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        return {
          created_at: BetweenDate(firstDayMonth, lastDayMonth),
        };
      }
      case "year": {
        const firstDayYear = new Date(now.getFullYear(), 0, 1);
        const lastDayYear = new Date(now.getFullYear(), 11, 31);

        return {
          created_at: BetweenDate(firstDayYear, lastDayYear),
        };
      }
      case "all":
      default:
        return {};
    }
  }

  async getOrdersStats(
    options: FindStatsOptions
  ): Promise<DashboardStatsResponse["orders"]> {
    const { orderRepository } = this.container;

    const period = this._getPeriodQuery(options.period);

    const total = await orderRepository.count({
      where: period,
    });

    const completed = await orderRepository.count({
      where: [
        period as FindOptionsWhere<Order>,
        {
          status: OrderStatus.COMPLETED,
        },
        {
          payment_status: PaymentStatus.CAPTURED,
          fulfillment_status: FulfillmentStatus.SHIPPED,
        },
      ],
    });

    const pending = await orderRepository.count({
      where: {
        ...period,
        status: OrderStatus.PENDING,
      },
    });

    const canceled = await orderRepository.count({
      where: {
        ...period,
        status: OrderStatus.CANCELED,
      },
    });

    return {
      total,
      completed,
      pending,
      canceled,
    };
  }

  async getProductsStats(
    options: FindStatsOptions
  ): Promise<DashboardStatsResponse["products"]> {
    const period = this._getPeriodQuery(options.period);

    const lineItems = await this.container.lineItemRepository.find({
      where: [
        period as FindOptionsWhere<LineItem>,
        {
          order: {
            status: OrderStatus.COMPLETED,
          },
        },
        {
          order: {
            status: OrderStatus.PENDING,
          },
        },
        {
          order: {
            payment_status: PaymentStatus.CAPTURED,
            fulfillment_status: FulfillmentStatus.SHIPPED,
          },
        },
      ],

      relations: ["variant", "variant.product"],
    });

    if (!lineItems.length) {
      return {
        solded: 0,
        mostSolded: null,
      };
    }

    const allProducts = lineItems.reduce((acc, curr) => {
      const { variant } = curr;
      const { product } = variant;

      const quantity = curr.quantity;

      if (!acc[product.id]) {
        acc[product.id] = {
          id: product.id,
          variant_id: variant.id,
          title: product.title,
          quantity: 0,
        };
      }

      acc[product.id].quantity += quantity;

      return acc;
    }, {} as Record<string, MostSoldProduct>);

    const mostSolded = Object.values(allProducts).sort(
      (a, b) => b.quantity - a.quantity
    )[0];

    const solded = Object.values(allProducts).reduce((acc, curr) => {
      return acc + curr.quantity;
    }, 0);

    return {
      solded,
      mostSolded: mostSolded || null,
    };
  }

  async getCustomersStats(
    options: FindStatsOptions
  ): Promise<DashboardStatsResponse["customers"]> {
    const total = await this.container.customerRepository.count({
      where: {
        ...this._getPeriodQuery(options.period),
      },
    });

    return {
      total,
    };
  }

  async getRevenueStats() {
    const { total } = await this.container.orderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.payments", "payment")
      .where("order.status = :status", { status: OrderStatus.COMPLETED })
      .select("SUM(payment.amount)", "total")
      .getRawOne();

    return {
      total: +total || 0,
    };
  }

  async getDashboardStats(options: FindStatsOptions) {
    const orders = await this.getOrdersStats(options || defaultOptions);
    const products = await this.getProductsStats(options || defaultOptions);
    const customers = await this.getCustomersStats(options || defaultOptions);
    const revenue = await this.getRevenueStats();

    return {
      orders,
      products,
      customers,
      revenue,
    };
  }
}

export default MicroAnalyticsService;
