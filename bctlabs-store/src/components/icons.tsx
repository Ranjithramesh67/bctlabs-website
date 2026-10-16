import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const BASE: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export function IconShield(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3l7 3v5c0 4.4-3 8.3-7 10-4-1.7-7-5.6-7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconTruck(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 7h11v10H3z" />
      <path d="M14 10h4l3 3v4h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 3h14v18l-3-2-2 2-2-2-2 2-3-2z" />
      <path d="M9 8h6M9 12h6" />
    </svg>
  );
}

export function IconHeadset(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M4 13v-1a8 8 0 0 1 16 0v1" />
      <path d="M4 13h3v6H5a1 1 0 0 1-1-1zM20 13h-3v6h2a1 1 0 0 0 1-1z" />
      <path d="M17 19a4 4 0 0 1-4 3h-1" />
    </svg>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2z" />
    </svg>
  );
}

export function IconMail(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

export function IconMapPin(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function IconClock(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconCart(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 6h15l-1.5 9h-12z" />
      <circle cx="9" cy="20" r="1.4" />
      <circle cx="18" cy="20" r="1.4" />
      <path d="M6 6 5 3H2" />
    </svg>
  );
}

export function IconUser(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" />
    </svg>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="m5 13 4 4 10-10" />
    </svg>
  );
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconClose(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

export function IconSpinner(props: IconProps) {
  return (
    <svg {...BASE} className={`animate-spin ${props.className ?? ""}`} {...props}>
      <path d="M12 3a9 9 0 1 0 9 9" />
    </svg>
  );
}

export function IconLock(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="4.5" y="10" width="15" height="10" rx="2" />
      <path d="M8 10V8a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

export function IconRefresh(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      <path d="M20 4v7h-7" />
    </svg>
  );
}

export function IconBox(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M12 3 3 7.5v9L12 21l9-4.5v-9z" />
      <path d="m3 7.5 9 4.5 9-4.5M12 12v9" />
    </svg>
  );
}

type SocialIconProps = IconProps & { name: "facebook" | "instagram" | "linkedin" | "youtube" };

export function SocialIcon({ name, ...props }: SocialIconProps) {
  const common = { viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": true } as const;
  if (name === "facebook") {
    return (
      <svg {...common} {...props}>
        <path d="M13.5 21v-8h2.7l.4-3h-3.1V8.2c0-.9.3-1.5 1.6-1.5h1.7V4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2V10H7.5v3h2.7v8z" />
      </svg>
    );
  }
  if (name === "instagram") {
    return (
      <svg {...common} {...props}>
        <path d="M12 2.2c-2.7 0-3 0-4.1.1-1 0-1.8.2-2.4.5-.7.3-1.2.6-1.8 1.2-.6.6-.9 1.1-1.2 1.8-.3.6-.4 1.4-.5 2.4C2 9.3 2 9.6 2 12s0 2.7.1 3.8c0 1 .2 1.8.5 2.4.3.7.6 1.2 1.2 1.8.6.6 1.1.9 1.8 1.2.6.3 1.4.4 2.4.5 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c1 0 1.8-.2 2.4-.5.7-.3 1.2-.6 1.8-1.2.6-.6.9-1.1 1.2-1.8.3-.6.4-1.4.5-2.4.1-1.1.1-1.4.1-3.8s0-2.7-.1-3.8c0-1-.2-1.8-.5-2.4a5 5 0 0 0-1.2-1.8 5 5 0 0 0-1.8-1.2c-.6-.3-1.4-.4-2.4-.5C15 2.2 14.7 2.2 12 2.2zm0 1.8c2.7 0 3 0 4 .1.9 0 1.4.2 1.8.3.4.2.8.4 1.1.7.3.3.5.7.7 1.1.1.4.3.9.3 1.8.1 1 .1 1.3.1 4s0 3-.1 4c0 .9-.2 1.4-.3 1.8-.2.4-.4.8-.7 1.1-.3.3-.7.5-1.1.7-.4.1-.9.3-1.8.3-1 .1-1.3.1-4 .1s-3 0-4-.1c-.9 0-1.4-.2-1.8-.3-.4-.2-.8-.4-1.1-.7a3 3 0 0 1-.7-1.1c-.1-.4-.3-.9-.3-1.8-.1-1-.1-1.3-.1-4s0-3 .1-4c0-.9.2-1.4.3-1.8.2-.4.4-.8.7-1.1.3-.3.7-.5 1.1-.7.4-.1.9-.3 1.8-.3 1-.1 1.3-.1 4-.1zm0 3.1a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm6.3-8.3a1.2 1.2 0 1 1-2.3 0 1.2 1.2 0 0 1 2.3 0z" />
      </svg>
    );
  }
  if (name === "linkedin") {
    return (
      <svg {...common} {...props}>
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.3c0-1.3 0-2.9-1.8-2.9s-2 1.4-2 2.8V21H9z" />
      </svg>
    );
  }
  return (
    <svg {...common} {...props}>
      <path d="M22 12c0-5.5-4.5-10-10-10S2 6.5 2 12c0 5 3.7 9.1 8.4 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.7-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12z" />
    </svg>
  );
}

const FEATURE_ICONS: Record<string, (props: IconProps) => React.ReactElement> = {
  shield: IconShield,
  truck: IconTruck,
  receipt: IconReceipt,
  headset: IconHeadset,
};

export function FeatureIcon({ name, ...props }: { name: string } & IconProps) {
  const Component = FEATURE_ICONS[name] ?? IconShield;
  return <Component {...props} />;
}
