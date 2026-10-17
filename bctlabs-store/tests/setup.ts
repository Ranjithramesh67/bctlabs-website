import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// `server-only` throws outside a React Server Component bundle; tests import
// server libs directly, so neutralise the guard.
vi.mock("server-only", () => ({}));
