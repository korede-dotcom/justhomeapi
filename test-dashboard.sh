#!/bin/bash

# Test Dashboard Endpoint
echo "Testing Dashboard Endpoint..."
echo "=============================="

# Get JWT token first
echo "Getting JWT token..."
TOKEN=$(curl -s -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }' | jq -r '.access_token')

if [ "$TOKEN" = "null" ] || [ -z "$TOKEN" ]; then
  echo "Failed to get JWT token. Please check your credentials."
  exit 1
fi

echo "Token obtained successfully!"

# Test the dashboard endpoint
echo ""
echo "Fetching dashboard statistics..."
curl -s -X GET http://localhost:4000/warehouses/dashboard \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq '.'

echo ""
echo "Dashboard endpoint test completed!"
