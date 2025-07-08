import db from "@/lib/db";
import {auth} from "@clerk/nextjs";
import {NextResponse} from "next/server";

export async function GET(
  req: Request,
  {params}: { params: Promise<{ productId: string }> }
) {
  try {
    const {productId} = await params
    if (!productId) {
      return new NextResponse("Product id dibutuhkan", {status: 400});
    }

    const product = await db.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        category: true
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}

export async function PATCH(
  req: Request,
  {params}: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const {storeId, productId} = await params
    const {userId} = auth();
    const body = await req.json();

    const {name, description, price, discountPrice, categoryId, images, isFeatured, isArchived, isAvailable} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!name) {
      return new NextResponse("Nama perlu diinput", {status: 400});
    }

    if (!images || !images.length) {
      return new NextResponse("Image perlu diinput", {status: 400});
    }

    if (!price) {
      return new NextResponse("Harga perlu diinput", {status: 400});
    }

    if (!categoryId) {
      return new NextResponse("Kategori perlu diinput", {status: 400});
    }

    if (!productId) {
      return new NextResponse("Product id dibutuhkan", {status: 400});
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {status: 403});
    }

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        description,
        price,
        discountPrice,
        isFeatured,
        isArchived,
        isAvailable,
        categoryId,
        images: {
          deleteMany: {},
        },
      },
    });

    const product = await db.product.update({
      where: {
        id: productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}

export async function DELETE(
  req: Request,
  {params}: { params: Promise<{ storeId: string; productId: string }> }
) {
  try {
    const {storeId, productId} = await params
    const {userId} = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!productId) {
      return new NextResponse("Product id dibutuhkan", {status: 400});
    }

    const storeByUserId = await db.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {status: 403});
    }

    const product = await db.product.deleteMany({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}
