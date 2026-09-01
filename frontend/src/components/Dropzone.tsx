"use client";

import React, { useRef, useState } from "react";
import { Upload, FileText, Image as ImageIcon, CheckCircle, X, AlertCircle, Camera } from "lucide-react";

interface DropzoneProps {
  label: string;
  sublabel?: string;
  accept?: string;
  icon?: "pdf" | "image" | "text";
  multiple?: boolean;
  required?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  onOpenSmartCamera?: () => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  label,
  sublabel = "PDF, Image, or Plain Text",
  accept = ".pdf,.png,.jpg,.jpeg,.webp,.txt",
  icon = "pdf",
  multiple = false,
  required = false,
  files,
  onFilesChange,
  onOpenSmartCamera,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      if (multiple) {
        onFilesChange([...files, ...droppedFiles]);
      } else {
        onFilesChange([droppedFiles[0]]);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      if (multiple) {
        onFilesChange([...files, ...selectedFiles]);
      } else {
        onFilesChange([selectedFiles[0]]);
      }
    }
  };

  const removeFile = (index: number) => {
    const updated = files.filter((_, idx) => idx !== index);
    onFilesChange(updated);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  };

  const IconComponent = icon === "image" ? ImageIcon : FileText;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
        <label className="flex items-center gap-1.5">
          <span>{label}</span>
          {required && <span className="text-cyan-400 font-bold">*</span>}
        </label>

        <div className="flex items-center gap-2">
          {onOpenSmartCamera && (
            <button
              type="button"
              onClick={onOpenSmartCamera}
              className="text-[11px] text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-500/30 transition-all"
            >
              <Camera className="w-3 h-3" />
              <span>Smart Camera</span>
            </button>
          )}
          <span className="text-[10px] text-slate-400 font-normal">{sublabel}</span>
        </div>
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`group relative rounded-xl border border-dashed p-4 text-center cursor-pointer transition-all ${
          isDragOver
            ? "border-cyan-400 bg-cyan-950/20 ring-2 ring-cyan-400/20"
            : files.length > 0
            ? "border-slate-700 bg-slate-900/60 hover:border-slate-600"
            : "border-slate-800 bg-slate-950/50 hover:border-slate-700 hover:bg-slate-900/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
              files.length > 0
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-800/80 text-slate-400"
            }`}
          >
            {files.length > 0 ? (
              <CheckCircle className="w-4 h-4 text-cyan-400" />
            ) : (
              <IconComponent className="w-4 h-4" />
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-slate-200">
              {files.length > 0 ? (
                <span className="text-cyan-300 font-semibold">
                  {files.length} file{files.length > 1 ? "s" : ""} selected
                </span>
              ) : (
                <>
                  <span className="text-cyan-400 font-semibold">Click to upload</span> or drag and drop
                </>
              )}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              PDF, PNG, JPG, or TXT
            </p>
          </div>
        </div>
      </div>

      {/* Selected File Badges List */}
      {files.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-2 truncate max-w-[85%]">
                <IconComponent className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="text-slate-200 truncate font-mono text-[11px]">{file.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  ({formatFileSize(file.size)})
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1 rounded hover:bg-slate-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
