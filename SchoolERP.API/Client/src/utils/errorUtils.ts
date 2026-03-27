export const extractError = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (!data) return fallback;

  if (typeof data === 'string') return data;

  // 1. Custom array: { "Errors": ["msg"] }
  if (Array.isArray(data.Errors) && data.Errors.length > 0) return data.Errors[0];

  // 2. Lowercase array: { "errors": ["msg"] }
  if (Array.isArray(data.errors) && data.errors.length > 0) return data.errors[0];

  // 3. ASP.NET validation object: { "errors": { "Field": ["msg"] } }
  if (data.errors && typeof data.errors === 'object' && !Array.isArray(data.errors)) {
    const errorKeys = Object.keys(data.errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      const firstMessages = data.errors[firstKey];
      if (Array.isArray(firstMessages) && firstMessages.length > 0) {
          return `${firstKey}: ${firstMessages[0]}`;
      }
    }
  }

  // 4. Simple message or title (Problem Details)
  // Check message FIRST because title is often generic like "One or more validation errors occurred."
  if (typeof data.message === 'string') return data.message;
  if (typeof data.title === 'string' && data.title !== "One or more validation errors occurred.") return data.title;
  if (typeof data.detail === 'string') return data.detail;

  return fallback;
};
