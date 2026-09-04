"use client";

import React from "react";
import { Database, Tag, Hash, Calendar, Flame, Check, AlertCircle } from "lucide-react";
import { ExtractedEntities } from "@/types";

interface ExtractedEntitiesCardProps {
  entities?: ExtractedEntities | null;
}

export const ExtractedEntitiesCard: React.FC<ExtractedEntitiesCardProps> = ({
  entities,
}) => {
  if (!entities) return null;

  const fields = [
    {
      label: "Product Name",
      value: entities.product_name,
      icon: Tag,
      placeholder: "Not identified",
    },
    {
      label: "Model / Variant",
      value: entities.model_number,
      icon: Hash,
      placeholder: "Not identified",
    },
    {
      label: "Serial Number / IMEI",
      value: entities.serial_number,
      icon: Hash,
      placeholder: "Missing serial tag",
    },
    {
      label: "Purchase Date",
      value: entities.purchase_date,
      icon: Calendar,
      placeholder: "Date not detected",
    },
    {
      label: "Incident Date",
      value: entities.incident_date,
      icon: Calendar,
      placeholder: "Date not stated",
    },
    {
      label: "Damage Classification",
      value: entities.damage_type,
      icon: Flame,
      placeholder: "Unspecified",
    },
  ];

  return (
    <div className="claim-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-purple-900" />
          <h3 className="text-sm font-semibold text-black/80">
            Structured Evidence Entities (OCR & NLP)
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-900/10 text-purple-800 border border-purple-900/20">
          Parsed Metadata
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {fields.map((field) => {
          const Icon = field.icon;
          const isPresent = !!field.value;

          return (
            <div
              key={field.label}
              className={`p-3 rounded-xl border transition-all flex flex-col justify-between ${
                isPresent
                  ? "bg-white border-black/10"
                  : "bg-white border-white opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] text-black/50 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon className="w-3.5 h-3.5 text-black/50" />
                  {field.label}
                </span>
                {isPresent ? (
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : (
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div
                className={`text-xs font-semibold truncate ${
                  isPresent ? "text-black" : "text-black/40 italic"
                }`}
                title={field.value || field.placeholder}
              >
                {field.value || field.placeholder}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
