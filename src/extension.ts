import * as vscode from "vscode";
import { ChatPanel } from "./panels/ChatPanel";

export function activate(context: vscode.ExtensionContext) {
  const startSessionCommand = vscode.commands.registerCommand(
    "copilotAtHome.startSession",
    () => {
      ChatPanel.render(context.extensionUri);
    }
  );

  const copyTextCommand = vscode.commands.registerCommand(
    "copilotAtHome.copyText",
    () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        const selectedText = editor.document.getText(editor.selection);
        ChatPanel.postMessage({ command: "copyText", data: selectedText });
      }
    }
  );

  context.subscriptions.push(...[startSessionCommand, copyTextCommand]);
}

export function deactivate() {}
