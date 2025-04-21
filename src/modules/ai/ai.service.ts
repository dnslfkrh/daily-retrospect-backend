import { Injectable, InternalServerErrorException } from "@nestjs/common";
import OpenAI from "openai";
import { PromptLibrary } from "src/modules/ai/library/prompt.library";
import { RetrospectAnswerProps } from "./types/retrospect-answer.type";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiService {
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY')
    });
  }

  private emojiKeywordMap: { [key: string]: { [emoji: string]: string } } = {
    "오늘의 날씨는?": { "☀️": "맑음", "🌤️": "구름 조금", "⛈️": "천둥번개", "❄️": "눈" },
    "오늘의 컨디션은?": { "💪": "에너지가 넘침", "😐": "보통", "😴": "피곤함", "🤒": "몸이 좋지 않음" },
    "오늘 나의 기분은?": { "😀": "기분이 좋음", "😢": "슬픔", "😡": "화가 남", "😌": "평온함" },
  };

  private convertEmojiToKeyword(question: string, answer: string): string {
    const emojiMap = this.emojiKeywordMap[question];
    if (!emojiMap) return answer;

    return answer
      .split("")
      .map((char) => emojiMap[char] || char)
      .join("");
  }

  async summarizeRetrospect(retrospectData: RetrospectAnswerProps[]): Promise<string> {
    try {
      if (!retrospectData || retrospectData.length === 0) {
        throw new Error('회고 데이터가 없습니다.');
      }

      let formattedAnswers = "";

      retrospectData.forEach(({ question, answer }) => {
        if (!answer?.trim()) {
          return;
        }

        const convertedAnswer = this.convertEmojiToKeyword(question, answer);

        formattedAnswers += `- 질문: ${question}\n  답변: ${convertedAnswer}\n`;
      });

      const prompt = PromptLibrary.getRetrospectSummaryPrompt(formattedAnswers);

      const response = await this.openai.chat.completions.create({
        model: this.configService.get<string>("GPT_MODEL"),
        messages: [
          {
            role: "system",
            content: PromptLibrary.getAiSystemMessage()
          },
          { role: "user", content: prompt },
        ],
        max_tokens: this.configService.get<number>("API_MAX_TOKENS"),
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error("OpenAI API 요청 실패:", error.response?.data || error.message);
      throw new InternalServerErrorException("AI 회고 요약 중 오류가 발생했습니다.");
    }
  }
}
