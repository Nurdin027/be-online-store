"use client"

import {ColumnDef} from "@tanstack/react-table"


export type DashboardColumn = {
  paidAt: string
  customer_name: string
  name: string
  quantity: number
  price: string
  intPrice: number
  total: string
}

export const columns: ColumnDef<DashboardColumn>[] = [
  {
    accessorKey: "paidAt",
    header: "Tanggal",
  },
  {
    accessorKey: "customer_name",
    header: "Nama Pembeli",
  },
  {
    accessorKey: "name",
    header: "Nama Produk",
  },
  {
    accessorKey: "quantity",
    header: "Jumlah",
  },
  {
    accessorKey: "price",
    header: "Sold Price",
  },
  {
    accessorKey: "total",
    header: "Sub Total",
  },
]
