import db from "@/lib/db";
import {DashboardClient} from "@/app/(dashboard)/[storeId]/(routes)/components/client";
import {DashboardColumn} from "@/app/(dashboard)/[storeId]/(routes)/components/columns";
import {format} from "date-fns";
import {formatter} from "@/lib/utils";

interface DashboardPageProps {
  params: Promise<{ storeId: string }>;
}

const DashboardPage = async ({params}: DashboardPageProps) => {

  function dateList(endDate = null) {
    let sekarang = endDate ? new Date(endDate) : new Date(),
      startDate = new Date(new Date().setDate(sekarang.getDate() - 7)),
      listna = []
    while (startDate < sekarang) {
      listna.push(startDate)
      startDate = new Date(startDate.setDate(startDate.getDate() + 1))
    }
    return listna;
  }

  const {storeId} = await params
  const report = await db.payment.findMany({
    where: {
      status: 1,
      storeId: storeId,
      paidAt: {not: null}
    },
    orderBy: {
      paymentCode: 'desc'
    },
    include: {
      DetailPayment: {
        include: {
          cart: {
            include: {
              product: true
            }
          }
        }
      }
    }
  });

  let ada: string[] = [],
    hasil: DashboardColumn[] = []
  report.forEach((v) => {
    v.DetailPayment.forEach((x) => {
      if (!ada.includes(x.cart.product.name)) {
        ada.push(x.cart.product.name)
        let harga = x.cart.product.price
        // @ts-ignore
        if (x.cart.product.discountPrice > 0) {
          // @ts-ignore
          harga = x.cart.product.discountPrice
        }
        hasil.push({
          paidAt: format(v.paidAt || "", "dd-MM-yyyy"),
          customer_name: v.customer_name,
          name: x.cart.product.name,
          quantity: x.cart.quantity,
          // @ts-ignore
          price: formatter.format(harga),
          // @ts-ignore
          total: formatter.format(harga * x.cart.quantity),
          // @ts-ignore
          intPrice: parseInt(harga),
        })
      } else {
        let index = hasil.findIndex(item => item.name === x.cart.product.name),
          isi = hasil[index];
        isi['quantity'] += x.cart.quantity
        isi['total'] = formatter.format(isi['quantity'] * isi['intPrice'])
      }
    })
  })

  return (
    <div>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          {/*@ts-ignore*/}
          <DashboardClient data={hasil}/>
        </div>
      </div>
    </div>
  )
};

export default DashboardPage;
