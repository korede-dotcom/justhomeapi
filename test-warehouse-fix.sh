#!/bin/bash

# Test script to verify warehouse creation fix
BASE_URL="http://localhost:3001"

echo "🧪 Testing Warehouse Creation Fix"
echo "================================="

# Test 1: Login to get token
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }')

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
    echo "✅ Login successful"
    echo "Token: ${TOKEN:0:20}..."
else
    echo "❌ Login failed"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo ""

# Test 2: Create warehouse with invalid field (should work now)
echo "2. Testing warehouse creation with invalid 'createdBy' field..."
WAREHOUSE_RESPONSE=$(curl -s -X POST "$BASE_URL/warehouses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Warehouse Fix",
    "location": "Test Location",
    "description": "Testing the fix for invalid fields",
    "managerId": "1311b06f-2ae2-4641-a020-aed8d80c7a16",
    "isActive": true,
    "createdBy": "ceo"
  }')

echo "Response: $WAREHOUSE_RESPONSE"

if echo "$WAREHOUSE_RESPONSE" | grep -q '"id"'; then
    echo "✅ Warehouse creation successful!"
    WAREHOUSE_ID=$(echo "$WAREHOUSE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Warehouse ID: $WAREHOUSE_ID"
else
    echo "❌ Warehouse creation failed"
    if echo "$WAREHOUSE_RESPONSE" | grep -q "Manager with ID"; then
        echo "🔍 Issue: Manager ID not found in database"
        echo "💡 This is expected if the manager ID doesn't exist"
    elif echo "$WAREHOUSE_RESPONSE" | grep -q "500"; then
        echo "🔍 Issue: Still getting 500 error - fix not applied"
    fi
fi

echo ""

# Test 3: Create warehouse without managerId (should work)
echo "3. Testing warehouse creation without managerId..."
WAREHOUSE_RESPONSE2=$(curl -s -X POST "$BASE_URL/warehouses" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Warehouse No Manager",
    "location": "Test Location 2",
    "description": "Testing without manager",
    "isActive": true,
    "createdBy": "ceo"
  }')

echo "Response: $WAREHOUSE_RESPONSE2"

if echo "$WAREHOUSE_RESPONSE2" | grep -q '"id"'; then
    echo "✅ Warehouse creation without manager successful!"
    WAREHOUSE_ID2=$(echo "$WAREHOUSE_RESPONSE2" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo "Warehouse ID: $WAREHOUSE_ID2"
else
    echo "❌ Warehouse creation without manager failed"
fi

echo ""
echo "🏁 Test Complete!"
echo "================"

if echo "$WAREHOUSE_RESPONSE" | grep -q '"id"' || echo "$WAREHOUSE_RESPONSE2" | grep -q '"id"'; then
    echo "✅ Fix is working! Warehouse creation is successful."
else
    echo "❌ Fix needs more work. Check the error messages above."
fi
