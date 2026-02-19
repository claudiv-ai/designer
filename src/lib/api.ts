import type { ComponentDefinition, CdmlDiffResult, ContextManifest } from '@claudiv/core';

const BASE = '/api';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function getProject() {
  return request<{ name: string; components: Array<{ fqn: string; name: string; file: string }> }>('/project');
}

export function getComponents() {
  return request<ComponentDefinition[]>('/components');
}

export function getComponent(fqn: string) {
  return request<ComponentDefinition>(`/component/${encodeURIComponent(fqn)}`);
}

export function updateComponent(fqn: string, component: ComponentDefinition) {
  return request<{ success: boolean }>(`/component/${encodeURIComponent(fqn)}`, {
    method: 'PUT',
    body: JSON.stringify(component),
  });
}

export function createComponent(component: ComponentDefinition) {
  return request<{ success: boolean; file: string }>('/component', {
    method: 'POST',
    body: JSON.stringify(component),
  });
}

export function deleteComponent(fqn: string) {
  return request<{ success: boolean }>(`/component/${encodeURIComponent(fqn)}`, {
    method: 'DELETE',
  });
}

export function getContext(fqn: string) {
  return request<ContextManifest>(`/context/${encodeURIComponent(fqn)}`);
}

export function getAssembledContext(fqn: string, scope: string) {
  return request<{ prompt: string; facts: any[]; refs: any[] }>(
    `/context/${encodeURIComponent(fqn)}/assembled/${encodeURIComponent(scope)}`
  );
}

export function getDiff(file: string) {
  return request<CdmlDiffResult>(`/diff/${encodeURIComponent(file)}`);
}

export function getAspects(fqn: string) {
  return request<any[]>(`/aspects/${encodeURIComponent(fqn)}`);
}

export function submitPlanAnswers(file: string, answers: Record<string, string>) {
  return request<{ success: boolean; facts?: any[] }>('/plan/answer', {
    method: 'POST',
    body: JSON.stringify({ file, answers }),
  });
}

export function triggerGeneration(fqn: string) {
  return request<{ status: string; fqn: string }>(`/generate/${encodeURIComponent(fqn)}`, {
    method: 'POST',
  });
}
