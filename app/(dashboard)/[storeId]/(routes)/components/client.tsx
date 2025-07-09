"use client";

import {Heading} from "@/components/ui/heading";
import {Separator} from "@/components/ui/separator";
import {useParams, useRouter} from "next/navigation";
import {DataTable} from "@/components/ui/data-table";
import {columns, DashboardColumn} from "@/app/(dashboard)/[storeId]/(routes)/components/columns";
import {Label} from "@/components/ui/label";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Button} from "@/components/ui/button";
import {ChevronDownIcon} from "lucide-react";
import {Calendar} from "@/components/ui/calendar";
import {useState} from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface DashboardClientProps {
  data: [DashboardColumn]
}

export const DashboardClient: React.FC<DashboardClientProps> = ({data}) => {
  const router = useRouter();
  const params = useParams();

  const [open, setOpen] = useState(false)
  const [date, setDate] = useState<Date | undefined>(undefined)
  let filterTgl = false

  // const searchParams = useSearchParams()
  // console.log(searchParams.get("date"))

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={`Dashboard`} description="Dashboard Toko"/>
      </div>
      <Separator/>
      <Card>
        <CardHeader>
          <CardTitle>Report</CardTitle>
          <CardDescription>Product Sold</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable data={data} columns={columns} searchKey="name"/>
        </CardContent>
      </Card>
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
