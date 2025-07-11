import {auth} from "@clerk/nextjs";
import {NextResponse} from "next/server";
import db from "@/lib/db";

export async function POST(
  req: Request,
  {params}: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const {userId} = auth();
    const body = await req.json();

    const {name, price, discountPrice, description, categoryId, images, isFeatured, isArchived, isAvailable} = body;

    if (!userId) {
      return new NextResponse("Unauthorized", {status: 401});
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

    if (!storeId) {
      return new NextResponse("Store id URL dibutuhkan");
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

    const product = await db.product.create({
      data: {
        name,
        description,
        price,
        discountPrice,
        categoryId,
        isFeatured,
        isArchived,
        isAvailable,
        storeId: storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}

export async function GET(
  req: Request,
  {params}: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const {searchParams} = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!storeId) {
      return new NextResponse("Store id URL dibutuhkan");
    }

    const products = await db.product.findMany({
      where: {
        storeId: storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}
