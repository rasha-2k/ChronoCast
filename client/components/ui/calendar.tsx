import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("cc-calendar", className)}
      classNames={{
        months: "cc-calendar-months",
        month: "cc-calendar-month",
        caption: "cc-calendar-caption",
        caption_label: "cc-calendar-caption-label",
        nav: "cc-calendar-nav",
        nav_button: "cc-calendar-nav-btn",
        nav_button_previous: "cc-calendar-nav-btn-prev",
        nav_button_next: "cc-calendar-nav-btn-next",
        table: "cc-calendar-table",
        head_row: "cc-calendar-head-row",
        head_cell: "cc-calendar-head-cell",
        row: "cc-calendar-row",
        cell: "cc-calendar-cell",
        day: "cc-calendar-day",
        day_range_end: "cc-calendar-day-range-end",
        day_selected: "cc-calendar-day-selected",
        day_today: "cc-calendar-day-today",
        day_outside: "cc-calendar-day-outside",
        day_disabled: "cc-calendar-day-disabled",
        day_range_middle: "cc-calendar-day-range-middle",
        day_hidden: "cc-calendar-day-hidden",
        ...classNames,
      }}
      components={{
        Chevron: (props) => {
          if (props.orientation === "left") {
            return <ChevronLeft className="cc-calendar-chevron" />;
          }
          return <ChevronRight className="cc-calendar-chevron" />;
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };