import {auth, clerkClient} from "@clerk/nextjs";
import {NextResponse} from "next/server";
import db from "@/lib/db";
import axios from "axios";
import {format} from "date-fns";

export async function POST(
  req: Request,
  {params}: { params: Promise<{ storeId: string }> }
) {
  try {
    const {storeId} = await params
    const body = await req.json();
    const {userId, productId, quantity} = body;

    if (!userId) {
      return new NextResponse("Unauthorized", {status: 401, headers: corsHeaders()});
    }

    if (!productId) {
      return new NextResponse("Product ID perlu diinput", {status: 400, headers: corsHeaders()});
    }

    if (!quantity || quantity < 1) {
      return new NextResponse("Quantity minimal 1 diperlukan", {status: 400, headers: corsHeaders()});
    }

    if (!storeId) {
      return new NextResponse("Store ID di URL dibutuhkan", {status: 400, headers: corsHeaders()});
    }

    // Cek apakah store tersebut milik user yang sedang login
    const storeByUserId = await db.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", {status: 403, headers: corsHeaders()});
    }

    // Cek apakah produk sudah ada di cart
    const existingCartItem = await db.cart.findFirst({
      where: {
        userId,
        productId,
        storeId: storeId,
      },
    });

    if (existingCartItem) {
      return new NextResponse("Produk sudah ada di keranjang", {status: 400, headers: corsHeaders()});
    }

    // Tambahkan produk ke cart
    const cartItem = await db.cart.create({
      data: {
        userId,
        productId,
        quantity,
        storeId: storeId,
      },
    });

    return new NextResponse(JSON.stringify(cartItem), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.log("[CART_POST]", error);
    return new NextResponse("Internal error", {status: 500, headers: corsHeaders()});
  }
}

// Fungsi untuk menambahkan header CORS
function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*", // Bisa diganti "http://localhost:3000" untuk lebih spesifik
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

export async function GET(req: Request, {params}: { params: Promise<{ storeId: string }> }) {
  try {
    const {storeId} = await params
    const {searchParams} = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return new NextResponse("User ID diperlukan dalam query params", {status: 400, headers: corsHeaders()});
    }

    if (!storeId) {
      return new NextResponse("Store ID di URL dibutuhkan", {status: 400, headers: corsHeaders()});
    }

    // Ambil data cart berdasarkan userId dan storeId
    const cartItems = await db.cart.findMany({
      where: {
        userId,
        storeId: storeId,
      },
      include: {
        product: true, // Termasuk informasi produk
      },
    });

    return new NextResponse(JSON.stringify(cartItems), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.log("[CART_GET]", error);
    return new NextResponse("Internal error", {status: 500, headers: corsHeaders()});
  }
}


function randomString(length: number) {
  let res = format(new Date(), "yyMMddHHmmss")
  res += [...Array(length + 10)].map((value) => (Math.random() * 1000000).toString(36).replace('.', '')).join('').substring(0, length);
  return res
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  discountPrice: number;
  quantity: number;
  image?: string;
  subtotal: number;
}

export async function PUT(req: Request, {params}: { params: Promise<{ storeId: string }> }) {
  try {
    const {storeId} = await params
    const body = await req.json();
    const {userId, customerName, customerPhone, customerAddress, cart} = body;

    if (!userId) {
      return new NextResponse("Unauthorized", {status: 401});
    } else {
      try {
        await clerkClient.users.getUser(userId)
      } catch (err) {
        console.error(err);
        return new NextResponse("Unauthorized", {status: 401});
      }
    }
    if (!customerName) {
      return new NextResponse("Nama perlu diinput", {status: 400});
    }
    if (!customerPhone) {
      return new NextResponse("Nomor HP perlu diinput", {status: 400});
    }
    if (!customerAddress) {
      return new NextResponse("Alamat perlu diinput", {status: 400});
    }
    if (!cart || !cart.length) {
      return new NextResponse("Keranjang kosong", {status: 400});
    }

    let paymentCode = randomString(6).toUpperCase(),
      totalPrice = 0,
      names = customerName.split(" "),
      token = "",
      redirect = "",
      items_detail: object[] = []
    cart.forEach(function (v: CartItem) {
      let myCart = db.cart.findFirst({
        where: {userId, id: v.id},
        include: {
          product: true,
        },
      })
      if (!myCart) {
        return new NextResponse("Data keranjang tidak ditemukan", {status: 400});
      }
      totalPrice += (v.quantity * (v.discountPrice || v.price))
      items_detail.push({
        id: v.id,
        name: v.name,
        quantity: v.quantity,
        price: v.discountPrice || v.price,
        totalPrice: v.quantity * (v.discountPrice || v.price),
      })
    })

    let msg = `Halo,+saya+ingin+mengkonfirmasi+pesanan+dengan+nomor+pesanan:+*${paymentCode}*`,
      payload = {
        "transaction_details": {
          "order_id": paymentCode,
          "gross_amount": totalPrice
        },
        "customer_details": {
          "first_name": names[0],
          "last_name": names[1] || "-",
          "email": "user@example.com",
          "phone": customerPhone
        },
        "item_details": items_detail,
        "callbacks": {
          "finish": `https://wa.me/${process.env.NEXT_PUBLIC_PHONE_NUMBER}?text=${encodeURI(msg)}`
        }
      },
      keybase64 = Buffer.from(process.env.MT_SERVER_KEY + ":").toString("base64"),
      header = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Basic ' + keybase64,
        'X-Override-Notification': `${process.env.CALLBACK_URL}/api/${storeId}/payment/${paymentCode}`,
      }
    await axios.post("https://app.sandbox.midtrans.com/snap/v1/transactions", payload, {headers: header}).then(res => {
      token = res.data.token
      redirect = res.data.redirect_url
    }).catch(error => {
      console.error(error.response.data);
      return new NextResponse(`Payment gateway error: (${error.response.data.error_messages})`, {status: 500});
    });

    const purchase = await db.payment.create({
      data: {
        userId,
        paymentCode,
        totalPrice,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        snap_token: token,
        redirect_url: redirect,
      }
    })
    cart.map(async function (c: CartItem) {
      await db.detailPayment.create({
        data: {
          paymentId: purchase.id, cartId: c.id
        }
      })
    });

    return new NextResponse(JSON.stringify({
      status: "success",
      redirect: redirect,
      token: token,
      purchase: purchase
    }), {
      status: 200,
      headers: corsHeaders(),
    });
  } catch (error) {
    console.log("[PAYMENTS_POST]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}