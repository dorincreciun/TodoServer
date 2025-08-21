const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Verifică dacă openapi-typescript este instalat
try {
  require.resolve('openapi-typescript');
} catch (e) {
  console.error('❌ openapi-typescript nu este instalat. Instalează-l cu: npm install -D openapi-typescript');
  process.exit(1);
}

// Creează directorul types dacă nu există
const typesDir = path.join(__dirname, '..', 'types');
if (!fs.existsSync(typesDir)) {
  fs.mkdirSync(typesDir, { recursive: true });
}

// Generează tipurile din serverul local
console.log('🔄 Generarea tipurilor TypeScript din documentația OpenAPI...');

try {
  // Generează tipurile din serverul local
  execSync('npx openapi-typescript http://localhost:3000/api-docs.json -o types/api-types.ts', {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Tipurile TypeScript au fost generate cu succes în types/api-types.ts');
  
  // Creează un fișier index.ts pentru export
  const indexContent = `// Tipuri generate automat din documentația OpenAPI
export * from './api-types';

// Tipuri utilitare pentru API
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  todos: T[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface TodoStats {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  cancelled: number;
  overdue: number;
  completionRate: number;
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
}

// Tipuri pentru request-uri
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface TodoCreateRequest {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface TodoUpdateRequest {
  title?: string;
  description?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Tipuri pentru query parameters
export interface TodoQueryParams {
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dateFilter?: 'today' | 'week' | 'two_weeks' | 'month' | 'overdue';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'title' | 'priority' | 'dueDate' | 'status' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}
`;

  fs.writeFileSync(path.join(typesDir, 'index.ts'), indexContent);
  console.log('✅ Fișierul index.ts a fost creat cu succes');
  
} catch (error) {
  console.error('❌ Eroare la generarea tipurilor:', error.message);
  console.log('💡 Asigură-te că serverul rulează pe http://localhost:3000');
  process.exit(1);
} 