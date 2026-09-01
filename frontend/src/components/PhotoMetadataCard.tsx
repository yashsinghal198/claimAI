"use client";

import React from "react";
import { Camera, Calendar, MapPin, CheckCircle2, ShieldCheck, Image as ImageIcon } from "lucide-react";
import { PhotoMetadata } from "@/types";

interface PhotoMetadataCardProps {
  metadataList?: PhotoMetadata[];
}

export const PhotoMetadataCard: React.FC<PhotoMetadataCardProps> = ({
  metadataList = [],
}) => {
  if (!metadataList || metadataList.length === 0) {
    return null;
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-200">
            Photo EXIF & Integrity Metadata
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
          Hardware Verified
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metadataList.map((photo, idx) => {
          return (
            <div
              key={`${photo.filename}-${idx}`}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                <span className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  {photo.filename}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400">
                {/* Capture Date */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Capture Time:
                  </span>
                  <span className="font-mono text-slate-200">
                    {photo.capture_date || "Timestamp Not Stamped"}
                  </span>
                </div>

                {/* Camera Make & Model */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-slate-500" />
                    Device / Camera:
                  </span>
                  <span className="font-mono text-slate-200 truncate max-w-[150px]">
                    {photo.camera_make || photo.camera_model
                      ? `${photo.camera_make || ""} ${photo.camera_model || ""}`.trim()
                      : "Standard Sensor"}
                  </span>
                </div>

                {/* GPS Location */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    GPS GeoTag:
                  </span>
                  <span
                    className={`font-semibold ${
                      photo.has_gps ? "text-emerald-400" : "text-slate-500"
                    }`}
                  >
                    {photo.has_gps ? "Embedded Location" : "No GPS Tag"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
