export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
}

export const templateCategories: TemplateCategory[] = [
  {
    id: 'sequence',
    name: 'Sequence Diagrams',
    description: 'Interaction diagrams showing how objects communicate'
  },
  {
    id: 'flowchart',
    name: 'Flowcharts',
    description: 'Process flow and decision tree diagrams'
  },
  {
    id: 'class',
    name: 'Class Diagrams',
    description: 'Object-oriented design and relationships'
  },
  {
    id: 'state',
    name: 'State Diagrams',
    description: 'State transitions and system behavior'
  },
  {
    id: 'er',
    name: 'Entity Relationship',
    description: 'Database schema and relationships'
  }
];

export const templateData: DiagramTemplate[] = [
  // Sequence Diagrams
  {
    id: 'basic-sequence',
    name: 'Basic Sequence',
    description: 'Simple interaction between two participants',
    category: 'sequence',
    tags: ['basic', 'interaction'],
    content: `sequenceDiagram
    participant A as Alice
    participant B as Bob
    A->>B: Hello Bob, how are you?
    B-->>A: Great!
    A->>B: See you later!`
  },
  {
    id: 'login-flow',
    name: 'Login Flow',
    description: 'User authentication sequence',
    category: 'sequence',
    tags: ['authentication', 'security'],
    content: `sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as Auth Service
    participant D as Database
    
    U->>F: Enter credentials
    F->>A: Validate credentials
    A->>D: Check user data
    D-->>A: User data
    A-->>F: Auth token
    F-->>U: Login successful`
  },
  
  // Flowcharts
  {
    id: 'basic-flowchart',
    name: 'Basic Flowchart',
    description: 'Simple process flow',
    category: 'flowchart',
    tags: ['process', 'decision'],
    content: `flowchart TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> B
    C --> E[End]`
  },
  {
    id: 'decision-tree',
    name: 'Decision Tree',
    description: 'Complex decision making process',
    category: 'flowchart',
    tags: ['decision', 'logic'],
    content: `flowchart TD
    A[Start] --> B{First Decision}
    B -->|Option 1| C[Process A]
    B -->|Option 2| D[Process B]
    C --> E{Second Decision}
    D --> E
    E -->|Yes| F[Success]
    E -->|No| G[Failure]
    F --> H[End]
    G --> H`
  },
  
  // Class Diagrams
  {
    id: 'basic-class',
    name: 'Basic Class',
    description: 'Simple class with properties and methods',
    category: 'class',
    tags: ['object-oriented', 'class'],
    content: `classDiagram
    class User {
        +String name
        +String email
        +Date createdAt
        +login()
        +logout()
        +updateProfile()
    }`
  },
  {
    id: 'class-relationships',
    name: 'Class Relationships',
    description: 'Classes with inheritance and associations',
    category: 'class',
    tags: ['inheritance', 'relationships'],
    content: `classDiagram
    class Animal {
        +int age
        +String gender
        +isMammal()
        +mate()
    }
    
    class Duck {
        +String beakColor
        +swim()
        +quack()
    }
    
    class Fish {
        -int sizeInFeet
        -canEat()
    }
    
    class Zebra {
        +bool is_wild
        +run()
    }
    
    Animal <|-- Duck
    Animal <|-- Fish
    Animal <|-- Zebra`
  },
  
  // State Diagrams
  {
    id: 'basic-state',
    name: 'Basic State',
    description: 'Simple state machine',
    category: 'state',
    tags: ['state', 'machine'],
    content: `stateDiagram-v2
    [*] --> Still
    Still --> [*]
    
    Still --> Moving
    Moving --> Still
    Moving --> Crash
    Crash --> [*]`
  },
  {
    id: 'user-states',
    name: 'User States',
    description: 'User authentication states',
    category: 'state',
    tags: ['authentication', 'states'],
    content: `stateDiagram-v2
    [*] --> Guest
    Guest --> LoggedIn: login
    LoggedIn --> Guest: logout
    LoggedIn --> Suspended: suspend
    Suspended --> LoggedIn: reactivate
    Suspended --> Guest: logout`
  },
  
  // Entity Relationship
  {
    id: 'basic-er',
    name: 'Basic ER',
    description: 'Simple database schema',
    category: 'er',
    tags: ['database', 'schema'],
    content: `erDiagram
    USER {
        int id PK
        string name
        string email
        datetime created_at
    }
    
    POST {
        int id PK
        string title
        text content
        int user_id FK
        datetime created_at
    }
    
    USER ||--o{ POST : creates`
  },
  {
    id: 'ecommerce-er',
    name: 'E-commerce ER',
    description: 'Online store database schema',
    category: 'er',
    tags: ['ecommerce', 'database'],
    content: `erDiagram
    CUSTOMER {
        int id PK
        string name
        string email
        string phone
    }
    
    ORDER {
        int id PK
        int customer_id FK
        decimal total
        string status
        datetime created_at
    }
    
    PRODUCT {
        int id PK
        string name
        decimal price
        int stock
    }
    
    ORDER_ITEM {
        int id PK
        int order_id FK
        int product_id FK
        int quantity
        decimal price
    }
    
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--o{ ORDER_ITEM : contains
    PRODUCT ||--o{ ORDER_ITEM : "ordered in"`
  }
];


