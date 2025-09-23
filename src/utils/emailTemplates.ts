import { IOrder } from "../module/order/order.interface";

export function orderAdminHtml(order: IOrder) {
  const itemsRows = order.items
    .map(
      (it) => `
      <tr>
        <td>${it.name}</td>
        <td align="right">${it.quantity}</td>
        <td align="right">${it.unitPrice.toFixed(2)}</td>
        <td align="right">${it.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222">
    <h2>New Order #${order._id}</h2>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <h3>Customer</h3>
    <p>
      ${order.customer.name}<br/>
      ${order.customer.email || ""}<br/>
      ${order.customer.phone}<br/>
      ${order.customer.fullAddress}
    </p>
    <h3>Items</h3>
    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse">
      <thead>
        <tr style="background:#f3f3f3">
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Unit</th>
          <th align="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>
    <p style="text-align:right;margin-top:10px">
      <strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}<br/>
      <strong>Shipping:</strong> ${order.shippingCost.toFixed(2)}<br/>
      <strong>Total:</strong> ${order.total.toFixed(2)}
    </p>
  </div>
  `;
}

export function orderCustomerHtml(order: IOrder) {
  const items = order.items
    .map(
      (it) => `
      <tr>
        <td>${it.name}</td>
        <td align="right">${it.quantity}</td>
        <td align="right">${it.unitPrice.toFixed(2)}</td>
        <td align="right">${it.totalPrice.toFixed(2)}</td>
      </tr>`
    )
    .join("");

  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;margin:0 auto;color:#222">
    <h2>Thank you for your order, ${order.customer.name}!</h2>
    <p>Your order has been placed successfully. A PDF invoice is attached to this email.</p>
    <h3>Order #${order._id}</h3>
    <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <h3>Items</h3>
    <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse">
      <thead>
        <tr style="background:#f3f3f3">
          <th align="left">Item</th>
          <th align="right">Qty</th>
          <th align="right">Unit</th>
          <th align="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items}
      </tbody>
    </table>
    <p style="text-align:right;margin-top:10px">
      <strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}<br/>
      <strong>Shipping:</strong> ${order.shippingCost.toFixed(2)}<br/>
      <strong>Total:</strong> ${order.total.toFixed(2)}
    </p>
    <p style="margin-top:20px">We will contact you at ${order.customer.phone} if needed.<br/>Regards,<br/>Sundoritto</p>
  </div>
  `;
}