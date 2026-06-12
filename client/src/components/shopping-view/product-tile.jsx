import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { brandOptionsMap, categoryOptionsMap } from "@/config";
import { Badge } from "../ui/badge";

function ShoppingProductTile({
  product,
  handleGetProductDetails,
  handleAddtoCart,
}) {
  return (
    <div className="group relative transition-all duration-300">
      <div
        onClick={() => handleGetProductDetails(product?._id)}
        className="cursor-pointer"
      >
        <div className="relative overflow-hidden bg-gray-100 mb-4">
          <img
            src={product?.image}
            alt={product?.title}
            className="w-full h-[350px] object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {product?.totalStock === 0 ? (
            <Badge className="absolute top-4 left-4 bg-muted text-muted-foreground rounded-none uppercase text-[10px] tracking-widest px-3 py-1">
              Out Of Stock
            </Badge>
          ) : product?.totalStock < 10 ? (
            <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground rounded-none uppercase text-[10px] tracking-widest px-3 py-1">
              {`Only ${product?.totalStock} left`}
            </Badge>
          ) : product?.salePrice > 0 ? (
            <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground rounded-none uppercase text-[10px] tracking-widest px-3 py-1">
              Sale
            </Badge>
          ) : null}

          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        <div className="flex flex-col items-center text-center px-2">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
            {brandOptionsMap[product?.brand]}
          </span>
          <h3 className="text-base font-medium text-foreground mb-2 truncate w-full">
            {product?.title}
          </h3>
          <div className="flex items-center gap-3">
            {product?.salePrice > 0 ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  ${product?.price}
                </span>
                <span className="text-base font-bold text-primary">
                  ${product?.salePrice}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-primary">
                ${product?.price}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        {product?.totalStock === 0 ? (
          <Button className="w-full bg-muted text-muted-foreground rounded-none cursor-not-allowed uppercase text-xs font-bold tracking-widest py-6">
            Out Of Stock
          </Button>
        ) : (
          <Button
            onClick={() => handleAddtoCart(product?._id, product?.totalStock)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none uppercase text-xs font-bold tracking-widest py-6"
          >
            Add to cart
          </Button>
        )}
      </div>
    </div>
  );
}

export default ShoppingProductTile;
