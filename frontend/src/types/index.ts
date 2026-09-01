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

export interface PhotoMetadata {
  filename: string;
  capture_date?: string | null;
  camera_make?: string | null;
  camera_model?: string | null;
  has_gps: boolean;
  gps_coordinates?: string | null;
}

export interface CrossDocumentDiscrepancy {
  field: string;
  source_a: string;
  value_a: string;
  source_b: string;
  value_b: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  explanation: string;
}

export interface ReadinessResponse {
  readiness_score: number;
  verification_checks: VerificationCheck[];
  issues_detected: DetectedIssue[];
  recommended_actions: string[];
  extracted_entities?: ExtractedEntities | null;
  discrepancies?: CrossDocumentDiscrepancy[];
  photo_metadata?: PhotoMetadata[];
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
