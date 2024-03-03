import { ChatSession, Message } from "./chat-session";

window.addEventListener("load", main);

function main() {
  const chatSession = new ChatSession();

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

  const messagesContainer = document.getElementById(
    "messages-container"
  ) as HTMLDivElement;
  const messages = chatSession.getState().messages.map(createMsgDiv);
  messagesContainer.append(...messages);

  document.addEventListener("keydown", (ev) => {
    if (ev.altKey && ev.key === "Enter") {
      const message = chatSession.sendMessage();

      messagesContainer.appendChild(createMsgDiv(message));
      promptTextarea.value = chatSession.getState().draft;
    }
  });
}

function createMsgDiv(msg: Message) {
  const msgDiv = document.createElement("div");
  msgDiv.innerText = msg.content;
  return msgDiv;
}
