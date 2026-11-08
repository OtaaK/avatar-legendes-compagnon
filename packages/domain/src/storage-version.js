// Extrait de a9079fa, app/simulateur.html. Voir extraction.json.

function profileStorageRequired(library,combat){const queue=[combat],seen=new Set();if(library?.version===2||library?.characters?.some(c=>c.npcResources))return true;while(queue.length){const node=queue.pop();if(!node||seen.has(node))continue;seen.add(node);if(node.fighters?.some(f=>f.npcResources))return true;if(Array.isArray(node.snapshots))for(const snap of node.snapshots)queue.push(snap);}return false;}
export { profileStorageRequired };
