# 🏢 Admin Subdomain Setup Guide

## 🎯 **Overview**

Create a separate admin subdomain for managing all clients without affecting the main client interface.

**Main App:** `ui.goshawkai.com` (for clients)  
**Admin Panel:** `admin.goshawkai.com` (for you to manage clients)

## 🚀 **What You'll Get**

### **Admin Features:**
- ✅ **Client Management** - Add, edit, delete clients
- ✅ **User Management** - Create user accounts for clients
- ✅ **Credential Management** - Update Google Sheets, Retell, n8n configs
- ✅ **Webhook Testing** - Test all client webhooks
- ✅ **Analytics Dashboard** - Overview of all clients
- ✅ **Real-time Monitoring** - Live status of all systems

### **Security:**
- ✅ **Separate Authentication** - Admin-only access
- ✅ **Role-based Access** - Different admin levels
- ✅ **Audit Logging** - Track all admin actions
- ✅ **Secure API** - Admin-only endpoints

## 🔧 **Implementation Options**

### **Option 1: Same Vercel Project (Recommended)**
- Use Vercel's subdomain routing
- Single codebase, different routes
- Easier to maintain and deploy

### **Option 2: Separate Vercel Project**
- Completely separate admin app
- More isolation but more complex
- Requires separate deployment

## 📋 **Admin Features Breakdown**

### **1. Client Management**
- List all clients with status
- Add new clients with full setup
- Edit client configurations
- Delete clients (with confirmation)
- Bulk operations

### **2. User Management**
- Create user accounts for clients
- Reset passwords
- Manage user permissions
- Link users to companies

### **3. Integration Management**
- Google Sheets configuration
- Retell workflow setup
- n8n webhook configuration
- Test all integrations

### **4. Monitoring & Analytics**
- Real-time client status
- Webhook success rates
- System health monitoring
- Usage analytics

### **5. System Administration**
- Database management
- Environment configuration
- Backup and restore
- System logs

## 🎨 **Admin UI Design**

### **Dashboard Layout:**
```
┌─────────────────────────────────────────┐
│ Admin Header (Logo, User, Notifications)│
├─────────────────────────────────────────┤
│ Sidebar │ Main Content Area             │
│         │                               │
│ • Dashboard                             │
│ • Clients                               │
│ • Users                                 │
│ • Integrations                          │
│ • Analytics                             │
│ • Settings                              │
│         │                               │
└─────────────────────────────────────────┘
```

### **Client Management Page:**
```
┌─────────────────────────────────────────┐
│ Clients Management                      │
├─────────────────────────────────────────┤
│ [+ Add New Client] [Search] [Filter]    │
├─────────────────────────────────────────┤
│ Client List Table:                      │
│ • Company Name                          │
│ • User Email                            │
│ • Status (Active/Inactive)              │
│ • Last Activity                         │
│ • Actions (Edit/Delete/Test)            │
└─────────────────────────────────────────┘
```

## 🔐 **Security Implementation**

### **Authentication:**
- Admin-only login system
- Multi-factor authentication
- Session management
- Password policies

### **Authorization:**
- Role-based access control
- Permission levels
- API endpoint protection
- Audit logging

### **Data Protection:**
- Encrypted credentials storage
- Secure API communication
- Input validation
- SQL injection prevention

## 🚀 **Deployment Strategy**

### **Vercel Configuration:**
```json
{
  "rewrites": [
    {
      "source": "/admin/(.*)",
      "destination": "/admin/$1"
    }
  ],
  "headers": [
    {
      "source": "/admin/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

### **Environment Variables:**
```env
# Admin-specific
ADMIN_SECRET_KEY=your-admin-secret
ADMIN_SESSION_SECRET=your-session-secret
ADMIN_DEFAULT_EMAIL=admin@yourcompany.com

# Database (shared)
DATABASE_URL=your-database-url

# Google Sheets (shared)
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key
```

## 📊 **Database Schema Updates**

### **Admin Users Table:**
```sql
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL, -- 'SUPER_ADMIN', 'ADMIN', 'MANAGER'
  permissions JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Audit Logs Table:**
```sql
CREATE TABLE audit_logs (
  id TEXT PRIMARY KEY,
  admin_user_id TEXT REFERENCES admin_users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎯 **Next Steps**

1. **Choose Implementation Option** (Same project vs Separate)
2. **Set up Vercel subdomain routing**
3. **Create admin authentication system**
4. **Build admin dashboard components**
5. **Implement client management features**
6. **Add monitoring and analytics**
7. **Deploy and test**

## 💡 **Benefits**

- ✅ **Complete Separation** - Admin and client interfaces are separate
- ✅ **Better Security** - Admin access is isolated
- ✅ **Easier Management** - All client operations in one place
- ✅ **Scalable** - Can handle unlimited clients
- ✅ **Professional** - Clean, dedicated admin interface
- ✅ **Audit Trail** - Track all admin actions

Would you like me to implement this admin subdomain system for you?
