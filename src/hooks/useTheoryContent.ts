import { useCallback } from 'react';
import { getTheoryContent } from '../constants/theory-content.js';

export interface ResolvedContent {
  title: string;
  content: string;
}

/**
 * Resolve {variable} placeholders in a string using the supplied variables map.
 */
function resolvePlaceholders(
  template: string,
  variables: Record<string, string>,
): string {
  return template.replace(/\{(\w+)\}/g, (_match, key: string) => {
    return variables[key] ?? `{${key}}`;
  });
}

/**
 * Hook that provides a function to retrieve and resolve theory content by ID.
 */
export function useTheoryContent() {
  const getContent = useCallback(
    (
      id: string,
      variables?: Record<string, string>,
    ): ResolvedContent | null => {
      const entry = getTheoryContent(id);
      if (!entry) return null;

      const vars = variables ?? {};

      return {
        title: resolvePlaceholders(entry.title, vars),
        content: resolvePlaceholders(entry.content, vars),
      };
    },
    [],
  );

  return { getContent };
}
