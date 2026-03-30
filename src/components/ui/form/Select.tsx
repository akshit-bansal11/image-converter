import * as React from "react";

import { cn } from "@/lib/utils";

type SelectOption =
  | string
  | {
      label: React.ReactNode;
      value: string;
      disabled?: boolean;
    };

interface SelectProps extends React.ComponentProps<"select"> {
  options?: readonly SelectOption[];
  placeholder?: string;
}

function Select({
  className,
  children,
  options,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-background/70 px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-0 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer appearance-none pr-8 transition-colors hover:bg-accent/80 hover:text-accent-foreground",
          "[&>option]:bg-neutral-800 [&>option]:text-foreground",
          className,
        )}
        {...props}
      >
        {placeholder ? <option value="">{placeholder}</option> : null}
        {options?.map((option) => {
          const normalizedOption =
            typeof option === "string"
              ? { label: option, value: option }
              : option;

          return (
            <option
              key={normalizedOption.value}
              value={normalizedOption.value}
              disabled={normalizedOption.disabled}
            >
              {normalizedOption.label}
            </option>
          );
        })}
        {children}
      </select>
      <svg
        className="absolute right-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}

export { Select };
