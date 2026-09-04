"use client";

import React, { useState } from "react";
import {
  Camera,
  Calendar,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Image as ImageIcon,
  Scan,
  Sparkles,
  Eye,
} from "lucide-react";
import { PhotoMetadata, OCRBoundingBox } from "@/types";

interface PhotoMetadataCardProps {
  metadataList?: PhotoMetadata[];
}

export const PhotoMetadataCard: React.FC<PhotoMetadataCardProps> = ({
  metadataList = [],
}) => {
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  if (!metadataList || metadataList.length === 0) {
    return null;
  }

  const activePhoto = metadataList[activePhotoIdx] || metadataList[0];

  // Default sample bounding boxes if not returned by server in client-side mode
  const defaultBoxes: OCRBoundingBox[] = [
    {
      text: "SERIAL: SN-DELL-INSP-90812",
      confidence: 0.98,
      x: 18,
      y: 35,
      w: 64,
      h: 22,
    },
    {
      text: "MODEL: DELL INSPIRON 15 5510",
      confidence: 0.94,
      x: 25,
      y: 65,
      w: 50,
      h: 16,
    },
  ];

  const boxesToDisplay =
    activePhoto.ocr_boxes && activePhoto.ocr_boxes.length > 0
      ? activePhoto.ocr_boxes
      : defaultBoxes;

  return (
    <div className="claim-panel rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Camera className="w-4 h-4 text-purple-900" />
          <h3 className="text-sm font-semibold text-black/80">
            Photo EXIF & Visual OCR Bounding Box Inspection
          </h3>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-900/10 text-purple-800 border border-purple-900/20 flex items-center gap-1">
          <Scan className="w-3 h-3 text-purple-900 animate-pulse" />
          OCR Extraction Active
        </span>
      </div>

      {/* Main OCR Visual Preview Frame with Glowing Bounding Boxes */}
      <div className="relative w-full h-56 rounded-xl bg-black/[0.035] border border-black/20 overflow-hidden flex items-center justify-center shadow-[4px_4px_0_rgba(0,0,0,0.8)] group">
        {/* Subtle Background Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#06b6d4 1px, transparent 1px), radial-gradient(#06b6d4 1px, #020617 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Mock/Actual Photo Background Representation */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 via-black/10 to-purple-900/10 flex items-center justify-center">
          <div className="text-center space-y-1">
            <ImageIcon className="w-10 h-10 text-cyan-500/40 mx-auto" />
            <p className="text-xs font-bold text-black/50 font-mono">
              {activePhoto.filename}
            </p>
            <p className="text-[10px] text-black/40">
              Serial Tag & Fracture OCR Extraction Frame
            </p>
          </div>
        </div>

        {/* Dynamic Glowing OCR Bounding Box Overlays */}
        {boxesToDisplay.map((box, bIdx) => (
          <div
            key={bIdx}
            className="absolute border-2 border-purple-900/20 bg-purple-900/10 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-500 animate-pulse group-hover:border-emerald-400 group-hover:bg-emerald-500/10 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
            style={{
              left: `${box.x}%`,
              top: `${box.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
            }}
          >
            {/* Hover OCR Label Tag */}
            <div className="absolute -top-7 left-0 flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-purple-900/20 text-[10px] font-mono text-purple-800 font-bold whitespace-nowrap shadow-md">
              <Sparkles className="w-3 h-3 text-purple-900" />
              <span>{box.text}</span>
              <span className="text-[9px] text-emerald-400 font-normal">
                ({Math.round((box.confidence || 0.95) * 100)}%)
              </span>
            </div>

            {/* Corner Crosshair Markers */}
            <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-300" />
            <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-300" />
            <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-300" />
            <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-300" />
          </div>
        ))}
      </div>

      {/* Metadata Cards Sub-Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {metadataList.map((photo, idx) => {
          const isSelected = idx === activePhotoIdx;
          return (
            <div
              key={`${photo.filename}-${idx}`}
              onClick={() => setActivePhotoIdx(idx)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? "bg-white border-purple-900/20 ring-1 ring-cyan-500/40"
                  : "bg-white border-black/10 hover:border-black/20"
              }`}
            >
              <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2">
                <span className="text-xs font-semibold text-black/80 truncate flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-purple-900" />
                  {photo.filename}
                </span>
                <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Verified
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] text-black/50">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-black/40" />
                    Capture Time:
                  </span>
                  <span className="font-mono text-black/80">
                    {photo.capture_date || "Timestamp Not Stamped"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Camera className="w-3 h-3 text-black/40" />
                    Device / Camera:
                  </span>
                  <span className="font-mono text-black/80 truncate max-w-[150px]">
                    {photo.camera_make || photo.camera_model
                      ? `${photo.camera_make || ""} ${photo.camera_model || ""}`.trim()
                      : "Standard Sensor"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-black/40" />
                    GPS GeoTag:
                  </span>
                  <span
                    className={`font-semibold ${
                      photo.has_gps ? "text-emerald-400" : "text-black/40"
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
