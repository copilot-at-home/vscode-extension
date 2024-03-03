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

  receiveMessage({
    id,
    content,
  }: {
    id: number;
    content: string;
  }): ChatMessage {
    const state = this.getState();

    const receivedMsg: ChatMessage = {
      id,
      content,
      from: "assistant",
    };

    let existingMsgIdx = state.messages.findIndex((msg) => msg.id === id);

    if (existingMsgIdx >= 0) {
      state.messages[existingMsgIdx] = receivedMsg;
    } else {
      state.messages.push(receivedMsg);
    }

    this.setState({
      messages: state.messages,
    });

    return receivedMsg;
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
}
