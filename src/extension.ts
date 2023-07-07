import * as vscode from "vscode";
import { commentFunctions } from "./commentUtils";
import { splitIntoCodeBlocks } from "./helpers";
import { APIHandler } from "./api";

const getActiveEditor = (): vscode.TextEditor | undefined => {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showInformationMessage("No active text editor");
    return undefined;
  }
  return editor;
};

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "polyfact-extension.commentFunctions",
    async () => {
      const editor = getActiveEditor();

      if (!editor) {
        return;
      }

      try {
        const option = await vscode.window.showWarningMessage(
          "Please do not close this tab, switch tabs, or edit the code while the operation is in progress.",
          { modal: true },
          "Continue"
        );
        if (option === "Continue") {
          const document = editor.document;
          const code = document.getText();
          const functionsInCode = splitIntoCodeBlocks(code);

          await commentFunctions(code, functionsInCode, editor);

          vscode.window.showInformationMessage("End");
        }
      } catch (error: any) {
        vscode.window.showErrorMessage(`An error occurred: ${error.message}`);
        APIHandler.cancelOperation();
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
