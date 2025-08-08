# 🔍 Attendee Empty Array Debug Guide

## 🎯 **Current Status**
✅ **Authentication Working**: User can login successfully
✅ **API Response**: `{"status":true,"message":"Data fetched successfully","data":[]}`
❌ **Issue**: Attendee getting empty array instead of assigned products

## 🔍 **Debugging Steps**

### **Step 1: Check Server Logs**
When the attendee makes a request to `/products`, look for these debug logs:

```
DEBUG [ProductController] Controller received user data: {...}
DEBUG [ProductController] Extracted user ID: 19e70014-cea5-4705-99be-caf2f0b07317
LOG [ProductService] Fetching products for user ID: 19e70014-cea5-4705-99be-caf2f0b07317
DEBUG [ProductService] Found user: 19e70014-cea5-4705-99be-caf2f0b07317, role: Attendee, shopId: ?, shop: {...}
```

**Key Information to Look For:**
1. **User ID**: Should match the attendee user
2. **Role**: Should be "Attendee" 
3. **shopId**: Should NOT be null
4. **shop**: Should contain shop details

### **Step 2: Identify the Issue**

**Scenario A: User has no shop assignment**
```
DEBUG [ProductService] Found user: 19e70014-cea5-4705-99be-caf2f0b07317, role: Attendee, shopId: null, shop: null
WARN [ProductService] User 19e70014-cea5-4705-99be-caf2f0b07317 (Attendee) has no shop assignment
```
**Solution**: Assign the user to a shop in the database

**Scenario B: Shop has no product assignments**
```
DEBUG [ProductService] Found user: 19e70014-cea5-4705-99be-caf2f0b07317, role: Attendee, shopId: shop-uuid, shop: {"id":"shop-uuid","name":"lagos islands","location":"Lagos"}
DEBUG [ProductService] Found 0 product assignments for shop shop-uuid
WARN [ProductService] No product assignments found for shop shop-uuid (lagos islands)
```
**Solution**: Assign products to the shop

**Scenario C: SQL Query Issue**
```
DEBUG [ProductService] Found 5 product assignments for shop shop-uuid
DEBUG [ProductService] Shop products query returned 0 products for shop shop-uuid
```
**Solution**: Check SQL query or data integrity

---

## 🛠️ **Database Checks**

### **Check 1: Verify User's Shop Assignment**
```sql
SELECT 
  u.id,
  u.username,
  u.role,
  u."shopId",
  s.name as shop_name,
  s.location as shop_location
FROM "User" u
LEFT JOIN "Shop" s ON u."shopId" = s.id
WHERE u.id = '19e70014-cea5-4705-99be-caf2f0b07317';
```

**Expected Result:**
```
id                                   | username | role     | shopId    | shop_name     | shop_location
19e70014-cea5-4705-99be-caf2f0b07317 | attendee | Attendee | shop-uuid | lagos islands | Lagos
```

**If shopId is NULL**: User needs to be assigned to a shop

### **Check 2: Verify Shop Exists**
```sql
SELECT * FROM "Shop" WHERE name = 'lagos islands';
```

**Expected Result:**
```
id        | name          | location | isActive | managerId
shop-uuid | lagos islands | Lagos    | true     | manager-uuid
```

### **Check 3: Check Product Assignments for the Shop**
```sql
SELECT 
  pa.id,
  pa.quantity,
  pa."assignedAt",
  p.name as product_name,
  s.name as shop_name,
  w.name as warehouse_name
FROM "ProductAssignment" pa
JOIN "Product" p ON pa."productId" = p.id
JOIN "Shop" s ON pa."shopId" = s.id
LEFT JOIN "Warehouse" w ON pa."warehouseId" = w.id
WHERE s.name = 'lagos islands';
```

**Expected Result:**
```
id           | quantity | assignedAt | product_name      | shop_name     | warehouse_name
assignment-1 | 15       | 2025-08-03 | Samsung Galaxy S24| lagos islands | Main Warehouse
assignment-2 | 10       | 2025-08-03 | MacBook Pro 16    | lagos islands | Main Warehouse
```

