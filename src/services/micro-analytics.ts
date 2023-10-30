import { LineItem } from "@medusajs/medusa";
import { Customer } from "@medusajs/medusa/dist/models/customer";
import {
  FulfillmentStatus,
  Order,
  OrderStatus,
  PaymentStatus,
} from "@medusajs/medusa/dist/models/order";
import {
  endOfMonth,
  endOfWeek,
  endOfYear,
  format,
  startOfMonth,
  startOfWeek,
  startOfYear,
  subDays,
  subMonths,
  subWeeks,
  subYears,
} from "date-fns";
import { BaseService } from "medusa-interfaces";
import { Between, EntityManager, FindOperator, Not, Repository } from "typeorm";

type Container = {
  manager: EntityManager;
  orderRepository: Repository<Order>;
  lineItemRepository: Repository<LineItem>;
  customerRepository: Repository<Customer>;
};

export type MostSoldProduct = {
  id: string;
  variant_id: string;
  title: string;
  thumbnail: string;
  quantity: number;
};

export type DashboardStatsResponse = {
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
    current: {
      total: number;
      date: string;
    };
    previous: {
      total: number;
      date: string;
    };
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

  _getPeriodQuery(
    period: Period,
    date?: Date
  ): {
    created_at: FindOperator<Date>;
  } {
    const now = date ?? new Date();

    switch (period) {
      case "day": {
        return {
          created_at: Between(
            now,
            new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
          ),
        };
      }
      case "week": {
        return {
          created_at: Between(startOfWeek(now), endOfWeek(now)),
        };
      }
      case "month": {
        return {
          created_at: Between(startOfMonth(now), endOfMonth(now)),
        };
      }
      case "year": {
        return {
          created_at: Between(startOfYear(now), endOfYear(now)),
        };
      }
      case "all":
      default:
        return {
          created_at: Not(null),
        };
    }
  }

  private _getOrdersTotal(orders: Order[]) {
    return orders.reduce((acc, curr) => {
      const { payments } = curr;

      const orderTotal = payments.reduce((acc, curr) => {
        return acc + curr.amount;
      }, 0);

      return acc + orderTotal;
    }, 0);
  }

  private _getPreviousPeriodQuery(period: Period) {
    const now = new Date();

    switch (period) {
      case "day": {
        return {
          created_at: Between(
            subDays(now, 1),
            new Date(now.getFullYear(), now.getMonth(), now.getDate())
          ),
        };
      }
      case "week": {
        return {
          created_at: Between(
            subWeeks(startOfWeek(now), 1),
            subWeeks(endOfWeek(now), 1)
          ),
        };
      }
      case "month": {
        return {
          created_at: Between(
            subMonths(startOfMonth(now), 1),
            subMonths(endOfMonth(now), 1)
          ),
        };
      }
      case "year": {
        return {
          created_at: Between(
            subYears(startOfYear(now), 1),
            subYears(endOfYear(now), 1)
          ),
        };
      }
      case "all":
      default:
        return {
          created_at: Not(null),
        };
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
        {
          created_at: period.created_at,
          status: OrderStatus.COMPLETED,
        },
        {
          created_at: period.created_at,
          payment_status: PaymentStatus.CAPTURED,
          fulfillment_status: FulfillmentStatus.SHIPPED,
        },
      ],
    });

    const pending = await orderRepository.count({
      where: {
        created_at: period.created_at,
        status: OrderStatus.PENDING,
      },
    });

    const canceled = await orderRepository.count({
      where: {
        created_at: period.created_at,
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
        {
          created_at: period.created_at,
          order: {
            status: OrderStatus.COMPLETED,
          },
        },
        {
          created_at: period.created_at,
          order: {
            status: OrderStatus.PENDING,
          },
        },
        {
          created_at: period.created_at,
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
          thumbnail: product.thumbnail,
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
    const period = this._getPeriodQuery(options.period);

    const total = await this.container.customerRepository.count({
      where: {
        created_at: period.created_at,
      },
    });

    return {
      total,
    };
  }

  async getRevenueStats(
    options: FindStatsOptions
  ): Promise<DashboardStatsResponse["revenue"]> {
    const period = this._getPeriodQuery(options.period);
    const previousPeriod = this._getPreviousPeriodQuery(options.period);

    const currentOrders = await this.container.orderRepository.find({
      where: [
        {
          created_at: period.created_at,
          status: OrderStatus.COMPLETED,
        },
        {
          created_at: period.created_at,
          payment_status: PaymentStatus.CAPTURED,
          fulfillment_status: FulfillmentStatus.SHIPPED,
        },
      ],
      select: ["id", "payments"],
      relations: ["payments"],
    });

    const previousOrders = await this.container.orderRepository.find({
      where: [
        {
          created_at: previousPeriod.created_at,
          status: OrderStatus.COMPLETED,
        },
        {
          created_at: previousPeriod.created_at,
          payment_status: PaymentStatus.CAPTURED,
          fulfillment_status: FulfillmentStatus.SHIPPED,
        },
      ],
      select: ["id", "payments"],
      relations: ["payments"],
    });

    const currentTotal = this._getOrdersTotal(currentOrders);
    const previousTotal = this._getOrdersTotal(previousOrders);

    const currentDate = period.created_at.multipleParameters
      ? options.period === "day"
        ? (period.created_at.value[0] as Date)
        : (period.created_at.value[1] as Date)
      : (period.created_at.value as Date);

    const previousDate = previousPeriod.created_at.multipleParameters
      ? options.period === "day"
        ? (previousPeriod.created_at.value[0] as Date)
        : (previousPeriod.created_at.value[1] as Date)
      : (previousPeriod.created_at.value as Date);

    return {
      current: {
        total: currentTotal,
        date: format(currentDate, "yyyy-MM-dd"),
      },
      previous: {
        total: previousTotal,
        date: format(previousDate, "yyyy-MM-dd"),
      },
    };
  }

  async getDashboardStats(options: FindStatsOptions) {
    const _orders = this.getOrdersStats(options || defaultOptions);
    const _products = this.getProductsStats(options || defaultOptions);
    const _customers = this.getCustomersStats(options || defaultOptions);
    const _revenue = this.getRevenueStats(options || defaultOptions);

    const [orders, products, customers, revenue] = await Promise.all([
      _orders,
      _products,
      _customers,
      _revenue,
    ]);

    return {
      orders,
      products,
      customers,
      revenue,
    };
  }
}

export default MicroAnalyticsService;
