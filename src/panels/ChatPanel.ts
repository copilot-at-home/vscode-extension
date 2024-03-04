import * as vscode from "vscode";
import { getUri } from "../utilities/get-uri";
import { getNonce } from "../utilities/get-nonce";
import { WebSocketServer, WebSocket } from "ws";

export class ChatPanel {
  public static currentPanel: ChatPanel | undefined;
  private readonly _panel: vscode.WebviewPanel;
  private _disposables: vscode.Disposable[] = [];

  private _wss!: WebSocketServer;
  private _wsClient: WebSocket | undefined;

  private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
    this._panel = panel;

    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    this._panel.webview.html = this._getWebviewContent(
      this._panel.webview,
      extensionUri
    );

    this._initWebsocketServer();

    this._setWebviewMessageListener(this._panel.webview);
  }

  public static render(extensionUri: vscode.Uri) {
    if (ChatPanel.currentPanel) {
      ChatPanel.currentPanel._panel.reveal(vscode.ViewColumn.One);
    } else {
      const panel = vscode.window.createWebviewPanel(
        "copilotAtHome",
        "Copilot At Home",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          localResourceRoots: [vscode.Uri.joinPath(extensionUri, "out")],
        }
      );

      ChatPanel.currentPanel = new ChatPanel(panel, extensionUri);
    }
  }

  public static postMessage(message: any) {
    this.currentPanel?._panel.webview.postMessage(message);
  }

  public dispose() {
    ChatPanel.currentPanel = undefined;

    this._panel.dispose();
    this._wsClient?.close();
    this._wss.close();

    while (this._disposables.length) {
      const disposable = this._disposables.pop();
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  private _initWebsocketServer() {
    this._wss = new WebSocketServer({
      port: 8765,
    });

    this._wss.on("connection", (client) => {
      console.log("socket client connected");

      this._wsClient = client;

      client.on("message", (data) => {
        const dataStr = data.toString();

        if (dataStr === "keepalive") {
          return;
        }

        const dataParsed = JSON.parse(dataStr);

        ChatPanel.postMessage({
          command: "receiveMessage",
          data: dataParsed,
        });
      });

      client.on("close", () => {
        this._wsClient = undefined;
      });
    });
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      (message: any) => {
        const { command, data } = message;

        switch (command) {
          case "sendMessage":
            this._wsClient?.send(JSON.stringify(data));
            return;
        }
      },
      undefined,
      this._disposables
    );
  }

  private _getWebviewContent(
    webview: vscode.Webview,
    extensionUri: vscode.Uri
  ) {
    const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
    const styleUri = getUri(webview, extensionUri, ["out", "style.css"]);

    const nonce = getNonce();

    return /*html*/ `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
          <link rel="stylesheet" href="${styleUri}">
          <title>Copilot At Home</title>
        </head>
        <body>
          <div id="messages-container"></div>
          <div id="receiving-message-container"></div>
          <textarea id='prompt-textarea' placeholder='Type here'></textarea>
          <div class='instruction'>Alt + Enter to send</div>
          <script type="module" nonce="${nonce}" src="${webviewUri}"></script>
        </body>
      </html>
    `;
  }
}
