"use client";

import {
  ArrowDown,
  ArrowUp,
  CircleDot,
  Flame,
  Mountain,
  Wind,
  Waves,
  Swords,
  Cpu,
} from "lucide-react";
import type {
  CharacterView as Character,
  Importance,
  Training,
} from "./models";
import { safeSheetPortrait } from "../../../../../packages/domain/src/character-fields.js";
import { importanceColors, trainingColors } from "./models";

const trainingIcons = {
  Eau: Waves,
  Terre: Mountain,
  Feu: Flame,
  Air: Wind,
  Armes: Swords,
  Technologie: Cpu,
};

export function TrainingIcon({
  training,
  compact = false,
}: {
  training?: Training;
  compact?: boolean;
}) {
  if (!training) return null;
  const Icon = trainingIcons[training];
  return (
    <span
      className={`training-mark ${compact ? "training-mark-small" : ""}`}
      style={{ "--training": trainingColors[training] } as React.CSSProperties}
      title={training}
      aria-label={`Entraînement : ${training}`}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}

export function ImportanceDot({
  importance,
  label = false,
}: {
  importance?: Importance;
  label?: boolean;
}) {
  if (!importance) return null;
  return (
    <span className="importance-label" title={`Importance : ${importance}`}>
      <i
        style={{ background: importanceColors[importance] }}
        aria-hidden="true"
      />
      {label && <span>{importance}</span>}
    </span>
  );
}

export function Portrait({
  name,
  training,
  size = "medium",
  decorative = false,
  src,
}: {
  src?: string;
  name: string;
  training?: Training;
  size?: "small" | "medium" | "large";
  decorative?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className={`portrait portrait-${size}`}
      style={
        {
          "--portrait-accent": training ? trainingColors[training] : "#75adbf",
        } as React.CSSProperties
      }
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : `Portrait illustré de ${name}`}
    >
      <span className="portrait-glow" />
      <span className="portrait-sigil">{initials}</span>
      {safeSheetPortrait(src) && (
        <img src={safeSheetPortrait(src)} alt="" className="local-portrait" />
      )}
      <span className="portrait-ring" />
    </span>
  );
}

export function FatigueMeter({
  capacity = 0,
  value = 0,
  compact = false,
  readOnly = false,
  onChange,
  label = "Fatigue",
}: {
  capacity?: number;
  value?: number;
  compact?: boolean;
  readOnly?: boolean;
  onChange?: (value: number) => void;
  label?: string;
}) {
  if (!capacity) return null;
  const safeValue = Math.max(0, Math.min(capacity, value));
  return (
    <div className={`fatigue-wrap ${compact ? "fatigue-compact" : ""}`}>
      {!compact && (
        <div className="meter-heading">
          <span>{label}</span>
          <span className="muted">
            {safeValue} / {capacity}
          </span>
        </div>
      )}
      <div
        className="fatigue-cells"
        role="group"
        aria-label={`${label} : ${safeValue} sur ${capacity}`}
        style={{ "--cells": capacity } as React.CSSProperties}
      >
        {Array.from({ length: capacity }, (_, index) => {
          const cell = (
            <span
              className={`fatigue-cell ${index < safeValue ? "filled" : ""}`}
            />
          );
          return readOnly || !onChange ? (
            <span className="fatigue-cell-shell" key={index}>
              {cell}
            </span>
          ) : (
            <button
              className="fatigue-cell-shell fatigue-cell-button"
              type="button"
              key={index}
              aria-label={`Régler ${label.toLowerCase()} à ${index + 1} sur ${capacity}`}
              onClick={() => onChange(index + 1)}
            >
              {cell}
            </button>
          );
        })}
      </div>
      {!compact && onChange && (
        <div className="meter-actions">
          <button
            className="icon-button small"
            type="button"
            aria-label={`Diminuer ${label.toLowerCase()}`}
            disabled={safeValue <= 0}
            onClick={() => onChange(safeValue - 1)}
          >
            <ArrowDown />
          </button>
          <button
            className="icon-button small"
            type="button"
            aria-label={`Augmenter ${label.toLowerCase()}`}
            disabled={safeValue >= capacity}
            onClick={() => onChange(safeValue + 1)}
          >
            <ArrowUp />
          </button>
        </div>
      )}
    </div>
  );
}

export function BalanceMeterPJ({
  value = 0,
  center = 0,
  compact = false,
  onChange,
  principles = ["Non renseigné", "Non renseigné"],
}: {
  principles?: string[];
  value?: number;
  center?: number;
  compact?: boolean;
  onChange?: (value: number) => void;
}) {
  const safeValue = Math.max(-3, Math.min(3, value));
  const safeCenter = Math.max(-3, Math.min(3, center));
  if (compact)
    return (
      <div
        className="balance-mini"
        aria-label={`Équilibre : ${safeValue > 0 ? "+" : ""}${safeValue}, centre ${safeCenter}`}
      >
        {Array.from({ length: 7 }, (_, i) => (
          <span
            key={i}
            className={`${i === safeValue + 3 ? "balance-current" : ""} ${i === safeCenter + 3 ? "balance-center" : ""}`}
          />
        ))}
      </div>
    );
  return (
    <div className="balance-detail">
      <div className="balance-principles">
        <span>{principles[0] || "Non renseigné"}</span>
        <span>{principles[1] || "Non renseigné"}</span>
      </div>
      <div
        className="balance-scale"
        role="group"
        aria-label="Position d’équilibre, de −3 à +3"
      >
        {Array.from({ length: 7 }, (_, i) => {
          const position = i - 3;
          const isCurrent = position === safeValue;
          const isCenter = position === safeCenter;
          return (
            <button
              key={position}
              type="button"
              className={`balance-point ${isCurrent ? "current" : ""} ${isCenter ? "center" : ""}`}
              onClick={() => onChange?.(position)}
              aria-label={`Déplacer l’équilibre à ${position > 0 ? "+" : ""}${position}${isCenter ? " (centre)" : ""}`}
              disabled={!onChange}
            >
              <span />
              {isCurrent && isCenter && <small>◇</small>}
            </button>
          );
        })}
      </div>
      <div className="balance-values">
        <span>−3</span>
        <span>−2</span>
        <span>−1</span>
        <span>0</span>
        <span>+1</span>
        <span>+2</span>
        <span>+3</span>
      </div>
      <div className="balance-key">
        <span>
          <i className="key-current" /> Position actuelle{" "}
          <b>
            {safeValue > 0 ? "+" : ""}
            {safeValue}
          </b>
        </span>
        <span>
          <i className="key-center" /> Centre{" "}
          <b>
            {safeCenter > 0 ? "+" : ""}
            {safeCenter}
          </b>
        </span>
      </div>
      <p className="micro-note">
        Position et centre sont deux valeurs distinctes.
      </p>
    </div>
  );
}

