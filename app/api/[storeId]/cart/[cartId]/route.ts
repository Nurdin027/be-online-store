import db from "@/lib/db";
import {auth} from "@clerk/nextjs";
import {NextResponse} from "next/server";

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*", // Ubah sesuai kebutuhan, misalnya "http://localhost:3000"
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}

export async function PATCH(
  req: Request,
  {params}: { params: Promise<{ cartId: string }> }
) {
  try {
    const {cartId} = await params
    const body = await req.json();
    const {quantity} = body;

    if (!cartId) {
      return new NextResponse("Cart ID dibutuhkan", {status: 400, headers: corsHeaders()});
    }

    if (!quantity || quantity < 1) {
      return new NextResponse("Quantity minimal 1 diperlukan", {status: 400, headers: corsHeaders()});
    }

    const existingCartItem = await db.cart.findFirst({
      where: {
        id: cartId
      },
    });

    if (!existingCartItem) {
      return new NextResponse("Item tidak ditemukan di keranjang", {status: 404, headers: corsHeaders()});
    }

    const updatedCartItem = await db.cart.update({
      where: {
        id: cartId,
      },
      data: {
        quantity,
      },
    });

    return new NextResponse(JSON.stringify(updatedCartItem), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.log("[CART_PATCH]", error);
    return new NextResponse("Internal error", {status: 500, headers: corsHeaders()});
  }
}

export async function DELETE(
  req: Request,
  {params}: { params: Promise<{ cartId: string }> }
) {
  try {
    const {cartId} = await params
    if (!cartId) {
      return new NextResponse("Cart ID dibutuhkan", {status: 400, headers: corsHeaders()});
    }

    const existingCartItem = await db.cart.findFirst({
      where: {
        id: cartId,
      },
    });

    if (!existingCartItem) {
      return new NextResponse("Item tidak ditemukan di keranjang", {status: 404, headers: corsHeaders()});
    }

    await db.cart.delete({
      where: {
        id: cartId,
      },
    });

    return new NextResponse("Item berhasil dihapus", {status: 200, headers: corsHeaders()});
  } catch (error) {
    console.log("[CART_DELETE]", error);
    return new NextResponse("Internal error", {status: 500, headers: corsHeaders()});
  }
}

// Handler untuk menangani request preflight CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}