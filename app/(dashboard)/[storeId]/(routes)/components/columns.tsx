"use client"

import {ColumnDef} from "@tanstack/react-table"


export type DashboardColumn = {
  name: string
  price: string
  intPrice: number
  quantity: number
  total: string
}

export const columns: ColumnDef<DashboardColumn>[] = [
  {
    accessorKey: "name",
    header: "Product Name",
  },
  {
    accessorKey: "price",
    header: "Sold Price",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
]