**If empty**: No products assigned to this shop

---

## 🔧 **Solutions Based on Findings**

### **Solution 1: Assign User to Shop**
```sql
-- Find the shop ID for "lagos islands"
SELECT id FROM "Shop" WHERE name = 'lagos islands';

-- Update user's shopId
UPDATE "User" 
SET "shopId" = 'shop-uuid-from-above'
WHERE id = '19e70014-cea5-4705-99be-caf2f0b07317';
```

### **Solution 2: Create Product Assignments**
```sql
-- First, get some product IDs
SELECT id, name FROM "Product" LIMIT 3;

-- Get the shop ID
SELECT id FROM "Shop" WHERE name = 'lagos islands';

-- Get a warehouse ID
SELECT id FROM "Warehouse" LIMIT 1;

-- Create product assignments
INSERT INTO "ProductAssignment" ("productId", "shopId", "warehouseId", "assignedBy", "quantity")
VALUES 
  ('product-id-1', 'shop-id', 'warehouse-id', 'admin-user-id', 15),
  ('product-id-2', 'shop-id', 'warehouse-id', 'admin-user-id', 10),
  ('product-id-3', 'shop-id', 'warehouse-id', 'admin-user-id', 20);
```

### **Solution 3: Use the Assign Product Endpoint**
```bash
curl -X POST "http://localhost:3001/warehouses/assign-product" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-uuid",
    "shopId": "shop-uuid-for-lagos-islands",
    "warehouseId": "warehouse-uuid",
    "quantity": 15,
    "assignedBy": "admin-user-id"
  }'
```

---

## 🧪 **Quick Test Commands**

### **Test 1: Check User Data**
```bash
# Make request and check logs
curl -X GET "http://localhost:3001/products" \
  -H "Authorization: Bearer <attendee_token>"

# Look for these logs:
# DEBUG [ProductService] Found user: ..., shopId: ?, shop: {...}
```

### **Test 2: Test with Admin User**
```bash
# Admin should get all products
curl -X GET "http://localhost:3001/products" \
  -H "Authorization: Bearer <admin_token>"

# Should return all products in system
```

### **Test 3: Check Shop Assignment Endpoint**
```bash
# Try the shop-specific endpoint
curl -X GET "http://localhost:3001/warehouses/shop/<shop-id>/products" \
  -H "Authorization: Bearer <attendee_token>"
```

---

## 📊 **Expected Debug Output**

### **Successful Case:**
```
DEBUG [ProductService] Found user: 19e70014-cea5-4705-99be-caf2f0b07317, role: Attendee, shopId: shop-uuid, shop: {"id":"shop-uuid","name":"lagos islands","location":"Lagos"}
DEBUG [ProductService] Fetching products assigned to shop: lagos islands (shop-uuid) for user: 19e70014-cea5-4705-99be-caf2f0b07317
DEBUG [ProductService] Found 3 product assignments for shop shop-uuid
DEBUG [ProductService] Shop products query returned 3 products for shop shop-uuid
```

### **Problem Cases:**
```
# No shop assignment
WARN [ProductService] User 19e70014-cea5-4705-99be-caf2f0b07317 (Attendee) has no shop assignment

# No product assignments
WARN [ProductService] No product assignments found for shop shop-uuid (lagos islands)

# SQL query issue
DEBUG [ProductService] Found 3 product assignments for shop shop-uuid
DEBUG [ProductService] Shop products query returned 0 products for shop shop-uuid
```

---

## 🎯 **Next Steps**

1. **Check the server logs** when attendee makes request
2. **Run the database queries** to verify data
3. **Apply the appropriate solution** based on findings
4. **Test again** with the attendee user

**Most likely issue**: The attendee user either has no shop assignment or the shop has no product assignments.

Let me know what you find in the logs and database queries! 🔍
