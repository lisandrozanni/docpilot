import { NotFoundError, ConflictError } from '../../lib/errors.js';
import { streamAnswer, type ChatMessage } from '../../infra/llm.js';
import { embedQuery } from '../../infra/embeddings.js';
import * as documentsRepository from '../documents/documents.repository.js';
import * as chatRepository from './chat.repository.js';

interface AskQuestionInput {
  documentId: string;
  userId: string;
  conversationId: string | undefined;
  question: string;
}

interface AskQuestionResult {
  conversationId: string;
  textStream: AsyncIterable<string>;
  onComplete: (fullAnswer: string) => Promise<void>;
}

export async function askQuestion(input: AskQuestionInput): Promise<AskQuestionResult> {
  const document = await documentsRepository.findDocumentById(input.documentId, input.userId);

  if (!document) {
    throw new NotFoundError(`Document ${input.documentId} not found`);
  }

  if (document.status !== 'ready') {
    throw new ConflictError(`Document ${input.documentId} is not ready for questions yet`);
  }

  const conversation = input.conversationId
    ? await chatRepository.findConversationById(input.conversationId, input.userId)
    : await chatRepository.insertConversation(input.userId, input.documentId);

  if (!conversation) {
    throw new NotFoundError(`Conversation ${input.conversationId} not found`);
  }

  const [queryEmbedding, priorMessages] = await Promise.all([
    embedQuery(input.question),
    chatRepository.findMessagesByConversationId(conversation.id),
  ]);

  // Top-K retrieval (Etapa 9), replacing the "whole document in the prompt"
  // approach from Etapa 8. Trade-off worth being honest about: for a document
  // small enough to fit entirely in context, embedding + retrieval adds cost
  // and a chance of missing something a full-context read wouldn't miss — RAG
  // earns its complexity once documents are too large to just paste in.
  const relevantChunks = await chatRepository.findRelevantChunks(input.documentId, queryEmbedding);
  const documentContext = relevantChunks.map((chunk) => chunk.content).join('\n\n');

  await chatRepository.insertMessage({
    conversationId: conversation.id,
    role: 'user',
    content: input.question,
    tokenCount: null,
  });

  const history: ChatMessage[] = [
    ...priorMessages.map((message) => ({ role: message.role, content: message.content })),
    { role: 'user', content: input.question },
  ];

  const textStream = streamAnswer(documentContext, history);

  const onComplete = async (fullAnswer: string) => {
    await chatRepository.insertMessage({
      conversationId: conversation.id,
      role: 'assistant',
      content: fullAnswer,
      tokenCount: null,
    });
  };

  return { conversationId: conversation.id, textStream, onComplete };
}

export async function getConversationMessages(conversationId: string, userId: string) {
  const conversation = await chatRepository.findConversationById(conversationId, userId);

  if (!conversation) {
    throw new NotFoundError(`Conversation ${conversationId} not found`);
  }

  return chatRepository.findMessagesByConversationId(conversationId);
}
