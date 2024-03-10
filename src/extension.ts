import * as vscode from "vscode";
import { WebSocket, WebSocketServer } from "ws";

let wss: WebSocketServer;
let wsClient: WebSocket | undefined;

export function activate(context: vscode.ExtensionContext) {
  startWebSocketServer();

  const copyTextCommand = vscode.commands.registerCommand(
    "copilotAtHome.copyText",
    () => runCopyTextCommand({ type: "copy" })
  );

  const copyTextAndSendCommand = vscode.commands.registerCommand(
    "copilotAtHome.copyTextAndSend",
    () => runCopyTextCommand({ type: "copyAndSend" })
  );

  context.subscriptions.push(...[copyTextCommand, copyTextAndSendCommand]);
}

export function deactivate() {
  wsClient?.close();
  wss.close();
}

function startWebSocketServer() {
  wss = new WebSocketServer({
    port: 8765,
  });

  wss.on("connection", (client) => {
    wsClient = client;

    client.on("close", () => {
      wsClient = undefined;
    });
  });
}

function runCopyTextCommand({ type }: Pick<Command, "type">) {
  const content = getSelectedTextFromEditor();
  if (content) {
    runCommand({
      type,
      content,
    });
  }
}

function getSelectedTextFromEditor() {
  const editor = vscode.window.activeTextEditor;
  if (editor) {
    return editor.document.getText(editor.selection);
  }
}

interface Command {
  type: "copy" | "copyAndSend";
  content: string;
}

function runCommand(command: Command) {
  if (!wsClient) {
    return;
  }

  wsClient.send(JSON.stringify(command));
}
