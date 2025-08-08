# 🏪 Shop-Based Order Management System

## 🎯 **Overview**
Enhanced order system with shop-based filtering that allows different roles (Receptionist, Attendee, Storekeeper, Packager) to see only orders from their assigned shop.

## 📊 **Database Enhancement**

### **Added shopId to Order Model**
```prisma
model Order {
  id String @id @default(uuid())
  
  // ✅ NEW: Shop relation for order filtering
  shopId String?
  shop   Shop?   @relation(fields: [shopId], references: [id])
  
  // Existing user relations
  attendeeId String?
  attendee   User?   @relation("AttendedOrders", fields: [attendeeId], references: [id])
  
  receptionistId String?
  receptionist   User?   @relation("ReceivedOrders", fields: [receptionistId], references: [id])
  
  packagerId String?
  packager   User?   @relation("PackagedOrders", fields: [packagerId], references: [id])
  
  storekeeperId String?
  storekeeper   User?   @relation("StoredOrders", fields: [storekeeperId], references: [id])
  
  // Other order fields...
}
```

### **Added orders relation to Shop Model**
```prisma
model Shop {
  id          String  @id @default(uuid())
  name        String
  location    String
  
  users              User[]              // Users that belong to this shop
  productAssignments ProductAssignment[]
  orders             Order[]             // ✅ NEW: Orders from this shop
}
```

## 🔧 **Enhanced Order Creation**

### **Automatic Shop Assignment**
When creating an order, the system now automatically:

1. **Detects attendee's shop** from their user profile
2. **Assigns order to that shop** automatically
3. **Validates inventory** against shop-specific stock
4. **Updates shop inventory** when order is created

### **Enhanced Order Creation Flow**
```typescript
// 1. Get attendee's shop information
const attendee = await this.prisma.user.findUnique({
  where: { id: attendeeId },
  select: { shopId: true, shop: { select: { name: true } } }
});

// 2. Create order with shop assignment
const createdOrder = await this.prisma.order.create({
  data: {
    ...orderData,
    // ✅ NEW: Automatically assign to attendee's shop
    ...(attendeeShopId && { shop: { connect: { id: attendeeShopId } } }),
    // ... other relations
  }
});
```

## 📊 **Enhanced API Responses**

### **Order Creation Response (Enhanced)**
```json
{
  "id": "order-uuid",
  "customerName": "korede",
  "customerPhone": "08089828929",
  "status": "pending_payment",
  "paymentStatus": "pending",
  "totalAmount": 2000,
  "receiptId": "RCP-502972",
  
  // ✅ NEW: Shop information
  "shopId": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
  "shop": {
    "id": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
    "name": "lagos islands",
    "location": "Lagos"
  },
  
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
  ]
}
```

### **All Orders Response (Enhanced)**
```json
[
  {
    "id": "order-uuid",
    "customerName": "korede",
    "status": "pending_payment",
    
    // ✅ NEW: Shop information in all order responses
    "shop": {
      "id": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
      "name": "lagos islands",
      "location": "Lagos"
    },
    
    "attendee": {
      "id": "e6283738-a398-449a-ab6d-91a395592eb6",
      "fullName": "giggs raw",
      "role": "Attendee"
    },
    
    "OrderItem": [
      {
        "quantity": 2,
        "product": {
          "name": "light",
          "price": 1000
        }
      }
    ]
  }
]
```

## 🔍 **Role-Based Order Filtering**

### **Enhanced Role-Based Methods**

**1. Attendee Orders:**
```typescript
async getOrdersByAttendee(attendeeId: string) {
  const attendee = await this.prisma.user.findUnique({
    where: { id: attendeeId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: { 
      AND: [
        { attendeeId },
        ...(attendee?.shopId ? [{ shopId: attendee.shopId }] : [])
      ]
    },
    include: {
      shop: { select: { id: true, name: true, location: true } }
    }
  });
}
```

**2. Receptionist Orders:**
```typescript
async getOrdersByReceptionist(receptionistId: string) {
  const receptionist = await this.prisma.user.findUnique({
    where: { id: receptionistId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: { 
      AND: [
        { receptionistId },
        ...(receptionist?.shopId ? [{ shopId: receptionist.shopId }] : [])
      ]
    },
    include: {
      shop: { select: { id: true, name: true, location: true } }
    }
  });
}
```

**3. Storekeeper Orders:**
```typescript
async getOrdersByStorekeeper(storekeeperId: string) {
  const storekeeper = await this.prisma.user.findUnique({
    where: { id: storekeeperId },
    select: { shopId: true }
  });

  return this.prisma.order.findMany({
    where: {
      AND: [
        {
          status: {
            in: ['paid', 'assigned_packager', 'packaged', 'picked_up'],
          },
        },
        ...(storekeeper?.shopId ? [{ shopId: storekeeper.shopId }] : [])
      ]
    },
    include: {
      shop: { select: { id: true, name: true, location: true } }
    }
  });
}
```

## 🎯 **Benefits of Shop-Based Filtering**

### **1. Data Isolation**
- **Attendees** only see orders they've created from their shop
- **Receptionists** only see orders they've processed from their shop
- **Storekeepers** only see orders ready for fulfillment from their shop
- **Packagers** only see orders assigned to them from their shop

### **2. Improved Security**
- Prevents cross-shop data access
- Role-based access control with shop boundaries
- Clear data ownership and responsibility

### **3. Better User Experience**
- Relevant data only (no information overload)
- Shop-specific workflows
- Clear context for each user

### **4. Operational Efficiency**
- Shop managers can track their shop's performance
- Clear separation of responsibilities
- Better inventory management per shop

## 🚀 **Testing Shop-Based Orders**

### **Test 1: Create Order (Automatic Shop Assignment)**
```bash
curl -X POST "http://localhost:3001/orders" \
  -H "Authorization: Bearer <attendee_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "korede",
    "customerPhone": "08089828929",
    "products": [{"id": "02fdb645-3462-44f8-9b2c-640bdbb77508", "quantity": 2}],
    "status": "pending_payment",
    "attendeeId": "e6283738-a398-449a-ab6d-91a395592eb6",
    "paymentStatus": "pending",
    "totalAmount": 2000,
    "receiptId": "RCP-502972"
  }'
```

**Expected**: Order created with automatic shop assignment

### **Test 2: Get All Orders (Shop-Filtered)**
```bash
curl -X GET "http://localhost:3001/orders" \
  -H "Authorization: Bearer <attendee_token>"
```

**Expected**: Only orders from attendee's shop

### **Test 3: Admin View (All Orders)**
```bash
curl -X GET "http://localhost:3001/orders" \
  -H "Authorization: Bearer <admin_token>"
```

**Expected**: All orders from all shops with shop information

## ✅ **Status**

✅ **Database Schema**: Enhanced with shop relations
✅ **Order Creation**: Automatic shop assignment
✅ **Role-Based Filtering**: Shop-specific order access
✅ **API Responses**: Include shop information
✅ **Inventory Management**: Shop-level stock validation

**Orders are now properly filtered by shop for all user roles!** 🏪✨

---

*Enhancement completed: August 3, 2025*
*Status: ✅ SHOP-BASED ORDER MANAGEMENT ACTIVE*
*Next: Test order creation and role-based filtering*
