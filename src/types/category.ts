export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  sortOrder: number;
  active: boolean;
  productCount?: number;
}