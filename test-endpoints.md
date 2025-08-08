# API Endpoints Testing Guide

## Base URL
- Development: `http://localhost:4000`
- All endpoints require authentication except `/auth/login`

## Authentication
First, you need to authenticate to get a JWT token:

### 1. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "admin_user",
  "password": "admin_password"
}
```

**Expected Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "Admin",
    "fullName": "Admin User",
    "isActive": true
  },
  "message": "Login successful"
}
```

Use the `access_token` in the Authorization header for all subsequent requests:
```
Authorization: Bearer <access_token>
```

## Warehouse Endpoints

### 2. Create Warehouse
```bash
POST /warehouses
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Main Warehouse",
  "location": "Lagos, Nigeria",
  "description": "Primary storage facility",
  "managerId": "manager-user-id"
}
```

**Expected Response:**
```json
{
  "id": "warehouse-id",
  "name": "Main Warehouse",
  "location": "Lagos, Nigeria", 
  "description": "Primary storage facility",
  "isActive": true,
  "managerId": "manager-user-id"
}
```

### 3. Get All Warehouses
```bash
GET /warehouses
Authorization: Bearer <token>
```

**Expected Response:**
```json
[
  {
    "id": "warehouse-id",
    "name": "Main Warehouse",
    "location": "Lagos, Nigeria",
    "description": "Primary storage facility",
    "isActive": true,
    "managerId": "manager-user-id",
    "manager": {
      "id": "manager-user-id",
      "username": "warehouse_manager",
      "fullName": "Warehouse Manager",
      "role": "WarehouseKeeper"
    },
    "users": [...],
    "products": [...],
    "_count": {
      "products": 10,
      "users": 5
    }
  }
]
```

### 4. Get Warehouse by ID
```bash
GET /warehouses/{warehouse-id}
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "id": "warehouse-id",
  "name": "Main Warehouse",
  "location": "Lagos, Nigeria",
  "description": "Primary storage facility",
  "isActive": true,
  "managerId": "manager-user-id",
  "manager": {...},
  "users": [...],
  "products": [...],
  "productAssignments": [...]
}
```

### 5. Update Warehouse
```bash
PATCH /warehouses/{warehouse-id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Warehouse Name",
  "description": "Updated description"
}
```

### 6. Delete Warehouse
```bash
DELETE /warehouses/{warehouse-id}
Authorization: Bearer <token>
```

### 7. Assign Product to Shop
```bash
POST /warehouses/assign-product
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "product-id",
  "shopId": "shop-id",
  "warehouseId": "warehouse-id",
  "quantity": 50,
  "assignedBy": "user-id"
}
```

**Expected Response:**
```json
{
  "id": "assignment-id",
  "productId": "product-id",
  "shopId": "shop-id", 
  "warehouseId": "warehouse-id",
  "quantity": 50,
  "assignedBy": "user-id",
  "assignedAt": "2025-08-03T09:00:00.000Z"
}
```

### 8. Get Warehouse Report
```bash
GET /warehouses/{warehouse-id}/report
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "warehouse": {
    "id": "warehouse-id",
    "name": "Main Warehouse",
    "location": "Lagos, Nigeria",
    "description": "Primary storage facility",
    "isActive": true,
    "managerId": "manager-user-id",
    "products": [...],
    "productAssignments": [...],
    "users": [...]
  },
  "totalProducts": 25,
  "totalAssignments": 15,
  "totalUsers": 8
}
```

## Shop Endpoints

### 9. Create Shop
```bash
POST /shops
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Downtown Store",
  "location": "Victoria Island, Lagos",
  "description": "Main retail outlet",
  "managerId": "shop-manager-id"
}
```

### 10. Get All Shops
```bash
GET /shops
Authorization: Bearer <token>
```

### 11. Get Shop Report
```bash
GET /shops/{shop-id}/report
Authorization: Bearer <token>
```

**Expected Response:**
```json
{
  "shop": {
    "id": "shop-id",
    "name": "Downtown Store",
    "location": "Victoria Island, Lagos",
    "description": "Main retail outlet",
    "isActive": true,
    "managerId": "shop-manager-id",
    "users": [...],
    "productAssignments": [...]
  },
  "totalUsers": 12,
  "totalProductAssignments": 8
}
```
