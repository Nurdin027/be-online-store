"use client";

import {ColumnDef} from "@tanstack/react-table";
import {CellAction} from "./cell-action";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.
export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  discountPrice: string;
  category: string;
  isFeatured: boolean;
  isArchived: boolean;
  isAvailable: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "isAvailable",
    header: "Available",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "discountPrice",
    header: "Discount Price",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({row}) => <CellAction data={row.original}/>,
  },
];
