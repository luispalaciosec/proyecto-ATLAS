export function combineBrandContextPrompt(profileContext: string, feedbackContext: string): string {
  if (feedbackContext.trim().length === 0) {
    return profileContext;
  }

  return `${profileContext}\n\n---\n\n${feedbackContext}`;
}
