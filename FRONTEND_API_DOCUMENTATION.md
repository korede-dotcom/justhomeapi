# Frontend API Documentation - Warehouse & Shop Management

## Base Configuration
```typescript
const API_BASE_URL = 'http://localhost:4000'; // or your production URL
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${token}` // JWT token from login
};
```

## Authentication Required
All endpoints require JWT authentication. Include the token in the Authorization header.

---

## 🏭 WAREHOUSE ENDPOINTS

### 1. Create Warehouse
```typescript
POST /warehouses
```

**Request Payload:**
```typescript
interface CreateWarehouseRequest {
  name: string;           // Required
  location: string;       // Required
  description?: string;   // Optional
  managerId?: string;     // Optional - UUID of manager user
}
```

**Example Request:**
```json
{
  "name": "Main Warehouse Lagos",
  "location": "Ikeja, Lagos State",
  "description": "Primary storage facility for Lagos operations",
  "managerId": "user-uuid-here"
}
```

**Response:**
```typescript
interface CreateWarehouseResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
}
```

**Example Response:**
```json
{
  "id": "warehouse-uuid-123",
  "name": "Main Warehouse Lagos",
  "location": "Ikeja, Lagos State",
  "description": "Primary storage facility for Lagos operations",
  "isActive": true,
  "managerId": "user-uuid-here"
}
```

---

### 2. Get All Warehouses
```typescript
GET /warehouses
```

**No Request Payload**

**Response:**
```typescript
interface GetWarehousesResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
  manager?: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  } | null;
  users: Array<{
    id: string;
    username: string;
    fullName: string;
    role: string;
  }>;
  products: Array<{
    id: string;
    name: string;
    price: number;
    totalStock: number;
    category: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    products: number;
    users: number;
    productAssignments: number;
  };
}[]
```

**Example Response:**
```json
[
  {
    "id": "warehouse-uuid-123",
    "name": "Main Warehouse Lagos",
    "location": "Ikeja, Lagos State",
    "description": "Primary storage facility",
    "isActive": true,
    "managerId": "user-uuid-here",
    "manager": {
      "id": "user-uuid-here",
      "username": "warehouse_manager",
      "fullName": "John Doe",
      "role": "WarehouseKeeper"
    },
    "users": [
      {
        "id": "user-uuid-1",
        "username": "staff1",
        "fullName": "Jane Smith",
        "role": "WarehouseKeeper"
      }
    ],
    "products": [
      {
        "id": "product-uuid-1",
        "name": "Samsung Galaxy S24",
        "price": 850000,
        "totalStock": 100,
        "category": {
          "id": "category-uuid-1",
          "name": "Electronics"
        }
      }
    ],
    "_count": {
      "products": 25,
      "users": 8,
      "productAssignments": 15
    }
  }
]
```

---

### 3. Get Warehouse by ID
```typescript
GET /warehouses/:id
```

**URL Parameters:**
- `id` (string): Warehouse UUID

**Response:** Same as individual warehouse object from Get All Warehouses

---

### 4. Update Warehouse
```typescript
PATCH /warehouses/:id
```

**URL Parameters:**
- `id` (string): Warehouse UUID

**Request Payload:**
```typescript
interface UpdateWarehouseRequest {
  name?: string;
  location?: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}
