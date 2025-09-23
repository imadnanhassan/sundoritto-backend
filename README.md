# Sundoritto Backend

Express + TypeScript + Mongoose eCommerce backend.

## Features

- Auth (JWT), Users (Admin, Customer)
- Category, Brand, Product (with uploads via Cloudinary)
- Product SKU for POS, Flash Deals, Offer Types
- Voucher balance (requires free shipping, not a discount)
- Search, Pagination, Filtering (generic DB query helper)
- Orders (COD), Checkout with shipping rules
- Inventory Movements (IN/OUT) on order actions
- Analytics (weekly/monthly/yearly): users, orders, sales
- PDFs:
  - Order Invoice (download and email attachment)
  - System Report PDF
- Notifications (DB) on: new customer, new order, canceled, refunded
- Email notifications (Nodemailer):
  - Admin: new customer, new order, canceled, refunded
  - Customer: order confirmation (with PDF invoice), status updates
- Admin Seeder

## Requirements

- Node.js 18+
- MongoDB (MONGODB_URI)
- Cloudinary account (for file uploads)
- SMTP credentials (for NodeMailer)

## Setup

1. Install dependencies

```bash
pnpm install
```

2. Environment variables (.env)

```
# Database
MONGODB_URI=mongodb://localhost:27017/sundoritto

# JWT, etc. (add your existing variables)
NODE_ENV=development
bcrypt_salt_rounds=10

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your-app-password
MAIL_FROM="Sundoritto <no-reply@sundoritto.com>"
ADMIN_EMAIL=admin@example.com

# Branding (optional)
BRAND_NAME=Sundoritto
BRAND_LOGO_URL=https://your-cdn/logo.png
BRAND_PRIMARY_COLOR=#4F46E5

# Localization
DEFAULT_LANG=en # or bn
```

3. Run dev server

```bash
pnpm dev
```

4. Seed Admin

```bash
pnpm run seed:admin
```

Seeds an admin:
- Email: dev.adnanhassan@gmail.com
- Password: constPassword(38)
- Name: Adnan Hassan

## File Uploads (Cloudinary)

- Config: src/config/cloudinary.config.ts, src/config/multer.config.ts
- Usage patterns:
  - Category: banner, icon
  - Brand: logo
  - Product: thumbnail (single), gallery (multiple)
- Client must send multipart/form-data with:
  - Files in fields
  - JSON payload in field "data" (stringified)
- parseBody middleware parses req.body.data into req.body JSON

Example cURL for Product:

```bash
curl -X POST http://localhost:3000/product \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -F "thumbnail=@/path/to/thumb.jpg" \
  -F "gallery=@/path/to/img1.jpg" \
  -F "gallery=@/path/to/img2.jpg" \
  -F 'data={
    "name": "Test Product",
    "sku": "SKU-001",
    "category": "<categoryId>",
    "brand": "<brandId>",
    "price": 1200
  }'
```

## Nodemailer Setup

- Config: src/config/mailer.ts
- Email templates: src/utils/emailTemplates.ts (supports en/bn and branding)
- PDF: src/utils/pdf.ts (order invoice and system report)

Emails sent:
- Admin:
  - New order
  - Order canceled
  - Order refunded
  - New customer
- Customer:
  - Order placed (HTML + PDF invoice attachment)
  - Status updates: placed, delivered, canceled, refunded

Ensure SMTP is allowed (use App Passwords for Gmail or a dedicated provider like SendGrid/Mailgun).

## API Highlights

- Auth: /auth
- Users: /user
- Categories: /category
- Brands: /brand
- Products: /product
  - GET /product?searchTerm=...&page=1&limit=20
  - GET /product/flash-deals/active
  - GET /product/offers/:type
  - PATCH /product/:id/stock
- Orders: /order
  - POST /order/checkout
  - GET /order/:id/invoice (PDF)
- Inventory (admin): /inventory
- Analytics (admin): /analytics/summary, /analytics/report.pdf
- Notifications (admin): /notifications

## Development

- Build: pnpm build
- Start: pnpm start

## Notes

- Voucher balance doesn’t discount price; it enforces free shipping products at checkout.
- Ensure DEFAULT_LANG and branding vars are set to localize and style emails.
- For production, configure CORS, rate limiting, and environment-specific SMTP.