import mongoose, { Schema } from "mongoose";
import { IInventoryMovement, InventoryModel } from "./inventory.interface";
import { InventoryMovementType } from "../../enum/inventory.enum";

const inventorySchema = new Schema<IInventoryMovement, InventoryModel>(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    type: {
      type: String,
      enum: [InventoryMovementType.IN, InventoryMovementType.OUT, InventoryMovementType.ADJUST],
      required: true,
    },
    quantity: { type: Number, required: true, min: 0 },
    reason: { type: String, default: null },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    user: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

const Inventory = mongoose.model<IInventoryMovement, InventoryModel>("Inventory", inventorySchema);
export default Inventory;