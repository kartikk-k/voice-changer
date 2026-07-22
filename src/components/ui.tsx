import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";

import type { Status } from "@/lib/useStitcher";

/** A labelled form control wrapper. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-xs font-semibold text-text"
      >
        {label}
      </label>
      {children}
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

const controlClass =
  "w-full rounded-lg border border-border-strong bg-surface px-3 py-2 text-sm text-text " +
  "outline-none transition-colors placeholder:text-muted/70 " +
  "focus:border-primary focus:ring-2 focus:ring-primary/20";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={controlClass} />;
}

export function Select(
  props: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode },
) {
  const { children, ...rest } = props;
  return (
    <select {...rest} className={controlClass}>
      {children}
    </select>
  );
}

export function Textarea(
  props: InputHTMLAttributes<HTMLTextAreaElement> & { rows?: number },
) {
  return (
    <textarea
      spellCheck={false}
      {...props}
      className={`${controlClass} min-h-[240px] resize-y font-mono text-xs leading-relaxed`}
    />
  );
}

type ButtonVariant = "primary" | "secondary" | "ghost";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-inverse hover:bg-primary-hover shadow-sm",
  secondary:
    "border border-border-strong bg-surface text-text hover:bg-surface-offset",
  ghost: "text-text hover:bg-surface-offset",
};

export function Button({
  variant = "secondary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      {...props}
      className={
        "inline-flex min-h-[38px] items-center justify-center rounded-lg px-4 text-sm " +
        "font-medium transition-colors duration-150 " +
        "disabled:cursor-not-allowed disabled:opacity-50 " +
        `${buttonVariants[variant]} ${className}`
      }
    />
  );
}

/** Small rounded label used for durations and gaps. */
export function Chip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-border bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
      {children}
    </span>
  );
}

// Monochrome banners: distinguished by weight and a left accent bar rather
// than hue, so error/success stay legible in a black-and-white palette.
const statusStyles: Record<Status["kind"], string> = {
  idle: "border-border bg-surface-2 text-muted",
  info: "border-border bg-surface-2 text-text",
  success: "border-border-strong bg-surface-offset text-text font-medium",
  error: "border-text bg-text text-inverse font-medium",
};

export function StatusBanner({ status }: { status: Status }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-lg border px-3.5 py-2.5 text-sm ${statusStyles[status.kind]}`}
    >
      {status.message}
    </div>
  );
}
