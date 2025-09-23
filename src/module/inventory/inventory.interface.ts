import { Document, Model, Types } from "mongoose";
import { InventoryMovementType } from "../../enum/inventory.enum";

export interface IInventoryMovement extends Document {
  product: Types.ObjectId;
  type: InventoryMovementType;
  quantity: number;
  reason?: string | null;
  order?: Types.ObjectId | null;
  user?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryModel extends Model<IInventoryMovement> {}