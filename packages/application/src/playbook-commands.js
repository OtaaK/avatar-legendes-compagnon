import { Roster } from "../../domain/src/roster.js";
import { BookState } from "../../domain/src/books.js";
import { copy } from "../../persistence/src/codecs.js";
import { findMove, freeze } from "../../reference/src/playbooks.js";
import {
  PREPARATION_FORMAT,
  validateCreationDraft,
  validateAdvancementProposal,
} from "./playbook-preparation.js";

/** Adaptateurs sans interface. Une instance par store ; décision, puis transaction unique. */
export function createPlaybookCommands(store) {
  const plans = new WeakSet();
  const find = (s, id) => {
    const c = s.library.characters.find((c) => c.id === id);
    if (!c || c.kind !== "PJ") throw Error("PJ introuvable");
    return c;
  };
  const confirm = (decision) => {
    if (
      decision?.confirmed !== true ||
      typeof decision.reason !== "string" ||
      !decision.reason.trim() ||
      decision.reason.length > 1000
    )
      throw Error("Confirmation explicite et motif requis");
  };
  const writablePreparation = (c) => {
    const prior = c.playbookPreparation;
    if (
      prior !== undefined &&
      (prior?.format !== PREPARATION_FORMAT || prior?.version !== 1)
    )
      throw Error("Extension de préparation inconnue : ne pas la remplacer");
    return copy(
      prior ?? { format: PREPARATION_FORMAT, version: 1, byBook: {} },
    );
  };
  function plan(command) {
    const p = freeze({ ...command, revision: store.getSnapshot().revision });
    plans.add(p);
    return p;
  }
  return {
    prepareCreation(draft) {
      const result = validateCreationDraft(
        draft,
        store.getSnapshot().session.library,
      );
      if (result.errors.length) return freeze({ ...result, plan: null });
      return freeze({
        ...result,
        plan: plan({
          kind: "create",
          candidate: copy(result.candidate),
          warnings: result.warnings,
        }),
      });
    },
    prepareMoves(id, names, decision) {
      confirm(decision);
      if (
        !Array.isArray(names) ||
        names.some(
          (n) => typeof n !== "string" || !n.trim() || n.length > 120,
        ) ||
        new Set(names).size !== names.length
      )
        throw Error("Manœuvres invalides ou dupliquées");
      const c = find(store.getSnapshot().session, id);
      // Ajouter un nom historique reste permis, mais ne valide pas son acquisition réglementaire.
      return plan({
        kind: "moves",
        id,
        warnings: [
          "Sélection manuelle : les effets de manœuvre, bonus et choix associés ne sont pas appliqués par cette correction.",
        ],
        before: [...c.playbookMoves],
        names: copy(names),
        decision: copy(decision),
      });
    },
    prepareAddMove(id, moveId, decision) {
      const move = findMove(moveId);
      if (!move) throw Error("Manœuvre inconnue");
      const c = find(store.getSnapshot().session, id);
      return this.prepareMoves(id, [...c.playbookMoves, move.name], decision);
    },
    prepareProgress(id, book, changes, decision) {
      confirm(decision);
      const c = find(store.getSnapshot().session, id);
      return plan({
        kind: "progress",
        id,
        state: BookState.patch(c, book, changes),
        decision: copy(decision),
      });
    },
    prepareAdvancement(id, proposal, decision) {
      confirm(decision);
      const c = find(store.getSnapshot().session, id),
        review = validateAdvancementProposal(c, proposal);
      if (review.errors.length) throw Error(review.errors.join(" ; "));
      writablePreparation(c);
      return plan({
        kind: "advancement",
        id,
        review,
        decision: copy(decision),
      });
    },
    cancel(plan) {
      plans.delete(plan);
    },
    async commit(plan, decision) {
      if (!plans.has(plan))
        throw Error("Plan inconnu, annulé ou déjà enregistré");
      confirm(decision);
      if (plan.warnings?.length && decision.acceptPending !== true)
        throw Error("Accepter explicitement les limites et choix en attente");
      let id = plan.id;
      await store.execute(plan.revision, (draft) => {
        if (plan.kind === "create") {
          const c = Roster.createCharacter(
            draft.library,
            plan.candidate.name,
            "PJ",
          );
          id = c.id;
          const patch = copy(plan.candidate);
          delete patch.id;
          delete patch.kind;
          patch.playbookPreparation.status = "recorded";
          patch.playbookPreparation.creationDecision = copy(decision);
          Roster.updateCharacter(draft.library, id, patch);
        } else {
          const c = find(draft, id);
          if (plan.kind === "progress")
            Roster.updateCharacter(draft.library, id, {
              playbookState: copy(plan.state),
            });
          else {
            const preparation = writablePreparation(c);
            if (
              preparation.events !== undefined &&
              !Array.isArray(preparation.events)
            )
              throw Error(
                "Historique de préparation inconnu : ne pas le remplacer",
              );
            preparation.events ??= [];
            preparation.events.push({
              kind: plan.kind,
              book: c.livret,
              decision: copy(plan.decision),
              ...(plan.kind === "moves"
                ? { before: plan.before, after: plan.names }
                : { review: plan.review, applied: false }),
            });
            Roster.updateCharacter(draft.library, id, {
              playbookPreparation: preparation,
              ...(plan.kind === "moves"
                ? { playbookMoves: copy(plan.names) }
                : {}),
            });
          }
        }
      });
      plans.delete(plan);
      return id;
    },
  };
}
