import { BaseMessage, HumanMessage } from "langchain/schema"

// export function formatConvHistory(messages: string[]) {
//   return messages.map((message: string, i: number) => {
//     if (i % 2 === 0) {
//       return `Human: ${message}`
//     } else {
//       return `AI: ${message}`
//     }
//   }).join('\n')
// }


export function formatConvHistory(messages: BaseMessage[]) {
  return messages.map((message: BaseMessage) => {
    if (message instanceof HumanMessage) {
      return `Human: ${message.content}`
    } else {
      return `AI: ${message.content}`
    }
  }).join('\n')
}
