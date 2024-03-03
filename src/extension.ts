import * as vscode from "vscode";
import { ChatPanel } from "./panels/ChatPanel";

export function activate(context: vscode.ExtensionContext) {
  const startSessionCommand = vscode.commands.registerCommand(
    "copilotAtHome.startSession",
    () => {
      ChatPanel.render(context.extensionUri);
    }
  );

  context.subscriptions.push(startSessionCommand);
}

export function deactivate() {}
