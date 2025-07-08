import {NextResponse} from "next/server";
import db from "@/lib/db";
import axios from "axios";

export async function POST(req: Request, {params}: { params: { paymentCode: string } }) {
  try {
    const body = await req.json()
    let signature_key = body.signature_key,
      transaction_status = body.transaction_status,
      payment = {}
    if (body.order_id === params.paymentCode && transaction_status === "settlement") {
      let keybase64 = Buffer.from(process.env.MT_SERVER_KEY + ":").toString("base64"),
        header = {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': 'Basic ' + keybase64,
        }
      await axios.get(`https://api.sandbox.midtrans.com/v2/${body.order_id}/status`, {headers: header}).then(async res => {
        let test_sig_key = res.data.signature_key,
          test_order_id = res.data.order_id
        if (signature_key == test_sig_key && params.paymentCode == test_order_id) {
          payment = await db.payment.update({
            where: {paymentCode: params.paymentCode},
            data: {
              status: 1,
              paidAt: new Date()
            }
          })
          return new NextResponse(JSON.stringify({payment: payment}), {
            status: 200,
          });
        }
      }).catch(err => {
        console.log("Error: ", err)
      })
    }
    return new NextResponse(JSON.stringify("Waiting"), {
      status: 200,
    });
  } catch (error) {
    console.log("[PAYMENTS_POST]", error);
    return new NextResponse("Internal error", {status: 500});
  }
}