export interface Project {
  projectId: number;
  projectName: string;
  createdAt: Date;
  lastSavedAt: Date | null;
  thumbnail: string;
  roles: string[];
}
