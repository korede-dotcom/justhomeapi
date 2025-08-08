# 🔄 Unified Product Endpoint with Role-Based Access

## 🎯 **Overview**
The `GET /products` endpoint now serves **all roles** but returns different data based on user permissions:

- **Admin & CEO**: Get all products in the system
- **Other roles**: Get products assigned to their specific shop

---

## 📋 **UNIFIED ENDPOINT**

### **GET /products**
```http
GET /products
Authorization: Bearer <token>
```

**Required Roles:** `CEO`, `Admin`, `WarehouseKeeper`, `Storekeeper`, `Attendee`, `Receptionist`, `Packager`

**Behavior:** 
- **Admin/CEO**: Returns all products
- **Others**: Returns products assigned to user's shop

---

## 📊 **Response Formats**

### **1. Admin/CEO Response (All Products)**
```json
[
  {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S24",
    "description": "Latest flagship smartphone with advanced camera",
    "price": 850000,
    "image": "https://example.com/samsung-s24.jpg",
    "totalStock": 50,
    "availableStock": 45,
    "category": "Electronics"
  },
  {
    "id": "product-uuid-2",
    "name": "MacBook Pro 16",
    "description": "High-performance laptop for professionals",
    "price": 1200000,
    "image": "https://example.com/macbook-pro.jpg",
    "totalStock": 25,
    "availableStock": 20,
    "category": "Electronics"
  }
]
```

### **2. Shop Staff Response (Shop-Assigned Products)**
```json
[
  {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S24",
    "description": "Latest flagship smartphone with advanced camera",
    "price": 850000,
    "image": "https://example.com/samsung-s24.jpg",
    "totalStock": 50,
    "availableStock": 45,
    "category": "Electronics",
    "assignedQuantity": 15,
    "assignedAt": "2025-08-03T10:30:00.000Z",
    "warehouseName": "Main Warehouse"
  },
  {
    "id": "product-uuid-3",
    "name": "Office Chair",
    "description": "Ergonomic office chair with lumbar support",
    "price": 75000,
    "image": "https://example.com/office-chair.jpg",
    "totalStock": 100,
    "availableStock": 85,
    "category": "Furniture",
    "assignedQuantity": 10,
    "assignedAt": "2025-08-02T14:20:00.000Z",
    "warehouseName": "Secondary Warehouse"
  }
]
```

### **3. User with No Shop Assignment**
```json
[]
```

---

## 🔧 **Frontend Implementation**

### **1. Universal Product Fetching**
```javascript
const fetchProducts = async (token) => {
  try {
    const response = await fetch('/products', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();
    
    // Check if products have assignment data (shop staff)
    const hasAssignmentData = products.length > 0 && products[0].assignedQuantity !== undefined;
    
    if (hasAssignmentData) {
      console.log('Shop-specific products loaded');
      products.forEach(product => {
        console.log(`- ${product.name}: ${product.assignedQuantity} assigned from ${product.warehouseName}`);
      });
    } else {
      console.log('All products loaded (admin view)');
      console.log(`Total products: ${products.length}`);
    }

    return products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};
```

### **2. React Hook with Role Detection**
```jsx
import { useState, useEffect } from 'react';

const useProducts = (token, userRole) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isShopView, setIsShopView] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/products', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        
        // Detect if this is shop-specific data
        const hasAssignmentData = data.length > 0 && data[0].assignedQuantity !== undefined;
        setIsShopView(hasAssignmentData);
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProducts();
    }
  }, [token]);

  return { products, loading, error, isShopView };
};

// Component usage
const ProductList = ({ user, token }) => {
  const { products, loading, error, isShopView } = useProducts(token, user.role);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-list">
      <div className="header">
        <h2>Products</h2>
        <div className="view-indicator">
          {isShopView ? (
            <span className="shop-view">Shop View - Assigned Products Only</span>
          ) : (
            <span className="admin-view">Admin View - All Products</span>
          )}
        </div>
      </div>

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Category:</strong> {product.category}</p>
            <p><strong>Price:</strong> ₦{product.price.toLocaleString()}</p>
            <p><strong>Stock:</strong> {product.availableStock}/{product.totalStock}</p>
            
            {isShopView && (
              <div className="assignment-info">
                <p><strong>Assigned:</strong> {product.assignedQuantity} units</p>
                <p><strong>From:</strong> {product.warehouseName}</p>
                <p><strong>Date:</strong> {new Date(product.assignedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          {isShopView ? (
            <p>No products assigned to your shop yet.</p>
          ) : (
            <p>No products found in the system.</p>
          )}
        </div>
      )}
    </div>
  );
};
```

### **3. Role-Based UI Components**
```jsx
const ProductActions = ({ product, userRole, isShopView }) => {
  const isAdmin = userRole === 'CEO' || userRole === 'Admin';
  const canManage = isAdmin || userRole === 'WarehouseKeeper';

  return (
    <div className="product-actions">
      {canManage && (
        <>
          <button onClick={() => editProduct(product.id)}>Edit</button>
          <button onClick={() => manageStock(product.id)}>Manage Stock</button>
        </>
      )}
      
      {isAdmin && (
        <button onClick={() => assignToShop(product.id)}>Assign to Shop</button>
      )}
      
      {isShopView && (
        <button onClick={() => viewAssignmentHistory(product.id)}>
          View Assignment History
        </button>
      )}
    </div>
  );
};
```

---

## 🔍 **Key Differences**

### **Admin/CEO View:**
- ✅ All products in the system
- ✅ No assignment information
- ✅ Full product management capabilities
- ✅ Can see products not assigned to any shop

### **Shop Staff View:**
- ✅ Only products assigned to their shop
- ✅ Assignment details included (quantity, date, warehouse)
- ✅ Shop-specific context
- ✅ Assignment history information

---

## 🎯 **Benefits**

### **1. Simplified Frontend**
- Single endpoint for all users
- Automatic role-based filtering
- Consistent API interface
- Reduced complexity

### **2. Enhanced Security**
- Users only see relevant data
- No unauthorized access to other shops
- Role-based data segregation
- Automatic permission enforcement

### **3. Better User Experience**
- Relevant product information
- Context-aware data
- Assignment tracking for shop staff
- Clear role-based views

### **4. Operational Efficiency**
- Shop staff see assignment details
- Admin gets full system view
- Proper data segregation
- Enhanced accountability

---

## 🚨 **Important Notes**

1. **Single Endpoint**: All users now use `GET /products`
2. **Automatic Filtering**: Backend automatically filters based on user role
3. **Enhanced Data**: Shop staff get additional assignment information
4. **No Shop Assignment**: Users without shop assignment get empty array
5. **JWT Required**: All requests must include valid JWT token

---

## ✅ **Migration Guide**

### **Before:**
```javascript
// Admin/CEO
const products = await fetch('/products');

// Others  
const products = await fetch('/warehouses/products');
```

### **After:**
```javascript
// All users
const products = await fetch('/products');
// Backend automatically handles role-based filtering
```

---

## 🚀 **Production Ready**

**The unified product endpoint is now fully implemented:**

- ✅ **Role-based filtering** - Automatic data segregation
- ✅ **Enhanced responses** - Assignment data for shop staff
- ✅ **Security** - Users only see relevant data
- ✅ **Simplified API** - Single endpoint for all users
- ✅ **Frontend-ready** - Rich data for UI components

**All users can now use the same `/products` endpoint with automatic role-based data filtering!** 🎉
