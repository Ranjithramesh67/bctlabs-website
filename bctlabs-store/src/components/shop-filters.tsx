"use client";

import type { Category } from "@/lib/store";
import { Button, ButtonLink, Input, Label, Select } from "@/components/ui";

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
  return (
    <form
      action="/shop"
      method="get"
      className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-900">Filters</h2>
        <ButtonLink href="/shop" variant="ghost" size="sm" className="px-2">
          Reset
        </ButtonLink>
      </div>

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

      <fieldset className="space-y-3">
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

      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
