import { pgTable, serial, text, integer, decimal, timestamp, index } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

// Order status flow: pending → confirmed → processing → shipped → delivered | cancelled
export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  // Customer — userId is set for logged-in users, null for guests
  userId: integer("user_id"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address"),
  paymentMethod: text("payment_method").notNull().default("cash_on_delivery"),
  paymentStatus: text("payment_status").notNull().default("pending"), // pending | paid | failed
  status: text("status").notNull().default("pending"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  
  // Fulfillment Assignment
  assignedToId: integer("assigned_to_id").references(() => usersTable.id, { onDelete: "set null" }),

  // QR Payment verification details
  transactionId: text("transaction_id"),
  paymentProof: text("payment_proof"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  // "My Orders" filters by userId on every load; admin filters by status.
  index("orders_user_id_idx").on(table.userId),
  index("orders_status_idx").on(table.status),
  index("orders_assigned_to_idx").on(table.assignedToId),
]);

export const orderItemsTable = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  productName: text("product_name").notNull(),
  productImage: text("product_image"),
  quantity: integer("quantity").notNull().default(1),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  color: text("color"),
  material: text("material"),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
  index("order_items_product_id_idx").on(table.productId),
]);

export type Order = typeof ordersTable.$inferSelect;
export type OrderItem = typeof orderItemsTable.$inferSelect;