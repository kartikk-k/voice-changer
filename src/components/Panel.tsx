import type { ReactNode } from "react";

/** Flat white card used for every major section of the page. */
export function Panel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={
        "rounded-xl border border-border bg-surface shadow-panel " + className
      }
    >
      {children}
    </section>
  );
}

/** Header row inside a Panel, with an accessory slot on the right. */
export function PanelHeading({
  title,
  subtitle,
  accessory,
}: {
  title: string;
  subtitle?: string;
  accessory?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
      <div>
        <h2 className="font-display text-base font-semibold leading-tight">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        ) : null}
      </div>
      {accessory ? <div className="shrink-0">{accessory}</div> : null}
    </div>
  );
}
