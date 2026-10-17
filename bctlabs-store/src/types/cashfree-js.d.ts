/**
 * Minimal typings for the Cashfree JS loader. The package ships no .d.ts and
 * the global script is injected at runtime, so only the surface we use is
 * declared here.
 */
declare module "@cashfreepayments/cashfree-js" {
  export type CashfreeCheckoutOptions = {
    paymentSessionId: string;
    redirectTarget: "_modal" | "_self" | "_blank" | "_top" | { type: "element"; container: string };
  };

  export type CashfreeInstance = {
    checkout: (options: CashfreeCheckoutOptions) => Promise<unknown>;
  };

  export function load(options: {
    mode: "sandbox" | "production";
  }): Promise<CashfreeInstance | null>;
}
