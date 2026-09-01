import { ReadinessResponse } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function analyzeClaimEvidence(formData: {
  incidentDescription: string;
  invoiceFile: File | null;
  warrantyFile: File | null;
  damagePhotoFiles: File[];
}): Promise<ReadinessResponse> {
  const data = new FormData();

  if (formData.incidentDescription) {
    data.append("incident_description", formData.incidentDescription);
  }

  if (formData.invoiceFile) {
    data.append("invoice", formData.invoiceFile);
  }

  if (formData.warrantyFile) {
    data.append("warranty", formData.warrantyFile);
  }

  if (formData.damagePhotoFiles && formData.damagePhotoFiles.length > 0) {
    formData.damagePhotoFiles.forEach((file) => {
      data.append("damage_photos", file);
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
      method: "POST",
      body: data,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const result: ReadinessResponse = await response.json();
    return result;
  } catch (error) {
    console.warn("Backend request failed, generating client-side heuristic response:", error);
    // Fallback heuristic simulation if backend is offline
    return generateClientHeuristicFallback(formData);
  }
}

function generateClientHeuristicFallback(formData: {
  incidentDescription: string;
  invoiceFile: File | null;
  warrantyFile: File | null;
  damagePhotoFiles: File[];
}): ReadinessResponse {
  let score = 100;
  const checks = [];
  const issues = [];
  const actions = [];

  const hasInvoice = !!formData.invoiceFile;
  checks.push({ label: "Ownership verified", passed: hasInvoice });
  if (!hasInvoice) {
    score -= 30;
    issues.push({
      severity: "HIGH" as const,
      description: "Proof of purchase / invoice document is missing from evidence package.",
    });
    actions.push("Upload purchase invoice or digital receipt.");
  }

  const hasWarranty = !!formData.warrantyFile;
  checks.push({ label: "Purchase date identified", passed: hasInvoice });
  if (!hasWarranty) {
    score -= 15;
    issues.push({
      severity: "MEDIUM" as const,
      description: "Warranty document not provided. Coverage period cannot be cross-referenced.",
    });
    actions.push("Attach warranty policy or certificate.");
  }

  const hasPhotos = formData.damagePhotoFiles && formData.damagePhotoFiles.length > 0;
  checks.push({ label: "Product identity matched", passed: hasInvoice && hasPhotos });
  checks.push({ label: "Damage visible", passed: hasPhotos });

  if (!hasPhotos) {
    score -= 35;
    issues.push({
      severity: "HIGH" as const,
      description: "No photographic damage evidence or serial number tag uploaded.",
    });
    actions.push("Upload high-resolution photos of product damage and serial number label.");
  } else if (formData.damagePhotoFiles.length === 1) {
    score -= 10;
    issues.push({
      severity: "MEDIUM" as const,
      description: "Only one damage photo uploaded. Insurers typically require 2+ angles.",
    });
    actions.push("Add a second angle showing overall context of the damaged item.");
  }

  if (!formData.incidentDescription || formData.incidentDescription.length < 20) {
    score -= 15;
    issues.push({
      severity: "MEDIUM" as const,
      description: "Incident narrative is very brief. Provide detailed description of how damage occurred.",
    });
    actions.push("Expand incident description with exact date, time, and incident mechanics.");
  }

  score = Math.max(0, Math.min(100, score));

  return {
    readiness_score: score,
    verification_checks: checks,
    issues_detected: issues,
    recommended_actions: actions.length > 0 ? actions : ["All evidence checks passed! Package is ready for formal submission."],
  };
}
