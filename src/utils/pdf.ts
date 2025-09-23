import PDFDocument from "pdfkit";
import { IOrder } from "../module/order/order.interface";
import { Response } from "express";

export const generateOrderInvoicePDF = (order: IOrder, res: Response) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=invoice-${order._id}.pdf`);
  doc.pipe(res);

  // Header
  doc.fontSize(20).text("Order Invoice", { align: "center" });
  doc.moveDown();

  // Order info
  doc.fontSize(12).text(`Order ID: ${order._id}`);
  doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`);
  doc.moveDown();

  // Customer
  doc.fontSize(14).text("Customer Info");
  doc.fontSize(12).text(`Name: ${order.customer.name}`);
  doc.text(`Phone: ${order.customer.phone}`);
  doc.text(`Address: ${order.customer.fullAddress}`);
  if (order.customer.note) doc.text(`Note: ${order.customer.note}`);
  doc.moveDown();

  // Items
  doc.fontSize(14).text("Items");
  doc.moveDown(0.5);
  order.items.forEach((it) => {
    doc
      .fontSize(12)
      .text(`${it.name} (x${it.quantity}) - ${it.unitPrice.toFixed(2)} each = ${it.totalPrice.toFixed(2)}`);
  });
  doc.moveDown();

  // Totals
  doc.fontSize(12).text(`Subtotal: ${order.subtotal.toFixed(2)}`);
  doc.text(`Shipping: ${order.shippingCost.toFixed(2)}`);
  doc.text(`Total: ${order.total.toFixed(2)}`);

  doc.end();
};

export const generateSystemReportPDF = (
  report: { range: string; from: Date; stats: { users: number; orders: number; sales: number } },
  res: Response
) => {
  const doc = new PDFDocument({ margin: 50 });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `inline; filename=system-report-${report.range}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text("System Report", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Range: ${report.range}`);
  doc.text(`From: ${report.from.toLocaleString()}`);
  doc.moveDown();

  doc.fontSize(14).text("Summary");
  doc.fontSize(12).text(`New Users: ${report.stats.users}`);
  doc.text(`Orders: ${report.stats.orders}`);
  doc.text(`Sales: ${report.stats.sales.toFixed(2)}`);

  doc.end();
};