```

**Example Request:**
```json
{
  "name": "Updated Warehouse Name",
  "description": "Updated description",
  "isActive": true
}
```

**Response:** Same as Create Warehouse Response

---

### 5. Delete Warehouse
```typescript
DELETE /warehouses/:id
```

**URL Parameters:**
- `id` (string): Warehouse UUID

**No Request Payload**

**Response:**
```typescript
interface DeleteWarehouseResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
}
```

---

### 6. Assign Product to Shop
```typescript
POST /warehouses/assign-product
```

**Request Payload:**
```typescript
interface AssignProductRequest {
  productId: string;    // Required - UUID of product
  shopId: string;       // Required - UUID of shop
  warehouseId: string;  // Required - UUID of warehouse
  quantity: number;     // Required - Quantity to assign
  assignedBy: string;   // Required - UUID of user making assignment
}
```

**Example Request:**
```json
{
  "productId": "product-uuid-123",
  "shopId": "shop-uuid-456",
  "warehouseId": "warehouse-uuid-789",
  "quantity": 25,
  "assignedBy": "user-uuid-assigned-by"
}
```

**Response:**
```typescript
interface AssignProductResponse {
  id: string;
  productId: string;
  shopId: string;
  warehouseId: string;
  quantity: number;
  assignedBy: string;
  assignedAt: string; // ISO date string
}
```

**Example Response:**
```json
{
  "id": "assignment-uuid-123",
  "productId": "product-uuid-123",
  "shopId": "shop-uuid-456",
  "warehouseId": "warehouse-uuid-789",
  "quantity": 25,
  "assignedBy": "user-uuid-assigned-by",
  "assignedAt": "2025-08-03T10:30:00.000Z"
}
```

---

### 7. Get Warehouse Report
```typescript
GET /warehouses/:id/report
```

**URL Parameters:**
- `id` (string): Warehouse UUID

**Response:**
```typescript
interface WarehouseReportResponse {
  warehouse: {
    id: string;
    name: string;
    location: string;
    description: string | null;
    isActive: boolean;
    managerId: string | null;
    products: Array<{
      id: string;
      name: string;
      price: number;
      totalStock: number;
      category: {
        id: string;
        name: string;
        description: string | null;
      };
    }>;
    productAssignments: Array<{
      id: string;
      quantity: number;
      assignedAt: string;
      product: {
        id: string;
        name: string;
        price: number;
      };
      shop: {
        id: string;
        name: string;
        location: string;
      };
    }>;
    users: Array<{
      id: string;
      username: string;
      fullName: string;
      role: string;
    }>;
  };
  totalProducts: number;
  totalAssignments: number;
  totalUsers: number;
}
```

**Example Response:**
```json
{
  "warehouse": {
    "id": "warehouse-uuid-123",
    "name": "Main Warehouse Lagos",
    "location": "Ikeja, Lagos State",
    "description": "Primary storage facility",
    "isActive": true,
    "managerId": "user-uuid-here",
    "products": [
      {
        "id": "product-uuid-1",
        "name": "Samsung Galaxy S24",
        "price": 850000,
        "totalStock": 100,
        "category": {
          "id": "category-uuid-1",
          "name": "Electronics",
          "description": "Electronic devices"
        }
      }
    ],
    "productAssignments": [
      {
        "id": "assignment-uuid-1",
        "quantity": 25,
        "assignedAt": "2025-08-03T10:30:00.000Z",
        "product": {
          "id": "product-uuid-1",
          "name": "Samsung Galaxy S24",
          "price": 850000
        },
        "shop": {
          "id": "shop-uuid-1",
          "name": "Victoria Island Store",
          "location": "Victoria Island, Lagos"
        }
      }
    ],
    "users": [
      {
        "id": "user-uuid-1",
        "username": "staff1",
        "fullName": "Jane Smith",
        "role": "WarehouseKeeper"
      }
    ]
  },
  "totalProducts": 25,
  "totalAssignments": 15,
  "totalUsers": 8
}
```

---

## 🏪 SHOP ENDPOINTS

### 1. Create Shop
```typescript
POST /shops
```

**Request Payload:**
```typescript
interface CreateShopRequest {
  name: string;           // Required
  location: string;       // Required
  description?: string;   // Optional
  managerId?: string;     // Optional - UUID of manager user
}
```

**Example Request:**
```json
{
  "name": "Victoria Island Store",
  "location": "Victoria Island, Lagos",
  "description": "Premium retail outlet in VI",
  "managerId": "user-uuid-here"
}
```

**Response:**
```typescript
interface CreateShopResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
}
```

**Example Response:**
```json
{
  "id": "shop-uuid-123",
  "name": "Victoria Island Store",
  "location": "Victoria Island, Lagos",
  "description": "Premium retail outlet in VI",
  "isActive": true,
  "managerId": "user-uuid-here"
}
```

---

### 2. Get All Shops
```typescript
GET /shops
```

**No Request Payload**

**Response:**
```typescript
interface GetShopsResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
  manager?: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  } | null;
  users: Array<{
    id: string;
    username: string;
    fullName: string;
    role: string;
  }>;
  productAssignments: Array<{
    id: string;
    quantity: number;
    assignedAt: string;
    product: {
      id: string;
      name: string;
      price: number;
      category: {
        id: string;
        name: string;
      };
    };
  }>;
  _count: {
    users: number;
    productAssignments: number;
  };
}[]
```

**Example Response:**
```json
[
  {
    "id": "shop-uuid-123",
    "name": "Victoria Island Store",
    "location": "Victoria Island, Lagos",
    "description": "Premium retail outlet",
    "isActive": true,
    "managerId": "user-uuid-here",
    "manager": {
      "id": "user-uuid-here",
      "username": "shop_manager",
      "fullName": "Alice Johnson",
      "role": "ShopKeeper"
    },
    "users": [
      {
        "id": "user-uuid-1",
        "username": "cashier1",
        "fullName": "Bob Wilson",
        "role": "ShopKeeper"
      }
    ],
    "productAssignments": [
      {
        "id": "assignment-uuid-1",
        "quantity": 25,
        "assignedAt": "2025-08-03T10:30:00.000Z",
        "product": {
          "id": "product-uuid-1",
          "name": "Samsung Galaxy S24",
          "price": 850000,
          "category": {
            "id": "category-uuid-1",
            "name": "Electronics"
          }
        }
      }
    ],
    "_count": {
      "users": 12,
      "productAssignments": 8
    }
  }
]
```

---

### 3. Get Shop by ID
```typescript
GET /shops/:id
```

**URL Parameters:**
- `id` (string): Shop UUID

**Response:** Same as individual shop object from Get All Shops

---

### 4. Update Shop
```typescript
PATCH /shops/:id
```

**URL Parameters:**
- `id` (string): Shop UUID

**Request Payload:**
```typescript
interface UpdateShopRequest {
  name?: string;
  location?: string;
  description?: string;
  managerId?: string;
  isActive?: boolean;
}
```

**Example Request:**
```json
{
  "name": "Updated Shop Name",
  "description": "Updated description",
  "isActive": true
}
```

**Response:** Same as Create Shop Response

---

### 5. Delete Shop
```typescript
DELETE /shops/:id
```

**URL Parameters:**
- `id` (string): Shop UUID

**No Request Payload**

**Response:**
```typescript
interface DeleteShopResponse {
  id: string;
  name: string;
  location: string;
  description: string | null;
  isActive: boolean;
  managerId: string | null;
}
```

---

### 6. Get Shop Report
```typescript
GET /shops/:id/report
```

**URL Parameters:**
- `id` (string): Shop UUID

**Response:**
```typescript
interface ShopReportResponse {
  shop: {
    id: string;
    name: string;
    location: string;
    description: string | null;
    isActive: boolean;
    managerId: string | null;
    users: Array<{
      id: string;
      username: string;
      fullName: string;
      role: string;
    }>;
    productAssignments: Array<{
      id: string;
      quantity: number;
      assignedAt: string;
      product: {
        id: string;
        name: string;
        price: number;
        category: {
          id: string;
          name: string;
          description: string | null;
        };
      };
    }>;
  };
  totalUsers: number;
  totalProductAssignments: number;
}
```

**Example Response:**
```json
{
  "shop": {
    "id": "shop-uuid-123",
    "name": "Victoria Island Store",
    "location": "Victoria Island, Lagos",
    "description": "Premium retail outlet",
    "isActive": true,
    "managerId": "user-uuid-here",
    "users": [
      {
        "id": "user-uuid-1",
        "username": "cashier1",
        "fullName": "Bob Wilson",
        "role": "ShopKeeper"
      },
      {
        "id": "user-uuid-2",
        "username": "cashier2",
        "fullName": "Carol Davis",
        "role": "ShopKeeper"
      }
    ],
    "productAssignments": [
      {
        "id": "assignment-uuid-1",
        "quantity": 25,
        "assignedAt": "2025-08-03T10:30:00.000Z",
        "product": {
          "id": "product-uuid-1",
          "name": "Samsung Galaxy S24",
          "price": 850000,
          "category": {
            "id": "category-uuid-1",
            "name": "Electronics",
            "description": "Electronic devices"
          }
        }
      }
    ]
  },
  "totalUsers": 12,
  "totalProductAssignments": 8
}
```

---

## 🔐 AUTHENTICATION

### Login (Required for all endpoints)
```typescript
POST /auth/login
```

**Request Payload:**
```typescript
interface LoginRequest {
  username: string;
  password: string;
}
```

**Response:**
```typescript
interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    fullName: string;
    isActive: boolean;
  };
  message: string;
}
```

**Example Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Example Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid-123",
    "username": "admin",
    "email": "admin@example.com",
    "role": "Admin",
    "fullName": "System Administrator",
    "isActive": true
  },
  "message": "Login successful"
}
```

