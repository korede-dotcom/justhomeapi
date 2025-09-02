# Dashboard Endpoint Documentation

## Overview
The dashboard endpoint provides comprehensive statistics for the entire system, including products, categories, warehouses, shops, orders, revenue, and payment information.

## Endpoint Details

### URL
```
GET /warehouses/dashboard
```

### Authentication
- **Required**: JWT Bearer Token
- **Roles**: CEO, Admin, WarehouseKeeper, Storekeeper, Attendee, Receptionist, Packager

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Response Format

The endpoint returns a JSON object with the following structure:

```json
{
  "totalProducts": 325,
  "categories": 12,
  "totalStock": 1500,
  "warehouses": 4,
  "totalAssignments": 150,
  "activeShops": 6,
  "activeAssignments": 120,
  "totalRevenue": 852000,
  "totalCollected": 853000,
  "partialPayments": 0,
  "outstandingPayments": 0,
  "totalOrders": 3,
  "completedOrders": 2,
  "pendingPayment": 0,
  "readyForPickup": 0,
  "orderStatusBreakdown": {
    "pending_payment": 0,
    "partial_payment": 0,
    "paid": 1,
    "assigned_packager": 0,
    "packaged": 0,
    "picked_up": 0,
    "delivered": 2
  }
}
```

## Statistics Explained

### Product Statistics
- **totalProducts**: Total number of products in the system
- **categories**: Total number of product categories
- **totalStock**: Sum of all product total stock quantities

### Warehouse & Assignment Statistics
- **warehouses**: Total number of warehouses
- **totalAssignments**: Total number of product assignments to shops
- **activeShops**: Number of active shops (isActive = true)
- **activeAssignments**: Number of assignments with available quantity > 0

### Revenue Statistics
- **totalRevenue**: Sum of all order total amounts
- **totalCollected**: Sum of all paid amounts across all orders
- **partialPayments**: Sum of paid amounts for orders with partial payment status
- **outstandingPayments**: Total outstanding amount (total revenue - total collected)

### Order Statistics
- **totalOrders**: Total number of orders
- **completedOrders**: Number of orders with 'delivered' status
- **pendingPayment**: Number of orders with 'pending_payment' status
- **readyForPickup**: Number of orders with 'picked_up' status

### Order Status Breakdown
- **orderStatusBreakdown**: Detailed count of orders by status
  - `pending_payment`: Orders awaiting payment
  - `partial_payment`: Orders with partial payments
  - `paid`: Fully paid orders
  - `assigned_packager`: Orders assigned to packager
  - `packaged`: Orders that have been packaged
  - `picked_up`: Orders ready for pickup
  - `delivered`: Completed orders

## Usage Examples

### cURL Example
```bash
curl -X GET http://localhost:3000/warehouses/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### JavaScript/Fetch Example
```javascript
const response = await fetch('http://localhost:3000/warehouses/dashboard', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  }
});

const dashboardStats = await response.json();
console.log('Total Products:', dashboardStats.totalProducts);
console.log('Total Revenue:', dashboardStats.totalRevenue);
```

### React/TypeScript Example
```typescript
interface DashboardStats {
  totalProducts: number;
  categories: number;
  totalStock: number;
  warehouses: number;
  totalAssignments: number;
  activeShops: number;
  activeAssignments: number;
  totalRevenue: number;
  totalCollected: number;
  partialPayments: number;
  outstandingPayments: number;
  totalOrders: number;
  completedOrders: number;
  pendingPayment: number;
  readyForPickup: number;
  orderStatusBreakdown: Record<string, number>;
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  const response = await fetch('/warehouses/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats');
  }
  
  return response.json();
};
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Failed to fetch dashboard statistics: [error details]"
}
```

## Performance Notes

- All database queries are executed in parallel for optimal performance
- The endpoint uses efficient aggregation queries to minimize data transfer
- Results are cached at the database level for better response times
- The endpoint is designed to handle large datasets efficiently

## Testing

Use the provided test script to verify the endpoint:

```bash
./test-dashboard.sh
```

Make sure to:
1. Update the credentials in the test script
2. Ensure the server is running on localhost:3000
3. Have `jq` installed for JSON formatting

## Implementation Details

The dashboard statistics are calculated using:
- **Prisma ORM** for type-safe database queries
- **Parallel Promise execution** for optimal performance
- **Aggregation queries** for efficient counting and summing
- **Raw SQL** for complex calculations like outstanding payments
- **Comprehensive error handling** with detailed logging
