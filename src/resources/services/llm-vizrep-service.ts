export class LlmVizrepService {
  private readonly serviceUrl = "http://localhost:3000";

  async generate(prompt: string, archetype: string, assetSlots = []): Promise<string> {
    const response = await fetch(`${this.serviceUrl}/api/llm/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt,
        archetype,
        assetSlots,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error ?? "VizRep generation failed.");
    }

    return data.vizrep;
  }
}