import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('test123', 12);
    const testUser = storage.createUser({
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User'
    });

    // Create some test diagrams
    const diagram1 = storage.createDiagram({
      title: 'Sample Sequence Diagram',
      description: 'A basic sequence diagram example',
      content: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A->>B: See you later!`,
      type: 'sequence',
      isPublic: false,
      ownerId: testUser.id
    });

    const diagram2 = storage.createDiagram({
      title: 'Sample Flowchart',
      description: 'A basic flowchart example',
      content: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`,
      type: 'flowchart',
      isPublic: false,
      ownerId: testUser.id
    });

    return NextResponse.json({ 
      message: 'Test data created successfully',
      user: { id: testUser.id, email: testUser.email, name: testUser.name },
      diagrams: [diagram1, diagram2],
      totalUsers: storage.users.length,
      totalDiagrams: storage.diagrams.length
    });
  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Failed to create test data' }, { status: 500 });
  }
}


