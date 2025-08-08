# 💰 Partial Payment System & Order Progression

## 🎯 **Overview**
Complete guide on how partial payments work and how orders progress through different phases based on payment status, allowing orders to proceed to fulfillment even with partial payments.

## 📊 **Order Payment States**

### **Payment Status Options**
```typescript
enum PaymentStatus {
  PENDING = 'pending',           // No payment made
  PARTIAL = 'partial',           // Some payment made, balance remaining
  PAID = 'paid',                 // Fully paid
  OVERPAID = 'overpaid',         // Paid more than total amount
  REFUNDED = 'refunded'          // Payment refunded
}
```

### **Order Status Progression**
```typescript
enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',     // Waiting for payment
  PARTIAL_PAYMENT = 'partial_payment',     // Partial payment received
  PAID = 'paid',                           // Fully paid, ready for processing
  ASSIGNED_PACKAGER = 'assigned_packager', // Assigned to packager
  PACKAGED = 'packaged',                   // Packaged and ready
  PICKED_UP = 'picked_up',                 // Customer picked up
  DELIVERED = 'delivered',                 // Delivered to customer
  CANCELLED = 'cancelled'                  // Order cancelled
}
```

## 🔄 **Partial Payment Flow Examples**

### **Example 1: Standard Partial Payment Flow**

**Initial Order Creation:**
```json
{
  "customerName": "John Doe",
  "customerPhone": "08012345678",
  "products": [
    {"id": "product-1", "quantity": 2, "price": 50000},
    {"id": "product-2", "quantity": 1, "price": 30000}
  ],
  "totalAmount": 130000,
  "paidAmount": 0,
  "balanceAmount": 130000,
  "paymentStatus": "pending",
  "status": "pending_payment"
}
```

**Step 1: First Partial Payment (50,000)**
```bash
curl -X PATCH "http://localhost:3001/orders/{orderId}/payment" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentAmount": 50000,
    "paymentMethod": "cash",
    "paymentReference": "CASH-001",
    "notes": "First installment payment"
  }'
```

**Response:**
```json
{
  "id": "order-uuid",
  "totalAmount": 130000,
  "paidAmount": 50000,
  "balanceAmount": 80000,
  "paymentStatus": "partial",
  "status": "partial_payment",
  "paymentHistory": [
    {
      "amount": 50000,
      "method": "cash",
      "reference": "CASH-001",
      "timestamp": "2025-08-03T10:00:00Z",
      "notes": "First installment payment"
    }
  ]
}
```

**Step 2: Second Partial Payment (30,000)**
```bash
curl -X PATCH "http://localhost:3001/orders/{orderId}/payment" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentAmount": 30000,
    "paymentMethod": "transfer",
    "paymentReference": "TXN-12345",
    "notes": "Second installment"
  }'
```

**Response:**
```json
{
  "id": "order-uuid",
  "totalAmount": 130000,
  "paidAmount": 80000,
  "balanceAmount": 50000,
  "paymentStatus": "partial",
  "status": "partial_payment",
  "paymentHistory": [
    {
      "amount": 50000,
      "method": "cash",
      "reference": "CASH-001",
      "timestamp": "2025-08-03T10:00:00Z"
    },
    {
      "amount": 30000,
      "method": "transfer", 
      "reference": "TXN-12345",
      "timestamp": "2025-08-03T11:30:00Z"
    }
  ]
}
```

**Step 3: Final Payment (50,000)**
```bash
curl -X PATCH "http://localhost:3001/orders/{orderId}/payment" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentAmount": 50000,
    "paymentMethod": "pos",
    "paymentReference": "POS-789",
    "notes": "Final payment"
  }'
```

**Response:**
```json
{
  "id": "order-uuid",
  "totalAmount": 130000,
  "paidAmount": 130000,
  "balanceAmount": 0,
  "paymentStatus": "paid",
  "status": "paid",
  "paymentHistory": [
    {
      "amount": 50000,
      "method": "cash",
      "reference": "CASH-001",
      "timestamp": "2025-08-03T10:00:00Z"
    },
    {
      "amount": 30000,
      "method": "transfer",
      "reference": "TXN-12345", 
      "timestamp": "2025-08-03T11:30:00Z"
    },
    {
      "amount": 50000,
      "method": "pos",
      "reference": "POS-789",
      "timestamp": "2025-08-03T14:00:00Z"
    }
  ]
}
```

## 🚀 **Order Progression with Partial Payments**

### **Scenario: Order Proceeds with Partial Payment**

**Business Rule**: Orders can proceed to packaging/fulfillment if at least 70% is paid.

**Example Order:**
- Total Amount: ₦100,000
- Minimum Required: ₦70,000 (70%)
- Current Paid: ₦80,000 (80%)
- Status: Can proceed to next phase

**Step 1: Check Payment Threshold**
```bash
curl -X GET "http://localhost:3001/orders/{orderId}/payment-status" \
  -H "Authorization: Bearer <token>"
```

**Response:**
```json
{
  "orderId": "order-uuid",
  "totalAmount": 100000,
  "paidAmount": 80000,
  "balanceAmount": 20000,
  "paymentPercentage": 80,
  "minimumRequired": 70,
  "canProceed": true,
  "paymentStatus": "partial",
  "nextAction": "Can assign to packager"
}
```

