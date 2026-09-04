"use client";

import React, { useRef, useState, useEffect } from "react";
import { Camera, X, Check, RefreshCw, Scan, Sparkles, SwitchCamera } from "lucide-react";

interface SmartCameraModalProps {
  onCapture: (file: File) => void;
  onClose: () => void;
}

type GuideMode = "serial" | "wide" | "macro";

export const SmartCameraModal: React.FC<SmartCameraModalProps> = ({
  onCapture,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [guideMode, setGuideMode] = useState<GuideMode>("serial");
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [capturedFile, setCapturedFile] = useState<File | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;

    async function startCamera() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        activeStream = mediaStream;
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn("Camera Access Warning:", err);
        setCameraError("Camera permission denied or camera unavailable. You can upload photo files manually.");
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `smart_proof_${guideMode}_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setCapturedFile(file);
        setCapturedPreview(canvas.toDataURL("image/jpeg"));
      }
    }, "image/jpeg", 0.95);
  };

  const handleRetake = () => {
    setCapturedPreview(null);
    setCapturedFile(null);
  };

  const handleConfirm = () => {
    if (capturedFile) {
      onCapture(capturedFile);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-black/10 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900/10 text-purple-900 flex items-center justify-center border border-purple-900/20">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black flex items-center gap-1.5">
                &quot;Smart Proof&quot; Guided Camera Scanner
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  AI HUD
                </span>
              </h3>
              <p className="text-[11px] text-black/50">
                Align evidence with bounding guide boxes to guarantee OCR & forensic approval
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-black/50 hover:text-white hover:bg-black/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Mode Switcher */}
        <div className="px-6 py-2.5 bg-white border-b border-black/10 flex items-center gap-2">
          <span className="text-[10px] text-black/50 font-bold uppercase tracking-wider mr-2">
            Target Alignment:
          </span>

          <button
            onClick={() => setGuideMode("serial")}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
              guideMode === "serial"
                ? "bg-purple-900/10 text-black shadow-md shadow-purple-900/20"
                : "bg-black/5 text-black/70 hover:bg-black/10"
            }`}
          >
            🏷️ Serial Tag Box
          </button>

          <button
            onClick={() => setGuideMode("wide")}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
              guideMode === "wide"
                ? "bg-purple-900/10 text-black shadow-md shadow-purple-900/20"
                : "bg-black/5 text-black/70 hover:bg-black/10"
            }`}
          >
            📐 Wide Damage Frame
          </button>

          <button
            onClick={() => setGuideMode("macro")}
            className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all ${
              guideMode === "macro"
                ? "bg-purple-900/10 text-black shadow-md shadow-purple-900/20"
                : "bg-black/5 text-black/70 hover:bg-black/10"
            }`}
          >
            🔍 Macro Crack Zoom
          </button>
        </div>

        {/* Camera Viewfinder / Preview */}
        <div className="relative flex-1 bg-black flex items-center justify-center min-h-[360px] overflow-hidden">
          {cameraError ? (
            <div className="text-center p-6 space-y-3 text-black/50 max-w-sm">
              <Camera className="w-10 h-10 mx-auto text-amber-400" />
              <p className="text-xs">{cameraError}</p>
            </div>
          ) : capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Snapshot Preview"
              className="w-full h-full object-contain max-h-[380px]"
            />
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover max-h-[380px]"
              />

              {/* HUD Bounding Box Guides */}
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center p-8">
                {guideMode === "serial" && (
                  <div className="w-72 h-32 border-2 border-dashed border-purple-900/20 rounded-2xl relative shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold bg-purple-900/10 text-purple-800 px-2 py-0.5 rounded border border-purple-900/20">
                      Align Barcode / Serial Number Label
                    </span>
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-purple-900/20" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-purple-900/20" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-purple-900/20" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-purple-900/20" />
                  </div>
                )}

                {guideMode === "wide" && (
                  <div className="w-80 h-56 border-2 border-dashed border-emerald-400 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                      Position Entire Device Inside Frame
                    </span>
                  </div>
                )}

                {guideMode === "macro" && (
                  <div className="w-48 h-48 border-2 border-dashed border-rose-400 rounded-full relative shadow-[0_0_20px_rgba(244,63,94,0.4)] flex items-center justify-center">
                    <span className="text-[10px] font-mono font-bold bg-rose-50 text-rose-300 px-2 py-0.5 rounded border border-rose-500/40 text-center">
                      Center Crack / Impact
                    </span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Hidden Canvas */}
          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-black/10 bg-white flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-xs font-semibold text-black/50 hover:text-white"
          >
            Close
          </button>

          {capturedPreview ? (
            <div className="flex items-center gap-3">
              <button
                onClick={handleRetake}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white border border-black/20 text-black/70 hover:bg-black/5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>

              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/20 transition-all"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Attach to Evidence</span>
              </button>
            </div>
          ) : (
            <button
              onClick={handleTakeSnapshot}
              disabled={!!cameraError}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-purple-900 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-purple-900/20 active:scale-95 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Guided Photo</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
