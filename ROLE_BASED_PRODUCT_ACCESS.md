# 🔐 Role-Based Product Access & Fixed Endpoints

## 🔧 **FIXED: Assign Product Endpoint**

### ❌ **Wrong URL (causing 404):**
```
POST /warehouse/assign-product
```

### ✅ **Correct URL:**
```
POST /warehouses/assign-product
```

**Note**: The endpoint is plural `warehouses`, not singular `warehouse`.

---

## 📦 **1. ASSIGN PRODUCT TO SHOP**

### **Endpoint**
```http
POST /warehouses/assign-product
Authorization: Bearer <token>
Content-Type: application/json
```

### **Required Permissions**
- `CEO`
- `Admin` 
- `WarehouseKeeper`

### **Request Body**
```typescript
interface AssignProductRequest {
  productId: string;     // UUID of product to assign
  shopId: string;        // UUID of shop receiving product
  warehouseId: string;   // UUID of warehouse assigning product
  quantity: number;      // Quantity to assign
  assignedBy: string;    // UUID of user making assignment
}
```

### **Sample Request**
```json
{
  "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shopId": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
  "warehouseId": "0bfea97b-f3e7-4ce7-ac88-c498fd45d988",
  "quantity": 25,
  "assignedBy": "1311b06f-2ae2-4641-a020-aed8d80c7a16"
}
```

### **Sample Response**
```json
{
  "id": "assignment-uuid-123",
  "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "shopId": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
  "warehouseId": "0bfea97b-f3e7-4ce7-ac88-c498fd45d988",
  "quantity": 25,
  "assignedBy": "1311b06f-2ae2-4641-a020-aed8d80c7a16",
  "assignedAt": "2025-08-03T10:30:00.000Z"
}
```

---

## 🏪 **2. GET PRODUCTS ASSIGNED TO SHOP (Role-Based)**

### **Endpoint**
```http
GET /warehouses/shop/:shopId/products
Authorization: Bearer <token>
```

### **Required Permissions**
- `CEO` - Can access any shop
- `Admin` - Can access any shop
- `Storekeeper` - Can access their assigned shop
- `Attendee` - Can access their assigned shop
- `Receptionist` - Can access their assigned shop
- `Packager` - Can access their assigned shop

