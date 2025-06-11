
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries } from "@/lib/countries";
import type { Country } from "@/types";

interface CountrySelectorProps {
  selectedCountry: Country | null;
  onSelectCountry: (country: Country | null) => void;
  disabled?: boolean;
}

export default function CountrySelector({
  selectedCountry,
  onSelectCountry,
  disabled = false,
}: CountrySelectorProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between text-muted-foreground pl-10" // Added pl-10 for icon space
          disabled={disabled}
        >
          {selectedCountry ? (
            <span className="flex items-center text-foreground"> {/* Ensure text is visible */}
              <span className="mr-2">{selectedCountry.flag}</span>
              {selectedCountry.name} ({selectedCountry.currencySymbol})
            </span>
          ) : (
            "Select country..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code} ${country.currency}`}
                  onSelect={() => {
                    onSelectCountry(country.code === selectedCountry?.code ? null : country);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedCountry?.code === country.code ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="mr-2">{country.flag}</span>
                  {country.name} <span className="ml-1 text-muted-foreground">({country.currencySymbol})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
