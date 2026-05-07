import { globalState } from "$lib/state.svelte";

const SYSTEM_PROMPT = `You are an elite AI Mission Planner assisting National Security Guards (NSG) in high-stakes rescue and tactical operations.
Your job is to analyze building blueprints, structural layouts, and user queries to provide strategic advice, entry point recommendations, blind spot identification, and tactical analysis.
When blueprints are provided, meticulously analyze them for walls, doors, windows, and potential hostile locations. Provide clear, concise, and actionable intelligence. Always maintain a professional, tactical, and highly secure tone.`;

// Helper to convert blob/file to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to convert blob to base64"));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const sendChatMessage = async (
  userMessage: string,
): Promise<{ role: "assistant"; content: string }> => {
  if (!globalState.groqApiKey) {
    throw new Error(
      "Groq API Key is not set. Please set it in the chat settings.",
    );
  }

  // 1. Prepare message history
  const messages: any[] = [{ role: "system", content: SYSTEM_PROMPT }];

  let hasAttachedBlueprints = false;

  // Add existing history
  for (let idx = 0; idx < globalState.chatMessages.length; idx++) {
    const msg = globalState.chatMessages[idx];

    // If this is the first user message, attach blueprints to it
    if (
      msg.role === "user" &&
      !hasAttachedBlueprints &&
      globalState.blueprintPreviews.length > 0
    ) {
      hasAttachedBlueprints = true;
      const contentArray: any[] = [{ type: "text", text: msg.content }];

      const blueprintsToSend = globalState.blueprintPreviews.slice(-5);
      for (let i = 0; i < blueprintsToSend.length; i++) {
        try {
          const src = blueprintsToSend[i];
          const response = await fetch(src);
          const blob = await response.blob();
          const base64Data = await blobToBase64(blob);

          contentArray.push({
            type: "text",
            text: `Blueprint for Floor ${globalState.blueprintPreviews.length - blueprintsToSend.length + i + 1}:`,
          });

          contentArray.push({
            type: "image_url",
            image_url: {
              url: base64Data,
            },
          });
        } catch (err) {
          console.error("Failed to load blueprint for AI:", err);
        }
      }

      messages.push({ role: msg.role, content: contentArray });
    } else {
      // For all other messages, just use the string content
      messages.push({ role: msg.role, content: msg.content });
    }
  }

  // 3. Make the API call
  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${globalState.groqApiKey}`,
      },
      body: JSON.stringify({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: messages,
        temperature: 0.2, // Low temperature for factual, tactical responses
        max_completion_tokens: 2048,
      }),
    },
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Groq API Error: ${response.statusText}`,
    );
  }

  const data = await response.json();
  const assistantMessage =
    data.choices[0]?.message?.content || "No response received.";

  return {
    role: "assistant",
    content: assistantMessage,
  };
};
