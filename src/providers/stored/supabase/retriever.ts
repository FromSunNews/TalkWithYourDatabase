import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { createClient } from '@supabase/supabase-js'
import { env } from 'config/environment'

const embeddings = new OpenAIEmbeddings()
const sbApiKey = env.SUPABASE_API_KEY || ""
const sbUrl = env.SUPABASE_URL_LC_CHATBOT || ""
const client = createClient(sbUrl, sbApiKey)

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: 'documents',
  queryName: 'match_documents'
})

const retriever = vectorStore.asRetriever({
  k: 2 //lấy số docs = 2 
})

export { retriever }