# 👥 Role-Based Packager Filtering

## 🎯 **Overview**
Enhanced packager endpoint with role-based access control. Only Admin and CEO can fetch all packagers, while other roles see only packagers from their own shop.

## 🔧 **Implementation**

### **Updated Endpoint**
```typescript
@Get("/packager")
getAllPackager(@Request() req: any) {
  const userId = req.user?.userId || req.user?.id || req.user;
  return this.userService.findAllPackager(userId);
}
```

### **Enhanced Service Logic**
```typescript
async findAllPackager(userId?: string) {
  // Get requesting user's role and shop
  const requestingUser = await this.prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, shopId: true }
  });

  // Admin and CEO see all packagers
  if (requestingUser.role === 'Admin' || requestingUser.role === 'CEO') {
    return this.prisma.user.findMany({
      where: { role: 'Packager' },
      // ... all packagers
    });
  }

  // Other roles see only packagers from their shop
  return this.prisma.user.findMany({
    where: { 
      role: 'Packager',
      shopId: requestingUser.shopId
    },
    // ... shop-specific packagers
  });
}
```

## 📊 **Access Control Matrix**

| User Role | Access Level | What They See |
|-----------|-------------|---------------|
| **Admin** | All Shops | All packagers from all shops |
| **CEO** | All Shops | All packagers from all shops |
| **Storekeeper** | Own Shop Only | Packagers from their assigned shop |
| **Attendee** | Own Shop Only | Packagers from their assigned shop |
| **Receptionist** | Own Shop Only | Packagers from their assigned shop |
| **WarehouseKeeper** | Own Shop Only | Packagers from their assigned shop |

## 🧪 **Testing Examples**

### **Test 1: Admin User (Sees All Packagers)**
```bash
curl -X GET "http://localhost:3000/users/packager" \
  -H "Authorization: Bearer <admin_token>"
```

**Expected Response:**
```json
[
  {
    "id": "packager-1",
    "fullName": "John Packager",
    "username": "packager1",
    "email": "packager1@example.com",
    "role": "Packager",
    "shopId": "shop-lagos-islands",
    "shop": {
      "name": "Lagos Islands",
      "location": "Lagos"
    }
  },
  {
    "id": "packager-2", 
    "fullName": "Jane Packager",
    "username": "packager2",
    "email": "packager2@example.com",
    "role": "Packager",
    "shopId": "shop-victoria-island",
    "shop": {
      "name": "Victoria Island",
      "location": "Lagos"
    }
  }
  // All packagers from all shops
]
```

### **Test 2: Shop Staff (Sees Only Own Shop Packagers)**
```bash
curl -X GET "http://localhost:3000/users/packager" \
  -H "Authorization: Bearer <storekeeper_token_from_lagos_islands>"
```

**Expected Response:**
```json
[
  {
    "id": "packager-1",
    "fullName": "John Packager", 
    "username": "packager1",
    "email": "packager1@example.com",
    "role": "Packager",
    "shopId": "shop-lagos-islands",
    "shop": {
      "name": "Lagos Islands",
      "location": "Lagos"
    }
  }
  // Only packagers from Lagos Islands shop
]
```

### **Test 3: Different Shop Staff**
```bash
curl -X GET "http://localhost:3000/users/packager" \
  -H "Authorization: Bearer <attendee_token_from_victoria_island>"
```

**Expected Response:**
```json
[
  {
    "id": "packager-2",
    "fullName": "Jane Packager",
    "username": "packager2", 
    "email": "packager2@example.com",
    "role": "Packager",
    "shopId": "shop-victoria-island",
    "shop": {
      "name": "Victoria Island",
      "location": "Lagos"
    }
  }
  // Only packagers from Victoria Island shop
]
```

## 🔍 **Debug Logging**

### **Enhanced Logging for Troubleshooting**
```typescript
this.logger.debug(`Fetching packagers for user role: ${requestingUser.role}, shopId: ${requestingUser.shopId}`);

// For Admin/CEO
this.logger.debug('Admin/CEO user - returning all packagers');

// For shop staff
this.logger.debug(`Returning packagers for shop: ${requestingUser.shopId}`);

// For users without shop assignment
this.logger.warn(`User ${userId} has no shop assignment`);
```

**Sample Debug Output:**
```
DEBUG [UserService] Fetching packagers for user role: Storekeeper, shopId: shop-lagos-islands
DEBUG [UserService] Returning packagers for shop: shop-lagos-islands
```

## 🎯 **Business Logic**

### **Role-Based Access Rules**

**✅ Admin & CEO Access:**
- Can see all packagers from all shops
- Useful for system-wide management
- Complete visibility across organization

**✅ Shop Staff Access:**
- Can only see packagers from their assigned shop
- Maintains data isolation between shops
- Relevant packagers for their operations

**✅ No Shop Assignment:**
- Users without shop assignment get empty array
- Prevents unauthorized access
- Clear logging for troubleshooting

### **Enhanced Response Data**
```json
{
  "id": "packager-id",
  "fullName": "Packager Name",
  "username": "username",
  "email": "email@example.com", 
  "role": "Packager",
  "shopId": "shop-id",           // ✅ NEW: Shop assignment
  "shop": {                      // ✅ NEW: Shop details
    "name": "Shop Name",
    "location": "Shop Location"
  }
}
```

## 🔄 **Use Cases**

### **Use Case 1: Order Assignment**
```
Storekeeper needs to assign packager to order
→ GET /users/packager (with storekeeper token)
→ Returns only packagers from same shop
→ Storekeeper assigns appropriate packager
```

### **Use Case 2: Admin Management**
```
Admin needs to see all packagers for reporting
→ GET /users/packager (with admin token)  
→ Returns all packagers from all shops
→ Admin can generate system-wide reports
```

### **Use Case 3: Shop Operations**
```
Attendee needs to check available packagers
→ GET /users/packager (with attendee token)
→ Returns only packagers from their shop
→ Attendee can coordinate with relevant packagers
```

## ✅ **Benefits**

### **1. Data Security**
- ✅ Shop-level data isolation
- ✅ Role-based access control
- ✅ Prevents cross-shop data leakage

### **2. Operational Efficiency**
- ✅ Users see only relevant packagers
- ✅ Reduces information overload
- ✅ Faster decision making

### **3. System Administration**
- ✅ Admin/CEO maintain full visibility
- ✅ Centralized management capabilities
- ✅ Complete system oversight

### **4. Compliance & Audit**
- ✅ Clear access control boundaries
- ✅ Audit trail for data access
- ✅ Role-based permissions

## 🚨 **Error Handling**

### **Invalid User**
```json
{
  "statusCode": 400,
  "message": "User not found",
  "error": "Bad Request"
}
```

### **No Shop Assignment**
```json
[]  // Empty array with warning log
```

### **Authentication Required**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

## ✅ **Status**

✅ **Role-Based Filtering**: Admin/CEO see all, others see shop-specific
✅ **Enhanced Response**: Includes shop information
✅ **Debug Logging**: Clear troubleshooting information
✅ **Error Handling**: Proper validation and responses
✅ **Backward Compatibility**: Maintains existing functionality

**The packager endpoint now properly enforces role-based access control!** 👥✨

---

*Implementation completed: August 4, 2025*
*Status: ✅ ROLE-BASED PACKAGER FILTERING ACTIVE*
*Next: Test with different user roles to verify access control*
