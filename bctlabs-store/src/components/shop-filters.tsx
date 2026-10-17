"use client";

import { useState } from "react";
import type { Category } from "@/lib/store";
import { Button, ButtonLink, Input, Label, Select } from "@/components/ui";
import { IconChevronDown } from "@/components/icons";

export type ShopFilterQuery = {
  q?: string;
  category?: string;
  sort?: string;
  onSale?: boolean;
  inStock?: boolean;
};

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
];

export function ShopFilters({
  categories,
  query,
}: {
  categories: Category[];
  query: ShopFilterQuery;
}) {
  const [open, setOpen] = useState(false);
  const activeCount = [
    query.q,
    query.category,
    query.onSale ? "sale" : "",
    query.inStock ? "stock" : "",
  ].filter(Boolean).length;

  return (
    <details
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm"
      open={open}
      onToggle={(event) => setOpen(event.currentTarget.open)}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-900">
          Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[11px] font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </span>
        <span className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 group-open:hidden">Show filters</span>
          <span className="hidden text-xs font-medium text-slate-500 group-open:inline">Hide filters</span>
          <IconChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
        </span>
      </summary>

      <form action="/shop" method="get" className="grid gap-5 border-t border-slate-100 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label htmlFor="filter-q">Search</Label>
          <Input
            id="filter-q"
            type="search"
            name="q"
            placeholder="Search products or SKU"
            defaultValue={query.q ?? ""}
          />
        </div>

        <div>
          <Label htmlFor="filter-category">Category</Label>
          <Select id="filter-category" name="category" defaultValue={query.category ?? ""}>
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name} ({category.count})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label htmlFor="filter-sort">Sort by</Label>
          <Select id="filter-sort" name="sort" defaultValue={query.sort ?? "newest"}>
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        <fieldset className="space-y-2">
          <legend className="mb-1.5 block text-sm font-medium text-slate-700">Availability</legend>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              name="sale"
              value="1"
              defaultChecked={query.onSale ?? false}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            On sale only
          </label>
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
            <input
              type="checkbox"
              name="stock"
              value="1"
              defaultChecked={query.inStock ?? false}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            In stock only
          </label>
        </fieldset>

        <div className="flex gap-3 sm:col-span-2 lg:col-span-4">
          <Button type="submit" className="sm:w-auto">
            Apply filters
          </Button>
          <ButtonLink href="/shop" variant="outline">
            Reset
          </ButtonLink>
        </div>
      </form>
    </details>
  );
}
