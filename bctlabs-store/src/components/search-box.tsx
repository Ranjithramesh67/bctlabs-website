"use client";

import { useState } from "react";
import { Button, ButtonLink, Input } from "@/components/ui";

export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);

  return (
    <form action="/search" role="search" className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="flex-1">
        <label htmlFor="site-search" className="sr-only">
          Search products
        </label>
        <Input
          id="site-search"
          type="search"
          name="q"
          defaultValue={defaultValue}
          onChange={(event) => setValue(event.target.value)}
          placeholder="Search products, SKUs and more..."
          autoComplete="off"
          autoFocus
        />
      </div>
      <Button type="submit">Search</Button>
      {value ? (
        <ButtonLink href="/search" variant="outline">
          Clear
        </ButtonLink>
      ) : null}
    </form>
  );
}
