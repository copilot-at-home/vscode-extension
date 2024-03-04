import { ChatSession, ChatMessage } from "./chat-session";

window.addEventListener("load", main);

function main() {
  const chatSession = new ChatSession();
  const promptTextarea = getPromptTextArea(chatSession);
  const messagesContainer = getMessagesContainer(chatSession);
  const receivingMsgContainer = getReceivingMessageContainer();

  document.addEventListener("keydown", (ev) => {
    if (ev.altKey && ev.key === "Enter") {
      const message = chatSession.sendMessage();

      messagesContainer.appendChild(createMsgDiv(message));
      promptTextarea.value = chatSession.getState().draft;
      promptTextarea.dispatchEvent(new CustomEvent("input"));
    }
  });

  window.addEventListener("message", (ev) => {
    const { command, data } = ev.data;

    switch (command) {
      case "receiveMessage":
        const { isComplete, receivedMsg } = chatSession.receiveMessage(data);
        let content = receivedMsg.content;

        if (isComplete) {
          messagesContainer.appendChild(createMsgDiv(receivedMsg));
          content = "";
        }

        receivingMsgContainer.innerHTML = content;

        return;
      case "copyText":
        const draft = chatSession.copyText(data);
        promptTextarea.value = draft;
        promptTextarea.dispatchEvent(new CustomEvent("input"));
    }
  });
}

function getPromptTextArea(chatSession: ChatSession) {
  const promptTextarea = document.getElementById(
    "prompt-textarea"
  ) as HTMLTextAreaElement;

  promptTextarea.value = chatSession.getState().draft;

  promptTextarea.addEventListener("input", function () {
    this.style.height = "10px";
    this.style.height = this.scrollHeight + "px";
    chatSession.setState({
      draft: this.value,
    });
  });

  return promptTextarea;
}

function getMessagesContainer(chatSession: ChatSession) {
  const messagesContainer = document.getElementById(
    "messages-container"
  ) as HTMLDivElement;

  const messages = chatSession.getState().messages.map(createMsgDiv);

  messagesContainer.append(...messages);

  return messagesContainer;
}

function getReceivingMessageContainer() {
  const receivingMsgContainer = document.getElementById(
    "receiving-message-container"
  ) as HTMLDivElement;

  return receivingMsgContainer;
}

function createMsgDiv(msg: ChatMessage) {
  const msgDiv = document.createElement("div");

  if (msg.from === "user") {
    msgDiv.innerText = msg.content;
  } else {
    msgDiv.innerHTML = msg.content;
  }
  return msgDiv;
}
