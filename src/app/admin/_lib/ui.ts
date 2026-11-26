// One vocabulary for every admin control, so a button or a field looks the same on every screen.
const press = "transition-[background-color,border-color,color,scale] duration-150 active:not-disabled:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50";

export const btn = {
  primary: `inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-brand-800 px-4 text-sm font-medium text-white hover:bg-brand-900 ${press}`,
  secondary: `inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-stone-300 bg-white px-4 text-sm font-medium text-stone-800 hover:border-stone-400 hover:bg-sand-50 ${press}`,
  quiet: `inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-stone-600 hover:bg-sand-100 hover:text-stone-900 ${press}`,
  danger: `inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-rose-300 bg-white px-4 text-sm font-medium text-rose-700 hover:bg-rose-50 ${press}`,
};

export const field =
  "block w-full rounded-lg border border-stone-300 bg-white px-3 text-[15px] text-stone-900 placeholder:text-stone-400 transition-[border-color] duration-150 hover:border-stone-400 focus-visible:border-brand-700 sm:text-sm";
export const input = `${field} h-10`;
export const textarea = `${field} py-2.5 leading-relaxed`;
/** Pair with <Chevron /> inside a `relative` wrapper (native arrow is hidden for a consistent look). */
export const select = `${field} h-10 appearance-none pr-9`;

/** Small grey label above a value or a control. */
export const label = "text-sm text-stone-500";
/** Section heading inside a page. */
export const h2 = "text-[15px] font-semibold text-stone-900";
