import type { ProductDto } from "@/types/product";
import ProductCard from "@/components/products/ProductCard";

interface ProductGridProps {
  products: ProductDto[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
      {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 4} />)}
    </div>
  );
}