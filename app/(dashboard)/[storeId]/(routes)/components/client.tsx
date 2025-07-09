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
import {formatter} from "@/lib/utils";
import MyChartComponent from "@/components/ui/newChart";

interface DashboardClientProps {
  data: [DashboardColumn],
  dataChart: [object]
}

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

  // const searchParams = useSearchParams()
  // console.log(searchParams.get("date"))

  let isiChart = {
    labels: dataChart.map(v => v.tgl),
    datasets: [
      {
        label: 'Sale',
        data: dataChart.map(v => v.sale),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

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
            <MyChartComponent data={isiChart}/>
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
      <Separator/>
    </>
  );
};
