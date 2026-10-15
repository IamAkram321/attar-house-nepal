import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, Star } from "lucide-react";
import type { Product } from "@workspace/api-client-react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group relative flex flex-col"
    >
      <Link href={`/product/${product.slug}`} className="block overflow-hidden relative bg-card aspect-4/5 mb-6 border border-border">
        {product.images[0] && (
          <motion.img 
            src={product.images[0]} 
            alt={product.name}
            className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
          />
        )}
        {product.materials && product.materials.length > 0 && (
          <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm px-3 py-1 text-xs uppercase tracking-wider">
            {product.materials[0]}
          </div>
        )}
        
        <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <Link href={`/product/${product.slug}`}>
            <h3 className="font-serif text-xl lg:text-2xl mb-2 group-hover:text-primary transition-colors">{product.name}</h3>
          </Link>
          <span className="text-muted-foreground text-sm uppercase tracking-wider">{product.category}</span>
          {!!product.reviewCount && (
            <div className="flex items-center gap-1 mt-1.5">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" />
              <span className="text-xs text-muted-foreground">
                {Number(product.rating).toFixed(1)} ({product.reviewCount})
              </span>
            </div>
          )}
        </div>
        <span className="font-medium text-lg">Rs. {product.price.toFixed(2)}</span>
      </div>
    </motion.div>
  );
}