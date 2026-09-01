export interface VerificationCheck {
  label: string;
  passed: boolean;
}

export interface DetectedIssue {
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
}

export interface ReadinessResponse {
  readiness_score: number;
  verification_checks: VerificationCheck[];
  issues_detected: DetectedIssue[];
  recommended_actions: string[];
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
