import Inventory from "./inventory.model";
import { InventoryMovementType } from "../../enum/inventory.enum";
import { Types } from "mongoose";

export const InventoryService = {
  recordMovement: async (params: {
    productId: string | Types.ObjectId;
    type: InventoryMovementType;
    quantity: number;
    reason?: string;
    orderId?: string | Types.ObjectId | null;
    userId?: string | Types.ObjectId | null;
  }) => {
    const { productId, type, quantity, reason, orderId, userId } = params;

    return await Inventory.create({
      product: new Types.ObjectId(productId),
      type,
      quantity: Math.max(0, Math.floor(quantity)),
      reason: reason ?? null,
      order: orderId ? new Types.ObjectId(orderId) : null,
      user: userId ? new Types.ObjectId(userId) : null,
    });
  },
};