import { Product } from "@medusajs/medusa/dist/models/product";
import { Customer } from "@medusajs/medusa/dist/models/customer";
import { Order, OrderStatus } from "@medusajs/medusa/dist/models/order";
import { BaseService } from "medusa-interfaces";
import { EntityManager, MoreThanOrEqual, Repository } from "typeorm";

type Container = {
  manager: EntityManager;
  orderRepository: Repository<Order>;
  productRepository: Repository<Product>;
  customerRepository: Repository<Customer>;
};

type DashboardStatsResponse = {
  orders: {
    total: number;
    completed: number;
    pending: number;
    canceled: number;
  };
  products: {
    total: number;
    sold: number;
    returned: number;
  };
  customers: {
    total: number;
    new: number;
  };
  revenue: {
    total: number;
  };
  refunds: {
    total: number;
  };
};

type FindStatsOptions = {
  period: "day" | "week" | "month" | "year" | "all";
};

const defaultOptions: FindStatsOptions = {
  period: "day",
};

class MicroAnalyticsService extends BaseService {
  constructor(private readonly container: Container) {
    super();
  }

  private getPeriodQuery(period: string) {
    const date = new Date();
    switch (period) {
      case "day":
      default:
        return {
          created_at: MoreThanOrEqual(
            new Date(date.getFullYear(), date.getMonth(), date.getDate())
          ),
        };
      case "week":
        return {
          created_at: MoreThanOrEqual(
            new Date(date.getFullYear(), date.getMonth(), date.getDate() - 7)
          ),
        };
      case "month":
        return {
          created_at: MoreThanOrEqual(
            new Date(date.getFullYear(), date.getMonth(), date.getDate() - 30)
          ),
        };
      case "year":
        return {
          created_at: MoreThanOrEqual(
            new Date(date.getFullYear(), date.getMonth(), date.getDate() - 365)
          ),
        };
    }
  }

  private async getOrdersStats(options: FindStatsOptions = defaultOptions) {
    const { orderRepository } = this.container;

    const period = options.period;

    const total = await orderRepository.count();

    const completed = await orderRepository.count({
      where: {
        ...this.getPeriodQuery(period),
        status: OrderStatus.COMPLETED,
      },
    });

    const pending = await orderRepository.count({
      where: {
        ...this.getPeriodQuery(period),
        status: OrderStatus.PENDING,
      },
    });

    const canceled = await orderRepository.count({
      where: {
        ...this.getPeriodQuery(period),
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

  private async getProductsStats() {
    return {};
  }

  private async getCustomersStats() {
    return {};
  }

  private async getRevenueStats() {
    return {};
  }

  private async getRefundsStats() {
    return {};
  }

  async getDashboardStats() {
    const orders = await this.getOrdersStats();

    return {
      orders,
    };
  }
}

export default MicroAnalyticsService;
