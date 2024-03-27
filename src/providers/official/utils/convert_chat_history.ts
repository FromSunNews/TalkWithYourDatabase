import { BaseMessage, HumanMessage } from "langchain/schema"

export function getConvertChatHistory(messages: BaseMessage[]): string {
  const fullChatHistory = messages.map((message: BaseMessage) => {
    if (message instanceof HumanMessage) {
      return `Human: ${message.content}`
    } else {
      return `AI: ${message.content}`
    }
  }).join('\n');
  return fullChatHistory
}