### **Sample Request**
```http
GET /warehouses/shop/ec13ab43-8510-4aae-a2cf-6c3f42b3be36/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Sample Response**
```json
{
  "shop": {
    "id": "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
    "name": "Victoria Island Store",
    "location": "Victoria Island, Lagos",
    "isActive": true
  },
  "totalAssignments": 3,
  "assignments": [
    {
      "id": "assignment-uuid-1",
      "quantity": 25,
      "assignedAt": "2025-08-03T10:30:00.000Z",
      "product": {
        "id": "product-uuid-1",
        "name": "Samsung Galaxy S24",
        "description": "Latest flagship smartphone with advanced camera",
        "price": 850000,
        "totalStock": 50,
        "availableStock": 45,
        "image": "https://example.com/samsung-s24.jpg",
        "category": {
          "id": "category-uuid-1",
          "name": "Electronics",
          "description": "Electronic devices and gadgets"
        }
      },
      "warehouse": {
        "id": "warehouse-uuid-1",
        "name": "Main Warehouse",
        "location": "Lagos, Nigeria"
      },
      "assignedBy": {
        "id": "user-uuid-1",
        "username": "warehouse_manager",
        "fullName": "John Manager",
        "role": "WarehouseKeeper"
      }
    },
    {
      "id": "assignment-uuid-2",
      "quantity": 15,
      "assignedAt": "2025-08-03T09:15:00.000Z",
      "product": {
        "id": "product-uuid-2",
        "name": "MacBook Pro 16",
        "description": "High-performance laptop for professionals",
        "price": 1200000,
        "totalStock": 25,
        "availableStock": 20,
        "image": "https://example.com/macbook-pro.jpg",
        "category": {
          "id": "category-uuid-1",
          "name": "Electronics",
          "description": "Electronic devices and gadgets"
        }
      },
      "warehouse": {
        "id": "warehouse-uuid-1",
        "name": "Main Warehouse",
        "location": "Lagos, Nigeria"
      },
      "assignedBy": {
        "id": "user-uuid-1",
        "username": "warehouse_manager",
        "fullName": "John Manager",
        "role": "WarehouseKeeper"
      }
    }
  ]
}
```

---

## 🔧 **Frontend Implementation**

### **1. Assign Product to Shop**
```javascript
const assignProductToShop = async (assignmentData, token) => {
  try {
    const response = await fetch('/warehouses/assign-product', {  // ✅ Correct URL
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Assignment failed');
    }

    const result = await response.json();
    console.log('Product assigned successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to assign product:', error);
    throw error;
  }
};

// Usage
const assignment = await assignProductToShop({
  productId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  shopId: "ec13ab43-8510-4aae-a2cf-6c3f42b3be36",
  warehouseId: "0bfea97b-f3e7-4ce7-ac88-c498fd45d988",
  quantity: 25,
  assignedBy: "1311b06f-2ae2-4641-a020-aed8d80c7a16"
}, userToken);
```

### **2. Get Shop Products (Role-Based)**
```javascript
const getShopProducts = async (shopId, token) => {
  try {
    const response = await fetch(`/warehouses/shop/${shopId}/products`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch shop products');
    }

    const data = await response.json();
    console.log(`Found ${data.totalAssignments} products for ${data.shop.name}`);
    
    // Access assigned products
    data.assignments.forEach(assignment => {
      console.log(`- ${assignment.quantity}x ${assignment.product.name} (₦${assignment.product.price.toLocaleString()})`);
      console.log(`  From: ${assignment.warehouse.name}`);
      console.log(`  Assigned by: ${assignment.assignedBy.fullName}`);
    });

    return data;
  } catch (error) {
    console.error('Failed to fetch shop products:', error);
    throw error;
  }
};

// Usage for shop staff
const shopProducts = await getShopProducts('ec13ab43-8510-4aae-a2cf-6c3f42b3be36', userToken);
```

### **3. React Component for Shop Staff**
```jsx
import { useState, useEffect } from 'react';

const ShopProductsView = ({ userShopId, token }) => {
  const [shopData, setShopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopProducts = async () => {
      try {
        const response = await fetch(`/warehouses/shop/${userShopId}/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch shop products');
        }

        const data = await response.json();
        setShopData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userShopId) {
      fetchShopProducts();
    }
  }, [userShopId, token]);

  if (loading) return <div>Loading shop products...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!shopData) return <div>No shop data available</div>;

  return (
    <div className="shop-products">
      <h2>{shopData.shop.name} - Assigned Products</h2>
      <p><strong>Location:</strong> {shopData.shop.location}</p>
      <p><strong>Total Products:</strong> {shopData.totalAssignments}</p>

      <div className="products-grid">
        {shopData.assignments.map(assignment => (
          <div key={assignment.id} className="product-card">
            <img src={assignment.product.image} alt={assignment.product.name} />
            <h3>{assignment.product.name}</h3>
            <p>{assignment.product.description}</p>
            <p><strong>Category:</strong> {assignment.product.category.name}</p>
            <p><strong>Price:</strong> ₦{assignment.product.price.toLocaleString()}</p>
            <p><strong>Assigned Quantity:</strong> {assignment.quantity}</p>
            <p><strong>Stock:</strong> {assignment.product.availableStock}/{assignment.product.totalStock}</p>
            <p><strong>From:</strong> {assignment.warehouse.name}</p>
            <p><strong>Assigned by:</strong> {assignment.assignedBy.fullName}</p>
            <p><strong>Date:</strong> {new Date(assignment.assignedAt).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShopProductsView;
```

---

## 🎯 **Role-Based Access Summary**

### **Admin/CEO Access:**
- ✅ Can assign products to any shop
- ✅ Can view products for any shop
- ✅ Full warehouse management access

### **WarehouseKeeper Access:**
- ✅ Can assign products from their warehouse
- ✅ Can view warehouse inventory and assignments
- ✅ Can manage product distribution

### **Shop Staff Access (Storekeeper, Attendee, Receptionist, Packager):**
- ✅ Can view products assigned to their shop only
- ✅ Can see product details, quantities, and assignment history
- ✅ Cannot assign products or access other shops

### **Security Features:**
- ✅ JWT token authentication required
- ✅ Role-based authorization
- ✅ Shop-specific data filtering
- ✅ Comprehensive audit trail

---

## ✅ **Fixed Issues Summary**

1. **✅ Endpoint URL Fixed**: `/warehouse/assign-product` → `/warehouses/assign-product`
2. **✅ Role-Based Access**: Added shop-specific product endpoint
3. **✅ Comprehensive Data**: Full product, warehouse, and assignment details
4. **✅ Security**: Proper role-based permissions
5. **✅ Audit Trail**: Complete assignment history with user tracking

**Both issues are now completely resolved and production-ready!** 🚀
