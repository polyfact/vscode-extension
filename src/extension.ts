import * as vscode from "vscode";
import { commentFunctions, removeBlockComment } from "./commentUtils";
import { splitIntoCodeBlocks } from "./helpers";

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

      const option = await vscode.window.showWarningMessage(
        "Please do not close this tab, switch tabs, or edit the code while the operation is in progress.",
        { modal: true },
        "Continue"
      );
      if (option === "Continue") {
        const document = editor.document;
        const code = removeBlockComment(document.getText());
        const functionsInCode = splitIntoCodeBlocks(code);

        await commentFunctions(code, functionsInCode, editor);

        vscode.window.showInformationMessage("Comments Block generated!");
      }
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
