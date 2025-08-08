# 🔐 Role-Based Product Access Control

## 🎯 **Access Control Summary**

### **👑 Admin & CEO Only**
- `GET /products` - Full product access with admin privileges

### **👥 Other Users (WarehouseKeeper, Storekeeper, Attendee, etc.)**
- `GET /warehouses/products` - Product access through warehouse endpoint

---

## 📋 **RESTRICTED ENDPOINT: Admin/CEO Only**

### **GET /products**
```http
GET /products
Authorization: Bearer <token>
```

**Required Roles:** `CEO`, `Admin` **ONLY**

**Response:**
```json
[
  {
    "id": "product-uuid-1",
    "name": "Samsung Galaxy S24",
    "description": "Latest flagship smartphone with advanced camera",
    "price": 850000,
    "totalStock": 50,
    "availableStock": 45,
    "image": "https://example.com/samsung-s24.jpg",
    "categoryId": "category-uuid-1",
    "warehouseId": "warehouse-uuid-1"
  }
]
```

**Error for Non-Admin Users:**
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

---

## 🏭 **ALTERNATIVE ENDPOINT: For Other Users**

### **GET /warehouses/products**
```http
GET /warehouses/products
Authorization: Bearer <token>
```

**Required Roles:** `WarehouseKeeper`, `Storekeeper`, `Attendee`, `Receptionist`, `Packager`

**Response:**
```json
{
  "totalProducts": 25,
  "products": [
    {
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
    {
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
    }
  ]
}
```

---

## 🔧 **Frontend Implementation**

### **1. Role-Based Product Fetching**
```javascript
const fetchProducts = async (userRole, token) => {
  let endpoint;
  
  // Determine endpoint based on user role
  if (userRole === 'CEO' || userRole === 'Admin') {
    endpoint = '/products';  // Admin endpoint
  } else {
    endpoint = '/warehouses/products';  // Non-admin endpoint
  }

  try {
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('Access denied. Use warehouse endpoint for non-admin users.');
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Handle different response formats
    if (userRole === 'CEO' || userRole === 'Admin') {
      return { products: data, totalProducts: data.length };
    } else {
      return data; // Already has totalProducts and products structure
    }
  } catch (error) {
    console.error('Failed to fetch products:', error);
    throw error;
  }
};

// Usage
const productData = await fetchProducts(currentUser.role, authToken);
console.log(`Found ${productData.totalProducts} products`);
```

### **2. React Hook for Role-Based Access**
```jsx
import { useState, useEffect } from 'react';

const useProducts = (userRole, token) => {
  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine endpoint based on role
        const endpoint = (userRole === 'CEO' || userRole === 'Admin') 
          ? '/products' 
          : '/warehouses/products';

        const response = await fetch(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 403) {
            throw new Error('Access denied. Insufficient permissions.');
          }
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const data = await response.json();
        
        if (userRole === 'CEO' || userRole === 'Admin') {
          setProducts(data);
          setTotalProducts(data.length);
        } else {
          setProducts(data.products);
          setTotalProducts(data.totalProducts);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userRole && token) {
      fetchProducts();
    }
  }, [userRole, token]);

  return { products, totalProducts, loading, error };
};

// Component usage
const ProductList = ({ user, token }) => {
  const { products, totalProducts, loading, error } = useProducts(user.role, token);

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="product-list">
      <h2>Products ({totalProducts})</h2>
      <p>Access level: {user.role === 'CEO' || user.role === 'Admin' ? 'Admin' : 'Standard'}</p>
      
      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <img src={product.image} alt={product.name} />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ₦{product.price.toLocaleString()}</p>
            <p><strong>Stock:</strong> {product.availableStock}/{product.totalStock}</p>
            {product.category && (
              <p><strong>Category:</strong> {product.category.name}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### **3. Error Handling for Access Control**
```javascript
const handleProductAccess = async (userRole, token) => {
  try {
    // Try admin endpoint first if user thinks they have access
    if (userRole === 'CEO' || userRole === 'Admin') {
      const response = await fetch('/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        return await response.json();
      }
    }
    
    // Fallback to warehouse endpoint
    const response = await fetch('/warehouses/products', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (!response.ok) {
      throw new Error('No access to product endpoints');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Product access error:', error);
    
    // Show user-friendly message
    if (error.message.includes('403')) {
      alert('You do not have permission to access the admin product endpoint. Using standard access.');
    }
    
    throw error;
  }
};
```

---

## 📊 **Complete Product Endpoint Permissions**

| Endpoint | CEO | Admin | WarehouseKeeper | Storekeeper | Attendee | Receptionist | Packager |
|----------|-----|-------|-----------------|-------------|----------|--------------|----------|
| `GET /products` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `GET /warehouses/products` | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /products` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `PATCH /products/:id` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `GET /products/category` | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `POST /products/category` | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| `POST /products/upload` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| `POST /products/upload-csv` | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 🎯 **Key Benefits**

### **1. Security**
- ✅ Admin-only access to sensitive product management
- ✅ Role-based access control enforced at API level
- ✅ Clear separation of admin vs user functionality

### **2. User Experience**
- ✅ Non-admin users get enhanced product data with categories
- ✅ Consistent API responses for different user types
- ✅ Clear error messages for access violations

### **3. Data Integrity**
- ✅ Prevents unauthorized product modifications
- ✅ Maintains audit trail of who accesses what
- ✅ Protects sensitive business data

### **4. Scalability**
- ✅ Easy to add new roles and permissions
- ✅ Flexible endpoint structure
- ✅ Maintainable access control system

---

## 🚨 **Important Notes**

1. **Admin/CEO users should use:** `GET /products`
2. **All other users should use:** `GET /warehouses/products`
3. **Frontend must handle role-based routing**
4. **403 errors indicate insufficient permissions**
5. **Always include JWT token in Authorization header**

---

## ✅ **Implementation Complete**

**Role-based product access is now fully implemented and production-ready!**

- ✅ Admin/CEO exclusive access to `/products`
- ✅ Alternative endpoint for other users at `/warehouses/products`
- ✅ Comprehensive role restrictions on all product endpoints
- ✅ Enhanced error handling and security
- ✅ Frontend-ready with clear documentation

**Update your frontend to use the appropriate endpoint based on user role!** 🚀
