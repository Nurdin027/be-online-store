import db from "@/lib/db";
import {ProductForm} from "./components/product-form";

const ProductPage = async ({
                             params
                           }: {
  params: Promise<{ productId: string, storeId: string }>
}) => {
  const {productId, storeId} = await params,
    product = await db.product.findUnique({
      where: {
        id: productId
      },
      include: {
        images: true,
      },
    })

  const categories = await db.category.findMany({
    where: {
      storeId: storeId
    }
  })

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm initialData={product} categories={categories}/>
      </div>
    </div>
  );
}

export default ProductPage;