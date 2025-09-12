# 🐍➡️⚛️ Python to Next.js Migration Guide

## Overview
This guide provides step-by-step instructions to completely remove Python dependencies and migrate all backend functionality to Next.js API routes.

## 📋 Current Python Components to Migrate

### 1. Authentication System
- **Files**: `auth_service.py`, `jwt_utils.py`, `password_utils.py`, `middleware.py`
- **Features**: User registration, login, JWT tokens, password hashing, role-based access
- **Migration**: Convert to Next.js API routes + NextAuth.js

### 2. Database Models & Services
- **Files**: `models/user.py`, `models/diagram.py`, `services/diagram_service.py`, `repositories/user_repository.py`
- **Features**: User CRUD, diagram storage, ownership, public/private visibility
- **Migration**: Convert to MongoDB with Mongoose (already configured)

### 3. API Endpoints
- **Files**: `main.py`, `app.py`, `api/auth_routes.py`, `api/diagram_endpoints.py`
- **Features**: REST API for auth and diagrams
- **Migration**: Convert to Next.js API routes in `app/api/`

### 4. Validation & AI Services
- **Files**: `services/validation_service.py`, `services/openai_service.py`, `models/validation_result.py`
- **Features**: Diagram validation, AI analysis, improvement suggestions
- **Migration**: Convert to Next.js API routes with external AI integration

### 5. Admin & Authorization
- **Files**: `services/authorization_service.py`, `services/audit_logger.py`, `middleware/auth.py`
- **Features**: Admin permissions, audit logging, user management
- **Migration**: Convert to Next.js middleware and API routes

## 🗂️ Files to Delete

### Python Backend Files (30 files)
```bash
# Core Python files
auth_service.py
jwt_utils.py
password_utils.py
middleware.py
models.py
exceptions.py
main.py
app.py
database.py
config.py

# API Routes
api/auth_routes.py
api/diagram_endpoints.py

# Models
models/user.py
models/diagram.py
models/diagram_metadata.py
models/validation_result.py

# Services
services/auth_service.py
services/diagram_service.py
services/diagram_storage.py
services/diagram_ai_service.py
services/validation_service.py
services/openai_service.py
services/openai_client.py
services/authorization_service.py
services/audit_logger.py
services/rate_limiter.py
services/errors.py

# Repositories
repositories/user_repository.py

# Middleware
middleware/auth.py

# Config
config/ai_config.py

# Requirements
requirements.txt
```

## 🔄 Migration Steps

### Phase 1: Setup Next.js API Infrastructure

#### 1.1 Install Additional Dependencies
```bash
npm install @types/uuid uuid nanoid
npm install --save-dev @types/nanoid
```

#### 1.2 Create API Route Structure
```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   ├── logout/route.ts
│   └── profile/route.ts
├── diagrams/
│   ├── route.ts (GET, POST)
│   ├── [id]/route.ts (GET, PUT, DELETE)
│   ├── validate/route.ts
│   └── analyze/route.ts
├── admin/
│   ├── users/route.ts
│   ├── audit/route.ts
│   └── stats/route.ts
└── health/route.ts
```

### Phase 2: Migrate Authentication

#### 2.1 User Model (lib/models/User.ts)
```typescript
import mongoose from 'mongoose';

export interface IUser {
  _id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'deleted';
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin', 'super_admin'], default: 'user' },
  status: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
```

#### 2.2 Diagram Model (lib/models/Diagram.ts)
```typescript
import mongoose from 'mongoose';

export interface IDiagram {
  _id: string;
  title: string;
  description?: string;
  content: string;
  type: 'mermaid' | 'custom';
  isPublic: boolean;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

const DiagramSchema = new mongoose.Schema<IDiagram>({
  title: { type: String, required: true },
  description: { type: String },
  content: { type: String, required: true },
  type: { type: String, enum: ['mermaid', 'custom'], default: 'mermaid' },
  isPublic: { type: Boolean, default: false },
  ownerId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Diagram || mongoose.model<IDiagram>('Diagram', DiagramSchema);
```

### Phase 3: Create API Routes

