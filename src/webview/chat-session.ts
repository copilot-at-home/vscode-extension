export interface Message {
  id: number;
  content: string;
  from: "user" | "assistant";
}

interface Chat {
  draft: string;
  messages: Message[];
}

const vscode = acquireVsCodeApi<Chat>();

interface SetChatSessionState {
  draft?: string;
  messages?: Message[];
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

    console.log(this.getState());
  }

  sendMessage(): Message {
    const state = this.getState();

    const message: Message = {
      id: state.messages.length + 1,
      content: state.draft,
      from: "user",
    };

    this.setState({
      draft: "",
      messages: [...state.messages, message],
    });

    return message;
  }
}
