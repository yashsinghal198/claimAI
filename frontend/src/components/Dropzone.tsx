"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileText, Image as ImageIcon, X, Check, AlertCircle } from "lucide-react";

interface DropzoneProps {
  label: string;
  sublabel: string;
  accept: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  icon?: "pdf" | "image" | "mixed";
  required?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  sublabel,
  accept,
  multiple = false,
  files,
  onFilesChange,
  icon = "mixed",
  required = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const dropped = Array.from(e.dataTransfer.files);
      if (multiple) {
        onFilesChange([...files, ...dropped]);
      } else {
        onFilesChange([dropped[0]]);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files);
      if (multiple) {
        onFilesChange([...files, ...selected]);
      } else {
        onFilesChange([selected[0]]);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, idx) => idx !== index);
    onFilesChange(updated);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
          <span>{label}</span>
          {required && (
            <span className="text-[10px] text-rose-400 font-normal">*Required</span>
          )}
        </label>
        <span className="text-[11px] text-slate-400">{sublabel}</span>
      </div>

      {/* Drop area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all duration-200 ${
          isDragging
            ? "border-cyan-400 bg-cyan-950/30 scale-[0.99]"
            : files.length > 0
            ? "border-emerald-500/40 bg-emerald-950/10 hover:border-emerald-500/60"
            : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
              files.length > 0
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-slate-800/80 text-slate-400"
            }`}
          >
            {icon === "pdf" ? (
              <FileText className="w-4 h-4" />
            ) : icon === "image" ? (
              <ImageIcon className="w-4 h-4" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
          </div>

          <div className="text-xs text-slate-300">
            <span className="font-semibold text-cyan-400">Click to upload</span> or drag & drop
          </div>
          <p className="text-[10px] text-slate-400">
            {multiple ? "Attach multiple photos" : "PDF or Image up to 10MB"}
          </p>
        </div>
      </div>

      {/* Selected file list */}
      {files.length > 0 && (
        <div className="space-y-1.5 mt-2">
          {files.map((file, idx) => {
            const isPdf = file.name.toLowerCase().endsWith(".pdf");
            const isTxt = file.name.toLowerCase().endsWith(".txt");
            return (
              <div
                key={`${file.name}-${idx}`}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/80 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-6 h-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0">
                    {isPdf ? (
                      <FileText className="w-3.5 h-3.5 text-rose-400" />
                    ) : isTxt ? (
                      <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    ) : (
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    )}
                  </div>
                  <div className="truncate">
                    <p className="text-slate-200 truncate font-medium">{file.name}</p>
                    <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(idx);
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors ml-2"
                  title="Remove file"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
