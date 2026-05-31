# Salesek API Reference

Base URL (production): `https://serelmejor.onrender.com`

All protected endpoints require the header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication

### POST /register
Register a new user and business.

**Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "business_name": "string",
  "plan": "salesflow | stockflow | suite"
}
```

**Response:** `201`
```json
{ "message": "Registered. Check your email for the verification code." }
```

---

### POST /login
Log in and obtain a JWT token.

**Body:**
```json
{ "email": "string", "password": "string" }
```

**Response:** `200`
```json
{ "token": "eyJ...", "user": { "id": 1, "name": "...", "role": "owner", "business_id": 1, "email_verified": true } }
```

---

### GET /me
Get the authenticated user's profile. **Requires auth.**

**Response:** `200`
```json
{ "id": 1, "name": "...", "email": "...", "role": "owner", "business_id": 1 }
```

---

### POST /logout
Log out (client should discard the token).

**Response:** `200`
```json
{ "message": "Logged out" }
```

---

### POST /verify-email
Verify email address with the 6-digit code.

**Body:**
```json
{ "email": "string", "code": "123456" }
```

**Response:** `200`
```json
{ "message": "Email verified" }
```

---

### POST /resend-code
Resend the email verification code.

**Body:**
```json
{ "email": "string" }
```

---

### POST /forgot-password
Request a password reset code.

**Body:**
```json
{ "email": "string" }
```

---

### POST /verify-reset-code
Verify the password reset code.

**Body:**
```json
{ "email": "string", "code": "123456" }
```

---

### POST /reset-password
Set a new password after code verification.

**Body:**
```json
{ "email": "string", "code": "123456", "password": "newpassword" }
```

---

### POST /cancel-subscription
Cancel the active subscription. **Requires auth (owner/admin).**

**Response:** `200`
```json
{ "message": "Subscription cancelled" }
```

---

## Business

### GET /business
Get the current business data. **Requires auth.**

**Response:** `200`
```json
{ "id": 1, "name": "My Shop", "sector": "retail", "subscription_plan": "suite" }
```

---

### PUT /business
Update business data. **Requires auth (owner/admin).**

**Body:**
```json
{ "name": "string", "sector": "string" }
```

---

### GET /business/stats
Get business statistics (lead counts, revenue, stock alerts). **Requires auth.**

---

### PUT /business/subscription
Update the subscription plan. **Requires auth (owner/admin).**

**Body:**
```json
{ "plan": "salesflow | stockflow | suite" }
```

---

## Team

### GET /team
Get all team members. **Requires auth (owner/admin).**

**Response:** `200`
```json
[{ "id": 1, "name": "...", "email": "...", "role": "employee" }]
```

---

### POST /team/invite
Invite a new team member. **Requires auth (owner/admin).**

**Body:**
```json
{ "email": "string", "role": "employee | supplier" }
```

---

### PUT /team/{id}/role
Update a team member's role. **Requires auth (owner/admin).**

**Body:**
```json
{ "role": "employee | supplier | owner" }
```

---

### DELETE /team/{id}
Remove a team member. **Requires auth (owner/admin).**

---

## Leads (SalesFlow CRM)

### GET /leads
Get all leads for the business. **Requires auth.**

**Response:** `200`
```json
[{
  "id": 1,
  "client_name": "Acme Corp",
  "email": "contact@acme.com",
  "phone": "+34600000000",
  "status": "new | contacted | qualified | proposal | negotiation | won | lost",
  "close_probability": 70,
  "product_id": 2,
  "quantity": 5,
  "created_at": "2025-01-01T00:00:00"
}]
```

---

### POST /leads
Create a new lead. **Requires auth.**

**Body:**
```json
{
  "client_name": "string",
  "email": "string",
  "phone": "string",
  "inquiry_text": "string",
  "product_id": 1,
  "quantity": 5
}
```

---

### GET /leads/stats
Get CRM pipeline statistics. **Requires auth.**

---

### GET /leads/{id}
Get a single lead. **Requires auth.**

---

### PUT /leads/{id}
Update lead data. **Requires auth.**

---

### DELETE /leads/{id}
Delete a lead. **Requires auth (owner/admin).**

---

### PUT /leads/{id}/status
Update lead status. **Requires auth.**

When status is set to `won`, **The Bridge** triggers automatically:
- Deducts `quantity` from `product_id` stock
- If stock < min_stock, creates a purchase order and emails the supplier

**Body:**
```json
{ "status": "won | lost | negotiation | ..." }
```

---

### GET /leads/{id}/messages
Get all messages for a lead. **Requires auth.**

---

### POST /leads/{id}/messages
Add a message to a lead. **Requires auth.**

**Body:**
```json
{ "content": "string", "sent_by": "string", "ai_generated": false }
```

---

### PUT /leads/{id}/messages/{msg_id}
Update a message. **Requires auth.**

---

### DELETE /leads/{id}/messages/{msg_id}
Delete a message. **Requires auth.**

---

### GET /leads/{id}/followups
Get follow-ups for a lead. **Requires auth.**

---

### POST /leads/{id}/followups
Create a follow-up. **Requires auth.**

**Body:**
```json
{ "scheduled_at": "2025-06-01T10:00:00", "outcome": "string" }
```

---

### PUT /leads/{id}/followups/{fu_id}
Update a follow-up. **Requires auth.**

---

## AI

### POST /ai/draft-response
Generate an AI response draft for a lead conversation. **Requires auth.**

**Body:**
```json
{ "lead_id": 1, "context": "string" }
```

**Response:** `200`
```json
{ "draft": "Dear customer, thank you for your inquiry..." }
```

---

### POST /ai/suggest-order
Generate an AI-suggested order quantity. **Requires auth.**

**Body:**
```json
{ "product_id": 1 }
```

**Response:** `200`
```json
{ "suggestion": "Based on your sales history, we recommend ordering 50 units." }
```

---

## Products (StockFlow)

### GET /products
Get all products. **Requires auth.**

**Response:** `200`
```json
[{
  "id": 1,
  "name": "Widget A",
  "category": "electronics",
  "current_stock": 12,
  "min_stock": 5,
  "price": 29.99,
  "supplier_id": 1
}]
```

---

### POST /products
Create a new product. **Requires auth.**

**Body:**
```json
{
  "name": "string",
  "category": "string",
  "current_stock": 0,
  "min_stock": 5,
  "price": 29.99,
  "supplier_id": 1
}
```

---

### GET /products/low-stock
Get products with stock below minimum. **Requires auth.**

---

### GET /products/{id}
Get a single product. **Requires auth.**

---

### PUT /products/{id}
Update a product. **Requires auth.**

---

### DELETE /products/{id}
Delete a product. **Requires auth (owner/admin).**

---

### POST /products/{id}/sale
Record a sale (deducts from stock). **Requires auth.**

**Body:**
```json
{ "quantity": 3, "note": "string" }
```

---

### POST /products/{id}/restock
Record a restock (adds to stock). **Requires auth.**

**Body:**
```json
{ "quantity": 50, "note": "string" }
```

---

### GET /products/{id}/movements
Get stock movement history. **Requires auth.**

---

## Suppliers

### GET /suppliers
Get all suppliers. **Requires auth.**

---

### POST /suppliers
Create a new supplier. **Requires auth (owner/admin).**

**Body:**
```json
{ "name": "string", "email": "string", "contact_name": "string" }
```

---

### GET /suppliers/{id}
Get a single supplier. **Requires auth.**

---

### PUT /suppliers/{id}
Update a supplier. **Requires auth (owner/admin).**

---

### DELETE /suppliers/{id}
Delete a supplier. **Requires auth (owner/admin).**

---

### GET /suppliers/{id}/orders
Get all purchase orders for a supplier. **Requires auth.**

---

## Purchase Orders

### GET /orders
Get all purchase orders. **Requires auth.**

**Response:** `200`
```json
[{
  "id": 1,
  "supplier_id": 1,
  "product_id": 2,
  "quantity": 50,
  "status": "pending | sent | confirmed | delivered",
  "created_at": "2025-01-01T00:00:00",
  "note": "Auto-generated by The Bridge"
}]
```

---

### POST /orders
Create a manual purchase order. **Requires auth.**

**Body:**
```json
{ "supplier_id": 1, "product_id": 2, "quantity": 50, "note": "string" }
```

---

### GET /orders/{id}
Get a single purchase order. **Requires auth.**

---

### PUT /orders/{id}
Update a purchase order. **Requires auth.**

---

### DELETE /orders/{id}
Delete a purchase order. **Requires auth (owner/admin).**

---

### POST /orders/{id}/send
Send the purchase order to the supplier via email (SendGrid). **Requires auth.**

Changes status from `pending` to `sent`.

---

### PUT /orders/{id}/confirm
Confirm receipt of a purchase order. **Requires auth.**

Changes status from `sent` to `confirmed`.

---

### PUT /orders/{id}/deliver
Mark a purchase order as delivered. **Requires auth.**

Changes status from `confirmed` to `delivered`. Adds the quantity to product stock.

---

## Notifications

### GET /notifications
Get all notifications for the authenticated user. **Requires auth.**

**Response:** `200`
```json
[{ "id": 1, "type": "low_stock", "message": "Widget A is running low", "read": false, "created_at": "..." }]
```

---

### PUT /notifications/read-all
Mark all notifications as read. **Requires auth.**

---

### PUT /notifications/{id}/read
Mark a single notification as read. **Requires auth.**

---

### DELETE /notifications/{id}
Delete a notification. **Requires auth.**

---

## Contact (Public)

### POST /contact
Submit a contact form message (no auth required).

**Body:**
```json
{ "name": "string", "email": "string", "company": "string", "message": "string" }
```

**Response:** `201`
```json
{ "message": "Message received" }
```

---

## Admin

> All admin endpoints require `role: admin`.

### GET /admin/stats
Get global platform statistics (total businesses, users, revenue).

---

### GET /admin/businesses
List all businesses on the platform.

---

### GET /admin/users
List all users on the platform.

---

### GET /admin/businesses/{id}
Get details of a specific business.

---

### DELETE /admin/businesses/{id}
Delete a business and all its data (CASCADE).

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request (missing or invalid fields) |
| 401 | Unauthorized (missing or invalid JWT) |
| 403 | Forbidden (insufficient role permissions) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Authentication Flow

```
1. POST /register → receive verification email
2. POST /verify-email → account activated
3. POST /login → receive JWT token
4. Include in all requests: Authorization: Bearer <token>
5. Token expires after 24 hours → POST /login again
```

## The Bridge Automation

When `PUT /leads/{id}/status` is called with `status: "won"`:

1. BridgeService checks if lead has `product_id` and `quantity`
2. Deducts `quantity` from `products.current_stock` (atomic transaction)
3. If `current_stock < min_stock`:
   - Creates a `purchase_orders` record with status `pending`
   - If product has `supplier_id` with email: sends purchase order email via SendGrid
4. Creates a notification for the business owner
