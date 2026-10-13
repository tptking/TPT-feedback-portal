export function logDiagnostic(context: string, details?: any): void {
  console.error(`[Diagnostic] ${context}:`, details);
}

export default logDiagnostic;
