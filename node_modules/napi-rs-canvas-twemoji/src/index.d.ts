import { SKRSContext2D } from "@napi-rs/canvas"

export async function fillTextWithTwemoji(
  context: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  options?: DrawTextWithEmojiOptions
): Promise<void>;

export async function strokeTextWithTwemoji(
  context: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  options?: DrawTextWithEmojiOptions
): Promise<void>;

export function measureText(
  context: SKRSContext2D,
  text: string,
  x: number,
  y: number,
  options?: MeasureTextOptions
): {
  width: number;
  alphabeticBaseline: number;
};

export interface DrawTextWithEmojiOptions {
  maxWidth?: number;
  emojiSideMarginPercent?: number;
  emojiTopMarginPercent?: number;
}

export interface MeasureTextOptions {
  emojiSideMarginPercent?: number;
}
