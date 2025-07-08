import db from "@/lib/db";
import {DashboardClient} from "@/app/(dashboard)/[storeId]/(routes)/components/client";
import {DashboardColumn} from "@/app/(dashboard)/[storeId]/(routes)/components/columns";
import {format} from "date-fns";

interface DashboardPageProps {
  params: { storeId: string };
}

const formatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  style: "currency",
  currency: "IDR",
});

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

  const report = await db.payment.findMany({
    where: {
      status: 1,
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
          name: x.cart.product.name,
          price: formatter.format(harga),
          intPrice: parseInt(harga),
          quantity: x.cart.quantity,
          total: "0",
        })
      } else {
        let index = hasil.findIndex(item => item.name === x.cart.product.name),
          isi = hasil[index];
        isi['quantity'] += x.cart.quantity
        isi['total'] = formatter.format(isi['quantity'] * isi['intPrice'])
      }
    })
  })
  hasil

  let isian: object[] = [],
    listTanggal = dateList(),
    query = await db.payment.findMany({
      where: {
        status: 1,
        paidAt: {
          gte: listTanggal[0],
          lte: listTanggal[listTanggal.length - 1],
        }
      }
    })
  listTanggal.forEach(v => {
    let sale = 0
    query.forEach(w => {
      if (w.paidAt && format(v, "dd/MM/yy") === format(w.paidAt, "dd/MM/yy")) {
        sale += w.totalPrice
      }
    })
    isian.push({
      tgl: format(v, "dd/MM/yy"),
      sale: sale
    })
  })

  return (
    <div>
      <div className="flex-col">
        <div className="flex-1 space-y-4 p-8 pt-6">
          <DashboardClient data={hasil} dataChart={isian}/>
        </div>
      </div>
    </div>
  )
};

export default DashboardPage;
