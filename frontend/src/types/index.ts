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

export interface ReadinessResponse {
  readiness_score: number;
  verification_checks: VerificationCheck[];
  issues_detected: DetectedIssue[];
  recommended_actions: string[];
  extracted_entities?: ExtractedEntities | null;
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
