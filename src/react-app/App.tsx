import { useRef, useState } from "react";
import "./App.css";
import { useAgent } from "agents/react";
import { ConversationState } from "../worker/conversation";

function App() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [agentState, setAgentState] = useState<ConversationState>({
    conversations: {},
  });
  const connection = useAgent<ConversationState>({
    agent: "CONVERSATION_DO",
    name: "just",
    onStateUpdate: (state) => {
      setAgentState(state);
    },
  });

  const sendMessage = async () => {
    connection.send(
      JSON.stringify({
        type: "message",
        conversationId: selectedConversation,
        prompt: inputRef.current?.value,
      })
    );
  };

  const newConversation = () => {
    connection.send(
      JSON.stringify({
        type: "set-conversation",
      })
    );
  };

  const selectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
  };

  const messages = agentState.conversations[selectedConversation ?? ""];
  return (
    <div className="app">
      <div className="sidebar">
        <h1>Chat</h1>
        <button id="new-conversation" onClick={newConversation}>
          New Conversation
        </button>
        <div>
          {Object.keys(agentState.conversations).map((conversationId) => {
            return (
              <div
                key={conversationId}
                onClick={() => selectConversation(conversationId)}
              >
                {conversationId.slice(0, 10)}
              </div>
            );
          })}
        </div>
      </div>
      <div className="content">
        <div className="messages">
          {messages &&
            Object.entries(messages).map(([messageId, message]) => (
              <div key={messageId}>
                {message.role}: {message.content}
              </div>
            ))}
        </div>
        <div className="input-container">
          <input type="text" id="input" ref={inputRef} />
          <button id="send" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
