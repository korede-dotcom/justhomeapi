# 📊 CSV Product Upload Documentation

## 🎯 Overview
The CSV upload functionality allows bulk creation of products for warehouses using a CSV file format.

## 📋 **CSV Format Requirements**

### **Required Headers**
```csv
name,description,price,categoryId,warehouseId,totalStock,availableStock,image
```

### **Header Descriptions**
| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `name` | String | ✅ Yes | Product name |
| `description` | String | ✅ Yes | Product description |
| `price` | Number | ✅ Yes | Product price (in smallest currency unit) |
| `categoryId` | UUID | ✅ Yes | Valid category UUID |
| `warehouseId` | UUID | ✅ Yes | Valid warehouse UUID |
| `totalStock` | Integer | ✅ Yes | Total stock quantity |
| `availableStock` | Integer | ❌ No | Available stock (defaults to totalStock) |
| `image` | URL | ❌ No | Product image URL |

### **Sample CSV Content**
```csv
name,description,price,categoryId,warehouseId,totalStock,availableStock,image
Samsung Galaxy S24,Latest flagship smartphone with advanced camera,850000,f63c62d4-641b-4def-8bbc-eff83e5a7e3e,0bfea97b-f3e7-4ce7-ac88-c498fd45d988,50,50,https://example.com/samsung-s24.jpg
MacBook Pro 16,High-performance laptop for professionals,1200000,f63c62d4-641b-4def-8bbc-eff83e5a7e3e,0bfea97b-f3e7-4ce7-ac88-c498fd45d988,25,20,https://example.com/macbook-pro.jpg
Office Chair,Ergonomic office chair with lumbar support,75000,a1b2c3d4-e5f6-7890-abcd-ef1234567890,0bfea97b-f3e7-4ce7-ac88-c498fd45d988,100,85,https://example.com/office-chair.jpg
```

---

## 🚀 **API Endpoint**

### **Upload CSV**
```http
POST /products/upload-csv
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
- file: <csv_file>
- warehouseId: <warehouse_uuid> (optional - can be overridden by CSV)
```

### **Required Permissions**
- `CEO`
- `Admin` 
- `WarehouseKeeper`

---

## 📝 **Frontend Implementation**

### **HTML Form**
```html
<form enctype="multipart/form-data">
  <input type="file" name="file" accept=".csv" required>
  <input type="hidden" name="warehouseId" value="warehouse-uuid-here">
  <button type="submit">Upload CSV</button>
</form>
```

### **JavaScript/Fetch**
```javascript
const uploadCSV = async (file, warehouseId, token) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('warehouseId', warehouseId);

  const response = await fetch('/products/upload-csv', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return response.json();
};
```

### **React Example**
```jsx
const CSVUpload = () => {
  const [file, setFile] = useState(null);
  const [warehouseId, setWarehouseId] = useState('');
  
  const handleUpload = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('warehouseId', warehouseId);
    
    try {
      const response = await fetch('/products/upload-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      console.log('Upload result:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <input 
        type="file" 
        accept=".csv"
        onChange={(e) => setFile(e.target.files[0])}
        required 
      />
      <input 
        type="text"
        placeholder="Warehouse ID"
        value={warehouseId}
        onChange={(e) => setWarehouseId(e.target.value)}
      />
      <button type="submit">Upload CSV</button>
    </form>
  );
};
```

---

## 📊 **Response Format**

### **Success Response**
```json
{
  "success": true,
  "count": 3,
  "total": 3,
  "products": [
    {
      "id": "product-uuid-1",
      "name": "Samsung Galaxy S24",
      "description": "Latest flagship smartphone with advanced camera",
      "price": 850000,
      "categoryId": "f63c62d4-641b-4def-8bbc-eff83e5a7e3e",
      "warehouseId": "0bfea97b-f3e7-4ce7-ac88-c498fd45d988",
      "totalStock": 50,
      "availableStock": 50,
      "image": "https://example.com/samsung-s24.jpg"
    }
    // ... more products
  ]
}
```

### **Partial Success Response (with errors)**
```json
{
  "success": true,
  "count": 2,
  "total": 3,
  "products": [
    // ... successfully created products
  ],
  "errors": [
    "Row 3: Category with ID invalid-category-id not found"
  ]
}
```

### **Error Response**
```json
{
  "statusCode": 400,
  "message": "Missing required headers: name, price",
  "error": "Bad Request"
}
```

---

## ✅ **Validation Features**

### **1. Header Validation**
- ✅ Checks for required headers
- ✅ Flexible header order
- ✅ Case-sensitive header matching

### **2. Data Validation**
- ✅ Required field validation
- ✅ Data type validation (numbers, UUIDs)
- ✅ Category existence validation
- ✅ Warehouse existence validation

### **3. Error Handling**
- ✅ Row-by-row error reporting
- ✅ Partial success support
- ✅ Detailed error messages
- ✅ Graceful failure handling

### **4. Data Processing**
- ✅ Automatic data type conversion
- ✅ Default value assignment
- ✅ Empty line filtering
- ✅ Whitespace trimming

---

## 🔧 **Advanced Features**

### **1. Warehouse ID Override**
- CSV `warehouseId` takes precedence over form parameter
- Allows mixed warehouse uploads in single CSV

### **2. Available Stock Default**
- If `availableStock` not provided, defaults to `totalStock`
- Supports partial stock allocation

### **3. Optional Image URLs**
- Images can be omitted (will be `null`)
- Supports any valid URL format

### **4. Comprehensive Logging**
- Debug logs for troubleshooting
- Error tracking for failed rows
- Success metrics reporting

---

## 🚨 **Common Issues & Solutions**

### **Issue 1: "Missing required headers"**
**Solution**: Ensure CSV has exact header names (case-sensitive)

### **Issue 2: "Category not found"**
**Solution**: Verify categoryId exists in database

### **Issue 3: "Warehouse not found"**
**Solution**: Verify warehouseId exists in database

### **Issue 4: "Invalid price format"**
**Solution**: Ensure price is a valid number (no currency symbols)

### **Issue 5: "No valid products found"**
**Solution**: Check CSV format and data validity

---

## 🎯 **Best Practices**

1. **Validate IDs First**: Ensure categories and warehouses exist before upload
2. **Test with Small Files**: Start with 1-2 products to verify format
3. **Handle Errors Gracefully**: Check response for partial failures
4. **Use Consistent Formatting**: Keep number formats consistent
5. **Backup Data**: Always backup before bulk operations

---

## 📈 **Performance Notes**

- **Batch Processing**: Products are created in parallel for speed
- **Memory Efficient**: Processes CSV line by line
- **Error Resilient**: Continues processing even if some rows fail
- **Scalable**: Can handle large CSV files efficiently

The CSV upload system is now **production-ready** with comprehensive validation and error handling! 🚀
