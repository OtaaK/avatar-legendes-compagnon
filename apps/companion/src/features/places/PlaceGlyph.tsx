import {
  Mountain,
  Store,
  Coffee,
  Waves,
  Settings2,
  Landmark,
  Wind,
  Home,
} from "lucide-react";
export function PlaceGlyph({ symbol }: { symbol?: string }) {
  const Icon =
    symbol === "◈"
      ? Mountain
      : symbol === "⌘"
        ? Store
        : symbol === "◌"
          ? Coffee
          : symbol === "≋"
            ? Waves
            : symbol === "⚙"
              ? Settings2
              : symbol === "▥"
                ? Landmark
                : symbol === "⌁"
                  ? Wind
                  : Home;
  return <Icon aria-hidden="true" />;
}
