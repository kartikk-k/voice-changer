import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

/* ─── PillTabBar ─── */

/** Segmented pill-style tab bar matching the Figma design system. */
export function PillTabBar<T extends string>({
  tabs,
  active,
  onChange,
  size = "sm",
}: {
  tabs: { key: T; label: string }[];
  active: T;
  onChange: (key: T) => void;
  size?: "sm" | "lg";
}) {
  const h = size === "sm" ? "h-[33px]" : "h-[40px]";

  return (
    <div className="flex overflow-clip rounded-[99px] bg-[#f7f7f7] p-[2px]">
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`flex flex-1 cursor-pointer items-center justify-center ${h} text-xs ${
              isActive
                ? "rounded-[99px] bg-white shadow-[0px_0px_4px_-1px_rgba(0,0,0,0.13)]"
                : "opacity-60"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── SettingsCard ─── */

/** Rounded card container used to group related settings fields. */
export function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col gap-[14px] rounded-[16px] border border-[rgba(0,0,0,0.1)] bg-white p-[12px]">
      {children}
    </div>
  );
}

/* ─── SettingsField ─── */

/** Labeled field row with optional link, badge, description, and trailing content. */
export function SettingsField({
  label,
  htmlFor,
  link,
  badge,
  description,
  trailing,
  children,
}: {
  label: string;
  htmlFor?: string;
  link?: { text: string; href: string };
  badge?: string;
  description?: string;
  trailing?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-[4px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[12px]">
          <label htmlFor={htmlFor} className="text-[14px] text-black">
            {label}
          </label>
          {link && (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-[4px] text-[12px] opacity-60 hover:opacity-80"
            >
              {link.text}
              <svg width="7" height="7" viewBox="0 0 7 7" fill="none">
                <path d="M1.5 5.5L5.5 1.5M5.5 1.5H2M5.5 1.5V5" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          )}
        </div>
        <div className="flex items-center gap-[8px]">
          {trailing}
          {badge && (
            <span className="text-[12px] opacity-50">({badge})</span>
          )}
        </div>
      </div>
      {description && (
        <p className="text-[12px] opacity-60">{description}</p>
      )}
      {children}
    </div>
  );
}

/* ─── SettingsInput ─── */

/** Styled text input for settings forms. */
export function SettingsInput(
  props: InputHTMLAttributes<HTMLInputElement>,
) {
  return (
    <input
      {...props}
      className="w-full rounded-[10px] bg-[#f7f7f7] px-[12px] py-[6px] text-[14px] text-[rgba(0,0,0,0.6)] outline-none"
    />
  );
}

/* ─── SettingsTextarea ─── */

/** Multi-line textarea for settings forms. */
export function SettingsTextarea(
  props: TextareaHTMLAttributes<HTMLTextAreaElement>,
) {
  return (
    <textarea
      {...props}
      className="h-[100px] w-full resize-none rounded-[10px] bg-[#f7f7f7] px-[12px] py-[6px] text-[14px] text-[rgba(0,0,0,0.6)] outline-none"
    />
  );
}

/* ─── SettingsSelect ─── */

/** Styled dropdown select with a custom chevron icon. */
export function SettingsSelect(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  const { children, ...rest } = props;
  return (
    <div className="relative">
      <select
        {...rest}
        className="w-full appearance-none rounded-[10px] bg-[#f7f7f7] px-[12px] py-[6px] pr-[28px] text-[14px] text-[rgba(0,0,0,0.6)] outline-none"
      >
        {children}
      </select>
      <svg
        className="pointer-events-none absolute right-[10px] top-1/2 -translate-y-1/2 opacity-50"
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
      >
        <path
          d="M3 4.5L6 7.5L9 4.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

/* ─── Toggle ─── */

/** Boolean toggle switch with slide animation. */
export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-[17px] w-[40px] shrink-0 cursor-pointer items-center rounded-[99px] transition-colors duration-200 ${
        checked ? "bg-black" : "bg-[rgba(0,0,0,0.2)]"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[15px] w-[23px] rounded-[99px] bg-white transition-transform duration-200 ${
          checked ? "translate-x-[16px]" : "translate-x-[1px]"
        }`}
      />
    </button>
  );
}

/* ─── PillButton ─── */

/** Pill-shaped action button with optional blue variant. */
export function PillButton({
  variant = "default",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "blue";
}) {
  const textColor =
    variant === "blue" ? "text-[#2f5cff]" : "text-black";
  const shadow =
    variant === "blue"
      ? "shadow-[0px_0px_4px_-1px_#2f5cff]"
      : "shadow-[0px_0px_4px_-1px_rgba(0,0,0,0.13)]";

  return (
    <div className="flex-1 overflow-clip rounded-[99px] bg-[#f7f7f7] p-[2px]">
      <button
        type="button"
        {...props}
        className={`flex h-[40px] w-full cursor-pointer items-center justify-center rounded-[99px] bg-white px-[14px] text-[13px] ${textColor} ${shadow} disabled:cursor-not-allowed disabled:opacity-40`}
      >
        {children}
      </button>
    </div>
  );
}

/* ─── MetricCell ─── */

/** Single value/label pair displayed inside a metrics bar. */
export function MetricCell({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="flex flex-1 flex-col items-start gap-[4px] py-[14px]">
      <span className="text-[16px] text-black">{value}</span>
      <span className="text-[14px] text-[#808080]">{label}</span>
    </div>
  );
}

/* ─── GapIndicator ─── */

/** Small label showing the silence gap between two transcript segments. */
export function GapIndicator({ label }: { label: string }) {
  return (
    <div className="flex h-[14px] pt-2 items-center justify-center text-[12px] opacity-50">
      {label}
    </div>
  );
}
