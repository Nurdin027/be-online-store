"use client";

import {Heading} from "@/components/ui/heading";
import {Separator} from "@/components/ui/separator";
import {useParams, useRouter, useSearchParams} from "next/navigation";
import {DataTable} from "@/components/ui/data-table";
import {columns, DashboardColumn} from "@/app/(dashboard)/[storeId]/(routes)/components/columns";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {useState} from "react";


import {Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"


interface DashboardClientProps {
  data: [DashboardColumn],
  dataChart: [object]
}

const formatter = new Intl.NumberFormat("id-ID", {
  minimumFractionDigits: 0,
  style: "currency",
  currency: "IDR",
});


const custLblY = (n: any) => {
  if (n > 1000000000) {
    return `${n / 1000000000}B`
  } else if (n > 1000000) {
    return `${n / 1000000}M`
  } else if (n > 1000) {
    return `${n / 1000}K`
  } else {
    return n
  }
}
const custLbl = (props: any) => {
  const {x, y, width, value} = props,
    radius = 10;
  return (
    <g>
      <text x={x + width / 2} y={y - radius} fill="#000" textAnchor="middle" dominantBaseline="middle">
        {value ? formatter.format(value) : ''}
      </text>
    </g>
  );
};

export const DashboardClient: React.FC<DashboardClientProps> = ({data, dataChart}) => {
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  let filterTgl = false

  const chartConfig = {
    sale: {
      label: "Sale",
      color: "#2563eb",
    },
  }
  const searchParams = useSearchParams()
  console.log(searchParams.get("date"))

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Dashboard`} description="Dashboard Toko"/>
      </div>
      <Separator/>
      <div className="grid grid-cols-2 gap-5">
        <Card>
          <CardHeader>
            <CardTitle>Store</CardTitle>
            <CardDescription>Weekly Report</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart
                accessibilityLayer
                data={dataChart}
                margin={{
                  top: 20,
                }}
              >
                <CartesianGrid vertical={false}/>
                <XAxis
                  dataKey="tgl"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                  tickFormatter={(value) => value}
                />
                <YAxis tickFormatter={custLblY}/>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel/>}
                />
                <Bar dataKey="sale" fill="var(--color-sale)" radius={8}>
                  <LabelList
                    position="top"
                    offset={12}
                    className="fill-foreground"
                    fontSize={12}
                    dataKey="sale"
                    content={custLbl}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>&nbsp;</CardTitle>
            <CardDescription>Product Sold</CardDescription>
          </CardHeader>
          <CardContent>
            <DataTable data={data} columns={columns} searchKey="name"/>
          </CardContent>
        </Card>
      </div>
      <Separator/>
      {(filterTgl) && (
        <div className="flex flex-col gap-3">
          <Label htmlFor="date" className="px-1">
            Filter Date
          </Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className="w-48 justify-between font-normal"
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon/>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                captionLayout="dropdown"
                onSelect={(date) => {
                  setDate(date)
                  setOpen(false)
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

    </>
  );
};
