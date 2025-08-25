export class AccessibleProjectDto {
  projectId: number;
  projectName: string;
  createdAt: Date;
  lastSavedAt: Date | null;
  thumbnail: string; // thumbnail base64 (optionally we can return url, but then we need public access on s3)
  roles: string[];
}
