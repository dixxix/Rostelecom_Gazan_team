export type UserRole = 'admin' | 'analyst' | 'user';

export type ProjectStage = 
  | 'Идея' 
  | 'Планирование' 
  | 'Разработка' 
  | 'Тестирование' 
  | 'Внедрение' 
  | 'Завершён';

export type ProjectSegment = 'B2B' | 'B2C' | 'B2G';

export type ServiceType = 
  | 'Интернет' 
  | 'Телевидение' 
  | 'Телефония' 
  | 'Облачные услуги' 
  | 'Кибербезопасность';

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt: string;
  lastLogin?: string;
}

export interface MonthlyFinance {
  month: string;
  revenue: number;
  costs: number;
  profit: number;
}

export interface ProjectHistory {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  field?: string;
  oldValue?: string;
  newValue?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stage: ProjectStage;
  segment: ProjectSegment;
  services: ServiceType[];
  startDate: string;
  endDate?: string;
  manager: string;
  team: string[];
  budget: number;
  spent: number;
  monthlyFinances: MonthlyFinance[];
  history: ProjectHistory[];
  isFavorite?: boolean;
  isProblematic?: boolean;
  rating?: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface DashboardMetrics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  profitMargin: number;
  problematicProjects: number;
}

export interface ProjectsByStage {
  stage: ProjectStage;
  count: number;
  color: string;
}

export interface ProjectsBySegment {
  segment: ProjectSegment;
  count: number;
  color: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  pending2FA: boolean;
  tempUsername?: string;
}
