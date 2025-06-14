import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { Agent, Connection, WSMessage } from "agents";

export interface Env {
  CONVERSATION_DO: DurableObjectNamespace;
  OPENAI_API_KEY: string;
}

export interface ConversationState {
  conversations: Record<
    string,
    Record<
      string,
      {
        role: string;
        content: string;
      }
    >
  >;
}

export class ConversationDO extends Agent<Env, ConversationState> {
  private openai: ReturnType<typeof createOpenAI>;

  initialState: ConversationState = {
    conversations: {},
  };

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    this.openai = createOpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async onConnect(): Promise<void> {}

  async onDisconnect(connection: Connection): Promise<void> {
    connection.close();
  }

  async onMessage(connection: Connection, message: WSMessage): Promise<void> {
    const msg = JSON.parse(message.toString());

    if (msg.type === "message") {
      await this.queryModel(connection, {
        conversationId: msg.conversationId,
        prompt: msg.prompt,
      });
    } else if (msg.type === "set-conversation") {
      const conversationId = crypto.randomUUID();
      this.setState({
        conversations: {
          ...this.state.conversations,
          [conversationId]: {},
        },
      });
    }
  }

  async queryModel(
    connection: Connection,
    message: {
      conversationId: string;
      prompt: string;
    }
  ): Promise<void> {
    try {
      const messageId = crypto.randomUUID();
      const { textStream } = streamText({
        model: this.openai("gpt-4o"),
        prompt: message.prompt,
      });

      let text = "";
      const newConversation = {
        [messageId]: {
          role: "assistant",
          content: "",
        },
      };
      for await (const chunk of textStream) {
        text += chunk;
        newConversation[messageId] = {
          role: "assistant",
          content: text,
        };
        const newState = {
          conversations: {
            ...this.state.conversations,
            [message.conversationId]: {
              ...this.state.conversations[message.conversationId],
              [messageId]: newConversation[messageId],
            },
          },
        };
        this.setState(newState);
      }
    } catch (e) {
      console.error(e);
    }
  }
}
