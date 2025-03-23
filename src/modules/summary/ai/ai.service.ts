import { Injectable } from "@nestjs/common";
import OpenAI from "openai";
import { OPENAI_API_KEY } from "src/common/config/env/env";

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: OPENAI_API_KEY
    });
  }

  async summarizeRetrospect(retrospect: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "너는 사용자의 회고를 간결하게 요약하는 AI야.",
          },
          {
            role: "user",
            content: `회고 내용: "${retrospect}"\n\n한 문장으로 요약해줘.`,
          },
        ],
        max_tokens: 100,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("OpenAI API 요청 실패:", error);
      throw new Error("AI 회고 요약 중 오류가 발생했습니다.");
    }
  }
}
