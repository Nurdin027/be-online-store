import {NextResponse} from "next/server";
import db from "@/lib/db";
import {auth, clerkClient} from "@clerk/nextjs";
import {format} from 'date-fns'
import axios from "axios";

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

export async function POST(req: Request, {params}: { params: Promise<{ storeId: string }> }) {
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

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders(),
  });
}

function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
}