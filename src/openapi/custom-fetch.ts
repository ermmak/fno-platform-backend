const getBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable or relative URL
    return process.env.NEXT_PUBLIC_API_URL || '';
  }
  // Server-side: use environment variable
  return process.env.API_URL || 'http://localhost:3000';
};

export const customFetch = async <T>(
  url: string,
  options: RequestInit,
): Promise<T> => {
  const baseUrl = getBaseUrl();

  // Don't set Content-Type for FormData (browser sets it with boundary)
  const headers: HeadersInit =
    options.body instanceof FormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };

  const response = await fetch(`${baseUrl}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    throw new Error(
      `HTTP ${response.status}: ${response.statusText}${errorBody ? ` - ${errorBody}` : ''}`,
    );
  }

  // Handle empty responses (204 No Content, etc.)
  if (
    response.status === 204 ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }

  // Check content type before parsing JSON
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return (await response.json()) as T;
  }

  // Return text for non-JSON responses
  const text: string = await response.text();
  return text as unknown as T;
};
