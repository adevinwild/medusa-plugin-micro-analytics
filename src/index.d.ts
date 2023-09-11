import { MedusaContainer } from "medusa-core-utils";

declare global {
  declare namespace Express {
    interface Request {
      scope: MedusaContainer;
    }
  }
}