#### 3.1 Authentication Routes
```typescript
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import User from '@/lib/models/User';
import { connectDB } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, username, password, firstName, lastName } = await request.json();
    
    // Validation
    if (!email || !username || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      email,
      username,
      passwordHash,
      firstName,
      lastName
    });
    
    await user.save();
    
    return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

#### 3.2 Diagram Routes
```typescript
// app/api/diagrams/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Diagram from '@/lib/models/Diagram';
import { connectDB } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isPublic = searchParams.get('public') === 'true';
    
    const query: any = {};
    
    if (isPublic) {
      query.isPublic = true;
    } else if (session?.user?.id) {
      query.ownerId = session.user.id;
    } else {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const diagrams = await Diagram.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    return NextResponse.json({ diagrams });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, description, content, type, isPublic } = await request.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    const diagram = new Diagram({
      title,
      description,
      content,
      type: type || 'mermaid',
      isPublic: isPublic || false,
      ownerId: session.user.id
    });
    
    await diagram.save();
    
    return NextResponse.json({ diagram }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### Phase 4: Update Frontend Integration

#### 4.1 Update Diagram Editor
```typescript
// Add save/load functionality to DiagramEditor.tsx
const saveDiagram = async () => {
  try {
    const response = await fetch('/api/diagrams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Diagram ${new Date().toLocaleDateString()}`,
        content: editorState.content,
        type: 'mermaid',
        isPublic: false
      })
    });
    
    if (response.ok) {
      alert('Diagram saved successfully!');
    }
  } catch (error) {
    console.error('Failed to save diagram:', error);
  }
};

const loadDiagram = async (diagramId: string) => {
  try {
    const response = await fetch(`/api/diagrams/${diagramId}`);
    const { diagram } = await response.json();
    
    setEditorState({
      content: diagram.content,
      parsedDiagram: { nodes: [], connections: [], errors: [] },
      isValid: true
    });
  } catch (error) {
    console.error('Failed to load diagram:', error);
  }
};
```

### Phase 5: Migration Commands

#### 5.1 Remove Python Files
```bash
# Delete all Python files
rm -f *.py
rm -rf api/ services/ models/ repositories/ middleware/ config/
rm -f requirements.txt

# Clean up any Python cache
find . -name "*.pyc" -delete
find . -name "__pycache__" -type d -exec rm -rf {} +
```

#### 5.2 Update package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "clean": "rm -rf .next node_modules/.cache"
  }
}
```

#### 5.3 Update Environment Variables
```bash
# .env.local
MONGODB_URI=mongodb://localhost:27017/dd-preview-parser
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

## ✅ Validation Checklist

### Backend Migration
- [ ] All Python files removed
- [ ] Next.js API routes created
- [ ] MongoDB models implemented
- [ ] Authentication working
- [ ] Diagram CRUD operations working

### Frontend Integration
- [ ] Save diagram functionality added
- [ ] Load diagram functionality added
- [ ] User dashboard implemented
- [ ] Admin panel accessible
- [ ] Authentication flow working

### Testing
- [ ] User registration works
- [ ] User login works
- [ ] Diagram saving works
- [ ] Diagram loading works
- [ ] Admin functions work
- [ ] Public/private diagrams work

## 🚀 Expected Outcome

After migration, you'll have:
- ✅ Pure Next.js application (no Python)
- ✅ Full-stack functionality in one codebase
- ✅ MongoDB for data persistence
- ✅ NextAuth.js for authentication
- ✅ API routes for all backend functionality
- ✅ Modern React frontend with TypeScript
- ✅ Simplified deployment (single Next.js app)

## 📝 Notes

1. **Database**: move inmemory for dev and supabase for prod & remove mongoDB(already configured)
2. **Authentication**: Use NextAuth.js (already configured)
3. **API**: Convert to Next.js API routes
4. **Deployment**: Single Next.js application
5. **Testing**: Use existing Jest setup
6. make sure ad dependecies are configured 
7. Create full readMefile 

This migration will result in a cleaner, more maintainable codebase with all functionality in TypeScript/JavaScript.
