import { MedusaContainer } from "medusa-core-utils";
import { Order as MedusaOrder } from "@medusajs/medusa";
declare global {
  declare namespace Express {
    interface Request {
      scope: MedusaContainer;
    }
  }
}

/**
 * Hack for the FindOptionsWhere convert to string issue
 */
export declare module "@medusajs/medusa/dist/models/order" {
  declare interface Order extends MedusaOrder {
    created_at: Date | string;
  }
}
