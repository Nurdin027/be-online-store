import db from "@/lib/db";
import {auth} from "@clerk/nextjs";
import {NextResponse} from "next/server";

export async function PATCH(
  req: Request,
  {params}: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const {userId} = auth();
    const body = await req.json();

    const {name} = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }
    if (!name) {
      return new NextResponse("Harus menginput nama", {status: 400});
    }

    if (!storeId) {
      return new NextResponse("Store id dibutuhkan", {status: 400});
    }

    const store = await db.store.updateMany({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}

export async function DELETE(
  req: Request,
  {params}: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const {userId} = auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", {status: 401});
    }

    if (!storeId) {
      return new NextResponse("Store id dibutuhkan", {status: 400});
    }

    const store = await db.store.deleteMany({
      where: {
        id: storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}
