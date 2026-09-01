export interface VerificationCheck {
  label: string;
  passed: boolean;
}

export interface DetectedIssue {
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

export interface ExtractedEntities {
  product_name?: string | null;
  model_number?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  incident_date?: string | null;
  damage_type?: string | null;
}

export interface OCRBoundingBox {
  text: string;
  confidence?: number;
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  w: number; // percentage (0-100)
  h: number; // percentage (0-100)
}

export interface PhotoMetadata {
  filename: string;
  capture_date?: string | null;
  camera_make?: string | null;
  camera_model?: string | null;
  has_gps: boolean;
  gps_coordinates?: string | null;
  ocr_boxes?: OCRBoundingBox[];
}

export interface CrossDocumentDiscrepancy {
  field: string;
  source_a: string;
  value_a: string;
  source_b: string;
  value_b: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
  can_auto_resolve?: boolean;
  suggested_fix?: string | null;
}

export interface ForensicAnalysis {
  authenticity_score: number;
  is_tampered: boolean;
  ai_generated_risk: "LOW" | "MEDIUM" | "HIGH";
  editing_software_detected?: string | null;
  metadata_integrity: string;
  phash_fingerprint?: string | null;
  is_duplicate_claim?: boolean;
  forensic_checks: VerificationCheck[];
}

export interface ReadinessResponse {
  readiness_score: number;
  verification_checks: VerificationCheck[];
  issues_detected: DetectedIssue[];
  recommended_actions: string[];
  extracted_entities?: ExtractedEntities | null;
  discrepancies?: CrossDocumentDiscrepancy[];
  photo_metadata?: PhotoMetadata[];
  forensics?: ForensicAnalysis | null;
}

export interface InterviewMessage {
  role: "assistant" | "user";
  content: string;
}

export interface InterviewRequest {
  current_statement: string;
  messages: InterviewMessage[];
  last_user_response?: string;
}

export interface InterviewResponse {
  assistant_reply: string;
  enhanced_statement: string;
  clarifying_chips: string[];
  is_statement_complete: boolean;
}

export interface ClaimFormData {
  incidentDescription: string;
  invoiceFile: File | null;
  warrantyFile: File | null;
  damagePhotoFiles: File[];
}

export interface DemoPreset {
  id: string;
  name: string;
  description: string;
  tag: string;
  incidentDescription: string;
  invoiceSampleText: string;
  warrantySampleText: string;
  photoSampleName: string;
}
