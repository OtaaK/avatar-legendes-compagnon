import {Home, Users, Map as MapIcon, Swords, Sparkles, Settings2} from "lucide-react"
export type PageName = "Accueil" | "Personnages" | "Lieux" | "Combats" | "Techniques" | "Gestion"
export const navItems: { name: PageName; icon: typeof Home; eyebrow: string }[] = [
  { name: "Accueil", icon: Home, eyebrow: "Campagne" },
  { name: "Personnages", icon: Users, eyebrow: "Campagne" },
  { name: "Lieux", icon: MapIcon, eyebrow: "Campagne"},
  { name: "Combats", icon: Swords, eyebrow: "À la table" },
  { name: "Techniques", icon: Sparkles, eyebrow: "Références" },
  { name: "Gestion", icon: Settings2, eyebrow: "Références" },
]

export function pageFromHash(hash: string): PageName | null {
 try { const value=decodeURIComponent(hash.replace(/^#/, "")).toLocaleLowerCase("fr"); return navItems.find(item=>item.name.toLocaleLowerCase("fr")===value)?.name ?? null } catch { return null }
}
