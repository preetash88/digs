// Tiny client-side store so the whole UI can react to a country switch the
// instant it is clicked, before the server has finished rendering the page.
type Country = "AU" | "NZ";

let pending: Country | null = null;
let safety: ReturnType<typeof setTimeout> | undefined;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export const subscribeCountry = (f: () => void) => {
    subs.add(f);
    return () => { subs.delete(f); };
};
export const getPendingCountry = () => pending;

export function beginSwitch(c: Country) {
    pending = c;
    emit();
    document.documentElement.setAttribute("data-switching", "1");
    clearTimeout(safety);
    safety = setTimeout(endSwitch, 8000); // never leave the UI stuck
}

export function endSwitch() {
    clearTimeout(safety);
    if (pending === null) return;
    pending = null;
    emit();
    const root = document.documentElement;
    root.setAttribute("data-switching", "done");
    setTimeout(() => { if (root.getAttribute("data-switching") === "done") root.removeAttribute("data-switching"); }, 700);
}