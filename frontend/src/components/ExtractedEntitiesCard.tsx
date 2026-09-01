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
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Structured Evidence Entities (OCR & NLP)
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
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
                  ? "bg-slate-950/60 border-slate-800"
                  : "bg-slate-950/30 border-slate-900 opacity-60"
              }`}
            >
              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 font-medium">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
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
                  isPresent ? "text-slate-100" : "text-slate-500 italic"
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