**Step 2: Proceed to Next Phase (Assign Packager)**
```bash
curl -X PATCH "http://localhost:3001/orders/{orderId}/assign-packager" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "packagerId": "packager-user-id",
    "notes": "Proceeding with partial payment (80% paid)"
  }'
```

**Response:**
```json
{
  "id": "order-uuid",
  "status": "assigned_packager",
  "paymentStatus": "partial",
  "paidAmount": 80000,
  "balanceAmount": 20000,
  "packager": {
    "id": "packager-user-id",
    "fullName": "John Packager",
    "username": "packager1"
  },
  "assignedAt": "2025-08-03T15:00:00Z",
  "notes": "Proceeding with partial payment (80% paid)"
}
```

## 📋 **Payment Management API Endpoints**

### **1. Record Payment**
```http
PATCH /orders/{orderId}/payment
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "paymentAmount": 50000,
  "paymentMethod": "cash|transfer|pos|card",
  "paymentReference": "TXN-12345",
  "notes": "Payment description"
}
```

### **2. Get Payment Status**
```http
GET /orders/{orderId}/payment-status
Authorization: Bearer <token>
```

### **3. Get Payment History**
```http
GET /orders/{orderId}/payments
Authorization: Bearer <token>
```

**Response:**
```json
{
  "orderId": "order-uuid",
  "totalAmount": 130000,
  "paidAmount": 80000,
  "balanceAmount": 50000,
  "paymentHistory": [
    {
      "id": "payment-1",
      "amount": 50000,
      "method": "cash",
      "reference": "CASH-001",
      "timestamp": "2025-08-03T10:00:00Z",
      "recordedBy": "attendee-user-id",
      "notes": "First installment"
    },
    {
      "id": "payment-2",
      "amount": 30000,
      "method": "transfer",
      "reference": "TXN-12345",
      "timestamp": "2025-08-03T11:30:00Z",
      "recordedBy": "receptionist-user-id",
      "notes": "Second installment"
    }
  ]
}
```

## 🔄 **Business Logic Examples**

### **Example 1: Minimum Payment Threshold**
```typescript
// Business rule: 70% minimum payment to proceed
const canProceedToPackaging = (paidAmount: number, totalAmount: number) => {
  const paymentPercentage = (paidAmount / totalAmount) * 100;
  return paymentPercentage >= 70;
};

// Example usage
const order = {
  totalAmount: 100000,
  paidAmount: 75000
};

if (canProceedToPackaging(order.paidAmount, order.totalAmount)) {
  // Can assign to packager
  updateOrderStatus(orderId, 'assigned_packager');
}
```

### **Example 2: Full Payment Required for Delivery**
```typescript
// Business rule: 100% payment required for delivery
const canDeliver = (paidAmount: number, totalAmount: number) => {
  return paidAmount >= totalAmount;
};

// Example usage
if (canDeliver(order.paidAmount, order.totalAmount)) {
  // Can mark as delivered
  updateOrderStatus(orderId, 'delivered');
} else {
  // Must collect balance before delivery
  return {
    message: "Balance payment required before delivery",
    balanceAmount: order.totalAmount - order.paidAmount
  };
}
```

## 🎯 **Real-World Scenarios**

### **Scenario 1: Electronics Store**
```
Order: Laptop + Accessories = ₦500,000
Payment 1: ₦200,000 (40%) - Order stays pending
Payment 2: ₦200,000 (80% total) - Can proceed to packaging
Payment 3: ₦100,000 (100% total) - Ready for delivery
```

### **Scenario 2: Furniture Store**
```
Order: Dining Set = ₦300,000
Payment 1: ₦150,000 (50%) - Order stays pending
Payment 2: ₦100,000 (83% total) - Can proceed to packaging
Customer picks up with ₦50,000 balance - Delivery allowed
```

### **Scenario 3: Grocery Store**
```
Order: Bulk Items = ₦50,000
Payment 1: ₦40,000 (80%) - Can proceed immediately
Customer pays ₦10,000 on pickup - Order completed
```

## ✅ **Benefits of Partial Payment System**

### **1. Customer Flexibility**
- ✅ Customers can pay in installments
- ✅ Reduces financial burden
- ✅ Increases order conversion

### **2. Business Cash Flow**
- ✅ Receive payments earlier
- ✅ Reduce payment defaults
- ✅ Better cash flow management

### **3. Operational Efficiency**
- ✅ Orders can proceed with partial payment
- ✅ Reduces order delays
- ✅ Optimizes inventory turnover

### **4. Risk Management**
- ✅ Minimum payment thresholds
- ✅ Payment tracking and history
- ✅ Clear balance management

## 🎯 **Status**

✅ **Partial Payment Support**: Multiple payment installments
✅ **Order Progression**: Orders proceed based on payment thresholds
✅ **Payment Tracking**: Complete payment history
✅ **Business Rules**: Configurable minimum payment requirements
✅ **API Endpoints**: Full payment management functionality

**The partial payment system allows flexible payment options while maintaining business control over order progression!** 💰✨

---

*System design completed: August 3, 2025*
*Status: ✅ PARTIAL PAYMENT SYSTEM READY*
*Next: Implement payment endpoints and business logic*
