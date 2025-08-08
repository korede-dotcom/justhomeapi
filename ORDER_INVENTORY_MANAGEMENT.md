# 🛒 Order Creation with Shop Inventory Management

## 🎯 **Overview**
Enhanced order creation that properly validates shop inventory and automatically decrements available quantities while incrementing sold quantities.

## 🔧 **Enhanced Order Creation**

### **API Endpoint**
```http
POST /orders
Authorization: Bearer <token>
Content-Type: application/json
```

### **Your Request Data (Fixed)**
```json
{
  "customerName": "korede",
  "customerPhone": "08089828929",
  "products": [
    {
      "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
      "name": "light",
      "quantity": 2  // ✅ FIXED: Reduced from 3 to 2 (available quantity)
    }
  ],
  "status": "pending_payment",
  "attendee": "giggs raw - Attendee",
  "attendeeId": "e6283738-a398-449a-ab6d-91a395592eb6",
  "paymentStatus": "pending",
  "totalAmount": 2000,  // ✅ FIXED: Updated total (2 × 1000)
  "receiptId": "RCP-502972"
}
```

## 📊 **Inventory Validation & Updates**

### **Before Order Creation**
```
Product: light
Shop Available Quantity: 2
Shop Sold Quantity: 0
Requested Quantity: 2 ✅ (Valid - within available)
```

### **After Order Creation**
```
Product: light
Shop Available Quantity: 0 (2 - 2)
Shop Sold Quantity: 2 (0 + 2)
Total Assigned: 2 (unchanged)
```

## 🔍 **Validation Logic**

### **1. Shop Assignment Check**
```typescript
// Verify attendee belongs to a shop
const attendee = await this.prisma.user.findUnique({
  where: { id: attendeeId },
  select: { shopId: true, shop: { select: { name: true } } }
});

if (!attendee?.shopId) {
  throw new BadRequestException('Attendee is not assigned to any shop');
}
```

### **2. Product Assignment Check**
```typescript
// Verify product is assigned to the shop
const assignment = await this.prisma.productAssignment.findFirst({
  where: {
    productId: product.id,
    shopId: attendeeShopId
  }
});

if (!assignment) {
  throw new BadRequestException(
    `Product "${product.name}" is not assigned to this shop`
  );
}
```

### **3. Inventory Availability Check**
```typescript
// Verify sufficient stock
if (assignment.availableQuantity < requestedQuantity) {
  throw new BadRequestException(
    `Insufficient stock for "${product.name}". Available: ${assignment.availableQuantity}, Requested: ${requestedQuantity}`
  );
}
```

### **4. Inventory Update**
```typescript
// Update shop inventory after order creation
await this.prisma.productAssignment.update({
  where: { id: assignment.id },
  data: {
    availableQuantity: { decrement: soldQuantity },
    soldQuantity: { increment: soldQuantity }
  }
});
```

## ✅ **Success Response**
```json
{
  "id": "order-uuid",
  "customerName": "korede",
  "customerPhone": "08089828929",
  "status": "pending_payment",
  "paymentStatus": "pending",
  "totalAmount": 2000,
  "receiptId": "RCP-502972",
  "attendeeId": "e6283738-a398-449a-ab6d-91a395592eb6",
  "OrderItem": [
    {
      "id": "order-item-uuid",
      "quantity": 2,
      "product": {
        "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
        "name": "light",
        "price": 1000
      }
    }
  ],
  "products": [
    {
      "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
      "name": "light"
    }
  ]
}
```

## ❌ **Error Responses**

### **1. Insufficient Stock**
```json
{
  "statusCode": 400,
  "message": "Insufficient stock for \"light\". Available: 2, Requested: 3",
  "error": "Bad Request"
}
```

### **2. Product Not Assigned to Shop**
```json
{
  "statusCode": 400,
  "message": "Product \"light\" is not assigned to this shop",
  "error": "Bad Request"
}
```

### **3. Attendee Not Assigned to Shop**
```json
{
  "statusCode": 400,
  "message": "Attendee is not assigned to any shop",
  "error": "Bad Request"
}
```

## 🔄 **Complete Order Flow**

### **Step 1: Validate Request**
- Check attendee has shop assignment
- Verify all products are assigned to the shop
- Validate sufficient inventory for each product

### **Step 2: Create Order**
- Create order record with all relationships
- Create order items with quantities
- Connect products to order

### **Step 3: Update Inventory**
- Decrement `availableQuantity` for each product
- Increment `soldQuantity` for each product
- Log inventory changes

### **Step 4: Return Response**
- Return complete order with items and products
- Include all user relationships

## 🧪 **Testing the Enhanced Order Creation**

### **Test 1: Valid Order (Within Stock)**
```bash
curl -X POST "http://localhost:3001/orders" \
  -H "Authorization: Bearer <attendee_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "korede",
    "customerPhone": "08089828929",
    "products": [
      {
        "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
        "quantity": 2
      }
    ],
    "status": "pending_payment",
    "attendeeId": "e6283738-a398-449a-ab6d-91a395592eb6",
    "paymentStatus": "pending",
    "totalAmount": 2000,
    "receiptId": "RCP-502972"
  }'
```

**Expected**: Order created successfully, inventory decremented

### **Test 2: Insufficient Stock**
```bash
curl -X POST "http://localhost:3001/orders" \
  -H "Authorization: Bearer <attendee_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "korede",
    "customerPhone": "08089828929",
    "products": [
      {
        "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
        "quantity": 5
      }
    ],
    "attendeeId": "e6283738-a398-449a-ab6d-91a395592eb6",
    "totalAmount": 5000
  }'
```

**Expected**: 400 error with insufficient stock message

## 📊 **Inventory Tracking After Order**

### **Check Updated Inventory**
```bash
curl -X GET "http://localhost:3001/products" \
  -H "Authorization: Bearer <attendee_token>"
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": "02fdb645-3462-44f8-9b2c-640bdbb77508",
      "name": "light",
      "assignedQuantity": 2,
      "shopAvailableQuantity": 0,  // ✅ Decremented from 2 to 0
      "shopSoldQuantity": 2        // ✅ Incremented from 0 to 2
    }
  ]
}
```

## ✅ **Benefits**

### **1. Accurate Inventory Management**
- Real-time inventory updates
- Prevents overselling
- Maintains data consistency

### **2. Shop-Level Control**
- Validates shop assignments
- Enforces shop-specific inventory
- Proper role-based access

### **3. Error Prevention**
- Comprehensive validation
- Clear error messages
- Graceful failure handling

### **4. Audit Trail**
- Tracks inventory changes
- Logs order creation details
- Maintains transaction history

## 🎯 **Status**

✅ **Order Creation**: Enhanced with inventory validation
✅ **Inventory Updates**: Automatic decrement/increment
✅ **Error Handling**: Comprehensive validation
✅ **Shop Integration**: Proper shop-level inventory management

**Order creation now properly manages shop inventory and prevents overselling!** 🛒✨

---

*Enhancement completed: August 3, 2025*
*Status: ✅ ORDER INVENTORY MANAGEMENT ACTIVE*
*Next: Test order creation with your data*
