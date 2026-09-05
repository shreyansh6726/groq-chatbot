let availableModelPromise;

const preferredModels = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b'
];

export async function getGroqChatModel(groq) {
  const configuredModel = process.env.REACT_APP_GROQ_MODEL?.trim();
  if (configuredModel) return configuredModel;

  if (!availableModelPromise) {
    availableModelPromise = groq.models.list().then((response) => {
      const modelIds = (response.data || [])
        .map((model) => model.id)
        .filter((id) => !/whisper|distil-whisper|guard|safeguard|allam/i.test(id));

      return preferredModels.find((model) => modelIds.includes(model)) || modelIds[0];
    });
  }

  const model = await availableModelPromise;
  if (!model) throw new Error('No chat-capable Groq model is available for this API key.');
  return model;
}
