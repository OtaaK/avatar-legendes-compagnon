/** Parcours itératif. Les parents absents sont des entrées visibles, pas des pertes silencieuses. */
export function flattenPlaces(places, collapsed = new Set()) {
  const known = new Set(places.map((p) => p.id)),
    children = new Map();
  for (const p of places) {
    const parent = p.parentId && known.has(p.parentId) ? p.parentId : null;
    const group = children.get(parent) ?? [];
    group.push(p);
    children.set(parent, group);
  }
  const stack = [...(children.get(null) ?? [])]
      .reverse()
      .map((p) => ({ place: p, depth: 0 })),
    out = [],
    seen = new Set();
  while (stack.length) {
    const node = stack.pop();
    if (seen.has(node.place.id)) continue;
    seen.add(node.place.id);
    const kids = children.get(node.place.id) ?? [];
    out.push({ ...node, hasChildren: !!kids.length });
    if (!collapsed.has(node.place.id))
      for (const p of [...kids].reverse())
        stack.push({ place: p, depth: node.depth + 1 });
  }
  return out;
}
