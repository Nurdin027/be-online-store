import db from "@/lib/db";
import {ProductClient} from "./components/client";
import {ProductColumn} from "./components/columns";

import {format} from "date-fns";
import {formatter} from "@/lib/utils";

const ProductsPage = async ({params}: { params: Promise<{ storeId: string }> }) => {
  const {storeId} = await params,
    products = await db.product.findMany({
      where: {
        storeId: storeId,
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    isAvailable: item.isAvailable,
    price: formatter.format(item.price.toNumber()),
    // @ts-ignore
    discountPrice: item.discountPrice?.toNumber() !== 0 ? formatter.format(item.discountPrice?.toNumber()) : "-",
    category: item.category.name,
    createdAt: format(item.createdAt, "MMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts}/>
      </div>
    </div>
  );
};

export default ProductsPage;
