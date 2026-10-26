import type { ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";
import type { Page } from "../lib/app-data";

export type NavigationItem = {
  id: Page;
  label: string;
  icon: LucideIcon;
};

export function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/35 p-0 sm:items-center sm:p-4">
      <section className="w-full max-w-lg rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

export function NavItem({
  item,
  active,
  onClick,
}: {
  item: NavigationItem;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${active ? "bg-moss text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"}`}
    >
      <Icon size={19} />
      {item.label}
    </button>
  );
}

export function Title({
  title,
  desc,
  action,
}: {
  title: string;
  desc: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
}

export function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${secondary ? "border border-line bg-white text-slate-700 hover:bg-slate-50" : "bg-moss text-white hover:bg-moss-dark"}`}
    >
      {children}
    </button>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block text-xs font-bold uppercase tracking-wide text-slate-500">
      {label}
      <div className="mt-2 [&_input]:w-full [&_input]:rounded-xl [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-3 [&_input]:text-sm [&_select]:w-full [&_select]:rounded-xl [&_select]:border [&_select]:border-line [&_select]:bg-white [&_select]:px-3 [&_select]:py-3 [&_select]:text-sm">
        {children}
      </div>
    </label>
  );
}
