
export interface QueryResponsePair {
    query: string;
    response: string;
    model?: ModelTypes;
    temperature?: number;
    maxResponseLength?: number;
}

export enum ModelTypes {
    GPT_4o = "gpt-4o",
    GPT_4 = "GPT-4",
    GPT_4o_Mini = "gpt-4o-mini",
    Claude_3_5_Sonnet = "claude-3-5-sonnet-20240620",
    Llama_3_8b = "llama3.1"

}

export enum OpenAIModelTypes {
    GPT_4o = "gpt-4o",
    GPT_4 = "GPT-4",
    GPT_4o_Mini = "gpt-4o-mini",
}

export enum OllamaModelTypes {
    Llama_3_8b = "llama3.1"
}

export const CHATBOX_WIDTH=200;