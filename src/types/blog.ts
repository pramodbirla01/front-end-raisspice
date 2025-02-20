export interface Blog {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
  title: string;
  subtitle: string;
  headerImage: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}