export function BalanceMeterPNJ({
  value = 0,
  principle = "Principe",
  onChange,
  min = -3,
  max = 3,
}: {
  min?: number;
  max?: number;
  value?: number;
  principle?: string;
  onChange?: (value: number) => void;
}) {
  const safeValue = Math.max(min, Math.min(max, value));
  return (
    <div className="npc-balance">
      <div className="meter-heading">
        <span>{principle}</span>
        <span className="muted">
          {safeValue > 0 ? "+" : ""}
          {safeValue}
        </span>
      </div>
      <div
        className="npc-balance-points"
        style={{
          gridTemplateColumns: `repeat(${max - min + 1},minmax(0,1fr))`,
        }}
        role="group"
        aria-label={`Échelle du principe ${principle}`}
      >
        {Array.from({ length: max - min + 1 }, (_, i) => {
          const n = i + min;
          return (
            <button
              key={n}
              type="button"
              className={n === safeValue ? "active" : ""}
              onClick={() => onChange?.(n)}
              disabled={!onChange}
              aria-label={`Valeur ${n > 0 ? "+" : ""}${n}`}
            >
              <span />
            </button>
          );
        })}
      </div>
      <div className="npc-balance-limits">
        <span>{min}</span>
        <span>
          {max > 0 ? "+" : ""}
          {max}
        </span>
      </div>
    </div>
  );
}

export function StatePills({
  states,
  compact = false,
}: {
  states: string[];
  compact?: boolean;
}) {
  if (!states.length) return null;
  return (
    <span
      className={`state-pills ${compact ? "state-pills-compact" : ""}`}
      aria-label="États actifs"
    >
      {states.map((state) => (
        <span className="state-pill" key={state} title={`État : ${state}`}>
          <CircleDot aria-hidden="true" />
          {state}
        </span>
      ))}
    </span>
  );
}

export function CharacterCardPJ({
  character,
  onOpen,
}: {
  character: Character;
  onOpen: () => void;
}) {
  return (
    <button
      className="character-card pj-card"
      type="button"
      onClick={onOpen}
      aria-label={`Ouvrir la fiche de ${character.name}`}
    >
      <Portrait
        name={character.name}
        training={character.training}
        src={character.portrait}
        size="medium"
      />
      <span className="character-card-content">
        <span className="character-card-top">
          <strong>{character.name}</strong>
          <TrainingIcon training={character.training} compact />
        </span>
        <span className="card-subtitle">{character.playbook}</span>
        <FatigueMeter
          capacity={character.fatigueCapacity}
          value={character.fatigue}
          compact
          readOnly
        />
        <span className="card-card-bottom">
          <BalanceMeterPJ
            value={character.balance}
            center={character.balanceCenter}
            compact
          />
          <StatePills states={character.states} compact />
        </span>
      </span>
    </button>
  );
}

export function CharacterCardPNJ({
  character,
  locationName,
  onOpen,
}: {
  character: Character;
  locationName: string;
  onOpen: () => void;
}) {
  return (
    <button
      className="character-card pnj-card"
      type="button"
      onClick={onOpen}
      aria-label={`Ouvrir la fiche de ${character.name}`}
    >
      <Portrait
        name={character.name}
        training={character.training}
        src={character.portrait}
        size="medium"
      />
      <span className="character-card-content">
        <span className="character-card-top">
          <span className="npc-name-line">
            <strong>{character.name}</strong>
            <ImportanceDot importance={character.importance} />
          </span>
          <TrainingIcon training={character.training} compact />
        </span>
        <span className="card-subtitle">
          {[character.role, character.desire].filter(Boolean).join(" · ") ||
            "Rôle non renseigné"}
        </span>
        {character.fatigueCapacity ? (
          <FatigueMeter
            capacity={character.fatigueCapacity}
            value={character.fatigue}
            compact
            readOnly
          />
        ) : (
          <span className="card-empty-meter">Sans ressource de fatigue</span>
        )}
        {character.states.length > 0 && (
          <span className="npc-card-states">
            <StatePills states={character.states} compact />
          </span>
        )}
        <span className="pnj-card-footer">
          {character.principle ? (
            <span
              className="npc-balance-mini"
              aria-label={`Principe : ${character.principle}`}
            >
              {character.principle} <i />
            </span>
          ) : (
            <span />
          )}
          {locationName && (
            <span className="location-tag">⌖ {locationName}</span>
          )}
        </span>
      </span>
    </button>
  );
}
