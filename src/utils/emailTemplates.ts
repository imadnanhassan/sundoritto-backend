import { IOrder } from "../module/order/order.interface";

type Lang = "en" | "bn";

const t = (key: string, lang: Lang = "en") => {
  const dict: Record<string, Record<Lang, string>> = {
    newOrder: { en: "New Order", bn: "নতুন অর্ডার" },
    thankYou: { en: "Thank you for your order", bn: "আপনার অর্ডারের জন্য ধন্যবাদ" },
    placedMsg: {
      en: "Your order has been placed successfully. A PDF invoice is attached to this email.",
      bn: "আপনার অর্ডার সফলভাবে সম্পন্ন হয়েছে। পিডিএফ ইনভয়েস সংযুক্ত রয়েছে।",
    },
    order: { en: "Order", bn: "অর্ডার" },
    date: { en: "Date", bn: "তারিখ" },
    customer: { en: "Customer", bn: "গ্রাহক" },
    items: { en: "Items", bn: "আইটেম" },
    qty: { en: "Qty", bn: "সংখ্যা" },
    unit: { en: "Unit", bn: "একক" },
    total: { en: "Total", bn: "মোট" },
    subtotal: { en: "Subtotal", bn: "সাবটোটাল" },
    shipping: { en: "Shipping", bn: "শিপিং" },
    contact: { en: "We will contact you if needed.", bn: "প্রয়োজনে আমরা আপনার সাথে যোগাযোগ করবো।" },
    regards: { en: "Regards", bn: "শুভেচ্ছান্তে" },
    statusUpdate: { en: "Order Status Update", bn: "অর্ডার স্ট্যাটাস আপডেট" },
    placed: { en: "placed", bn: "প্লেসড" },
    delivered: { en: "delivered", bn: "ডেলিভারড" },
    canceled: { en: "canceled", bn: "বাতিল" },
    refunded: { en: "refunded", bn: "রিফান্ড" },
    now: { en: "is now", bn: "এখন" },
  };
  return (dict[key] && dict[key][lang]) || dict[key]?.en || key;
};

const branding = () => {
  return {
    name: process.env.BRAND_NAME || "Sundoritto",
    logo: process.env.BRAND_LOGO_URL || "",
    color: process.env.BRAND_PRIMARY_COLOR || "#4F46E5",
  };
};

const layout = (innerHtml: string) => {
  const brand = branding();
  const logoBlock = brand.logo
    ? `<img src="${brand.logo}" alt="${brand.name}" style="height:40px" />`
    : `<strong style="font-size:18px;color:${brand.color}">${brand.name}</strong>`;
  return `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:700px;margin:0 auto;color:#222">
    <div style="display:flex;align-items:center;gap:8px;border-bottom:1px solid #eee;padding:16px 0;margin-bottom:16px">
      ${logoBlock}
    </div>
    ${innerHtml}
    <div style="border-top:1px solid #eee;margin-top:24px;padding-top:12px;color:#777;font-size:12px">
      ${brand.name}
    </div>
  </div>`;
};

const itemsTable = (order: IOrder, lang: Lang = "en") => {
  const rows = order.items
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
  <table width="100%" cellspacing="0" cellpadding="8" style="border-collapse:collapse">
    <thead>
      <tr style="background:#f3f3f3">
        <th align="left">${t("items", lang)}</th>
        <th align="right">${t("qty", lang)}</th>
        <th align="right">${t("unit", lang)}</th>
        <th align="right">${t("total", lang)}</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
};

export function orderAdminHtml(order: IOrder, lang: Lang = "en") {
  const html = `
    <h2>${t("newOrder", lang)} #${order._id}</h2>
    <p><strong>${t("date", lang)}:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    <h3>${t("customer", lang)}</h3>
    <p>
      ${order.customer.name}<br/>
      ${order.customer.email || ""}<br/>
      ${order.customer.phone}<br/>
      ${order.customer.fullAddress}
    </p>
    ${itemsTable(order, lang)}
    <p style="text-align:right;margin-top:10px">
      <strong>${t("subtotal", lang)}:</strong> ${order.subtotal.toFixed(2)}<br/>
      <strong>${t("shipping", lang)}:</strong> ${order.shippingCost.toFixed(2)}<br/>
      <strong>${t("total", lang)}:</strong> ${order.total.toFixed(2)}
    </p>
  `;
  return layout(html);
}

export function orderCustomerHtml(order: IOrder, lang: Lang = "en") {
  const html = `
    <h2>${t("thankYou", lang)}, ${order.customer.name}!</h2>
    <p>${t("placedMsg", lang)}</p>
    <h3>${t("order", lang)} #${order._id}</h3>
    <p><strong>${t("date", lang)}:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
    ${itemsTable(order, lang)}
    <p style="text-align:right;margin-top:10px">
      <strong>${t("subtotal", lang)}:</strong> ${order.subtotal.toFixed(2)}<br/>
      <strong>${t("shipping", lang)}:</strong> ${order.shippingCost.toFixed(2)}<br/>
      <strong>${t("total", lang)}:</strong> ${order.total.toFixed(2)}
    </p>
    <p style="margin-top:20px">${t("contact", lang)}<br/>${t("regards", lang)},<br/>${branding().name}</p>
  `;
  return layout(html);
}

export function orderStatusCustomerHtml(order: IOrder, status: "placed"|"delivered"|"canceled"|"refunded", lang: Lang = "en") {
  const html = `
    <h2>${t("statusUpdate", lang)}</h2>
    <p>${t("order", lang)} #${order._id} ${t("now", lang)} <strong>${t(status, lang)}</strong>.</p>
    ${itemsTable(order, lang)}
    <p style="text-align:right;margin-top:10px">
      <strong>${t("total", lang)}:</strong> ${order.total.toFixed(2)}
    </p>
    <p style="margin-top:20px">${t("regards", lang)},<br/>${branding().name}</p>
  `;
  return layout(html);
}