export interface ChatMessage {
  id: number;
  content: string;
  from: "user" | "assistant";
}

interface Chat {
  draft: string;
  messages: ChatMessage[];
}

const vscode = acquireVsCodeApi<Chat>();

interface SetChatSessionState {
  draft?: string;
  messages?: ChatMessage[];
}

export class ChatSession {
  private _defaultState: Chat = {
    draft: "",
    messages: [],
  };

  constructor() {
    this.setState({});
  }

  getState(): Chat {
    return vscode.getState() ?? this._defaultState;
  }

  setState(state: SetChatSessionState) {
    vscode.setState({
      ...this.getState(),
      ...state,
    });
  }

  sendMessage(): ChatMessage {
    const state = this.getState();

    const message: ChatMessage = {
      id: state.messages.length + 1,
      content: state.draft,
      from: "user",
    };

    this.setState({
      draft: "",
      messages: [...state.messages, message],
    });

    vscode.postMessage({
      command: "sendMessage",
      data: {
        id: message.id + 1,
        content: message.content,
      },
    });

    return message;
  }

  receiveMessage({ id, content }: { id: number; content: string }): {
    isComplete: boolean;
    receivedMsg: ChatMessage;
  } {
    const endOfMessageIdentifier = "@@@@@";
    const isComplete = content.endsWith(endOfMessageIdentifier);

    const receivedMsg: ChatMessage = {
      id,
      content: isComplete
        ? content.substring(0, content.length - endOfMessageIdentifier.length)
        : content,
      from: "assistant",
    };

    if (isComplete) {
      this.onReceivingMessageCompleted(receivedMsg);
    }

    return { isComplete, receivedMsg };
  }

  copyText(text: string): string {
    let { draft } = this.getState();

    if (draft) {
      draft += "\n";
    }

    draft += text;

    this.setState({ draft });

    return draft;
  }

  private onReceivingMessageCompleted(receivedMsg: ChatMessage) {
    const state = this.getState();
    this.setState({
      messages: [...state.messages, receivedMsg],
    });
  }
}
