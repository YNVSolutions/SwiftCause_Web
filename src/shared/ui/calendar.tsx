"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "./utils";
import { buttonVariants } from "./button";

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-0 min-h-[250px]", className)}

      classNames={{
        months: "flex flex-col space-y-4",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center px-10",
        caption_label: "text-sm font-medium",

        nav: "flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 absolute"
        ),
        nav_button_previous: "left-1",
        nav_button_next: "right-1",

        table: "w-full border-collapse space-y-1",

        weekdays: "flex",
        weekday:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",

        weeks: "flex flex-col",
        week: "flex w-full mt-2",

        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),

        day_selected:
          "bg-indigo-600 text-white hover:bg-indigo-700 focus:bg-indigo-600",

        day_today:
          "bg-accent text-accent-foreground rounded-md border border-border",

        day_outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50",

        day_disabled: "text-muted-foreground opacity-50",
        day_hidden: "invisible",

        ...classNames,
      }}
    components={{
  Chevron: ({ orientation, ...props }) => {
    const Icon = orientation === "left" ? ChevronLeft : ChevronRight
    return <Icon className="h-4 w-4" {...props} />
  },
}}
      {...props}
    />
  );
}

export { Calendar };