---

## 🚨 ERROR RESPONSES

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Warehouse not found", // or "Shop not found"
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## 📝 FRONTEND IMPLEMENTATION NOTES

### 1. **Authentication Flow**
```typescript
// 1. Login first
const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

const { access_token } = await loginResponse.json();

// 2. Use token for all subsequent requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${access_token}`
};
```

### 2. **Error Handling**
```typescript
const response = await fetch(url, options);
if (!response.ok) {
  const error = await response.json();
  throw new Error(error.message || 'Request failed');
}
```

### 3. **TypeScript Interfaces**
Use the provided interfaces for type safety in your frontend application.

### 4. **Required Permissions**
- **Admin**: Full access to all endpoints
- **WarehouseKeeper**: Access to warehouse operations
- **ShopKeeper**: Access to shop operations
- **Manager**: Access based on managed warehouses/shops

---

## 🎯 QUICK START EXAMPLE

```typescript
// Example: Create warehouse and assign product to shop
async function createWarehouseAndAssignProduct() {
  // 1. Create warehouse
  const warehouse = await fetch(`${API_BASE_URL}/warehouses`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: "New Warehouse",
      location: "Lagos, Nigeria",
      description: "Test warehouse"
    })
  }).then(res => res.json());

  // 2. Assign product to shop
  const assignment = await fetch(`${API_BASE_URL}/warehouses/assign-product`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      productId: "existing-product-id",
      shopId: "existing-shop-id",
      warehouseId: warehouse.id,
      quantity: 50,
      assignedBy: "current-user-id"
    })
  }).then(res => res.json());

  // 3. Get warehouse report
  const report = await fetch(`${API_BASE_URL}/warehouses/${warehouse.id}/report`, {
    headers
  }).then(res => res.json());

  return { warehouse, assignment, report };
}
```

---

## 📊 ENDPOINT SUMMARY

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/login` | User authentication | ❌ |
| POST | `/warehouses` | Create warehouse | ✅ |
| GET | `/warehouses` | List all warehouses | ✅ |
| GET | `/warehouses/:id` | Get warehouse by ID | ✅ |
| PATCH | `/warehouses/:id` | Update warehouse | ✅ |
| DELETE | `/warehouses/:id` | Delete warehouse | ✅ |
| POST | `/warehouses/assign-product` | Assign product to shop | ✅ |
| GET | `/warehouses/:id/report` | Get warehouse report | ✅ |
| POST | `/shops` | Create shop | ✅ |
| GET | `/shops` | List all shops | ✅ |
| GET | `/shops/:id` | Get shop by ID | ✅ |
| PATCH | `/shops/:id` | Update shop | ✅ |
| DELETE | `/shops/:id` | Delete shop | ✅ |
| GET | `/shops/:id/report` | Get shop report | ✅ |

---

## 🚀 READY FOR FRONTEND IMPLEMENTATION

This documentation provides everything your frontend agent needs to implement the warehouse and shop management features! All endpoints are production-ready and fully tested. 🎉
