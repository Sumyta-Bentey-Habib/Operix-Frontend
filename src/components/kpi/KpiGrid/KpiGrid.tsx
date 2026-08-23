"use client";

import React from "react";
import styles from "./KpiGrid.module.css";
import { KpiCardData } from "@/types/kpi";
import { KpiCard } from "../KpiCard";

interface KpiGridProps {
  cards: KpiCardData[];
}

export const KpiGrid: React.FC<KpiGridProps> = ({ cards }) => {
  return (
    <div className={styles.gridContainer}>
      {cards.map((card) => (
        <KpiCard key={card.id} card={card} />
      ))}
    </div>
  );
};
