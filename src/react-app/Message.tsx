import { useAgent } from "agents/react";
import React, { useState } from "react";

const Message = () => {
  const [agentState, setAgentState] = useState<{
    message: string;
  }>({
    message: "",
  });

  useAgent({
    agent: "CONVERSATION_DO",
    onStateUpdate: (state) => {
      setAgentState(state as { message: string });
    },
  });
  return (
    <div>
      <div>{agentState.message}</div>
    </div>
  );
};

export default Message;
