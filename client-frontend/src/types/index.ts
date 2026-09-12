export interface UserProfile {
  companyName?: string;
  industry?: string;
  website?: string;
  title?: string; // Freelancer role title
  skills?: string[];
  experienceYears?: number;
  portfolioUrl?: string;
  rating?: number;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'CLIENT' | 'FREELANCER';
  phone?: string;
  profile?: UserProfile;
}

export interface ProjectFreelancer {
  id: string;
  freelancerId: string;
  projectId: string;
  freelancer: User;
  assignedAt: string;
}

export interface ProjectAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  projectId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  budget: string | number;
  status: 'PUBLISHED' | 'ONGOING' | 'COMPLETED';
  timeline?: string;
  clientId: string;
  client: User;
  freelancers: ProjectFreelancer[];
  assets: ProjectAsset[];
  createdAt: string;
  updatedAt: string;
}

// UI specific mapped types
export interface UIProject {
  id: string;
  name: string;
  amount: string;
  approaches: number;
  postedDate: string;
}
