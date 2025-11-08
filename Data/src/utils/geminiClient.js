export async function callGemini({
  model,
  contents,
  systemInstruction,
  generationConfig,
}) {
  const response = await fetch('/.netlify/functions/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      contents,
      systemInstruction,
      generationConfig,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Gemini proxy error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

