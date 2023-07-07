import * as vscode from "vscode";

import { APIHandler } from "./api";

type Data = {
  symbols?: { open: string; close: string };
  comment?: string;
  firstLine?: string;
  isFunction?: boolean;
};

// remove block comment
export function removeBlockComment(code: string): string {
  const commentPatterns = [
    /\*[^]*?\*\//g, // For languages like JavaScript, Java, C, C++, C#, CSS, Swift, Rust, SQL, Kotlin, Scala, Groovy, PHP, Dart, Go
    /<!--[^]*?-->/g, // For HTML and XML
    /""".*?"""/gs, // For Python
    /'''.*?'''/gs, // For Python's alternative syntax
    /=begin[^]*?=end/gs, // For Ruby
    /--\[\[[^]*?\]\]/g, // For Lua
    /%\{[^]*?%\}/g, // For MATLAB, GNU Octave
    /\(\*[^]*?\*\)/g, // For Pascal, Delphi
    /<\%--[^]*?--\%>/g, // For JSP
  ];

  return commentPatterns.reduce(
    (currentCode, pattern) => currentCode.replace(pattern, ""),
    code
  );
}

// insert comment
export function insertComment(snippet: string, data: Data) {
  const { symbols, comment } = data;

  if (!symbols || !comment) {
    throw new Error("Incomplete data provided to insertComment");
  }

  const { open, close } = symbols;

  return [
    open,
    comment
      .replace(/\. /g, ".\n")
      .replace(/\\n\\n/g, "\n")
      .replace(/\\n/g, "\n"),
    close,
    snippet,
  ].join("\n");
}

function extractBetweenBraces(text: string) {
  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
    throw new Error("Matching braces not found");
  }

  return text.slice(firstBrace, lastBrace + 1);
}

// parse response
function parseResponse(response: any): any {
  return JSON.parse(extractBetweenBraces(response.data));
}

// update editor text
async function updateEditorText(
  editor: vscode.TextEditor,
  code: string
): Promise<void> {
  const fullRange = new vscode.Range(
    editor.document.positionAt(0),
    editor.document.positionAt(code.length)
  );
  await editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, code);
  });
}

export async function commentFunctions(
  code: string,
  functionsInCode: string[],
  editor: vscode.TextEditor
): Promise<void> {
  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: "Polyfact Autodoc",
      cancellable: true,
    },
    async (progress) => {
      progress.report({ message: "Starting...", increment: 0 });
      const progressIncrement = 100 / functionsInCode.length;
      const language = editor.document.languageId;

      const promises = functionsInCode.map((originalFunction, i) => {
        const functionWithoutBlockComment =
          removeBlockComment(originalFunction);

        return APIHandler.comment(functionWithoutBlockComment, language)
          .then((response) => {
            const responseData = parseResponse(response);
            const codeWithBlockComment = insertComment(
              functionWithoutBlockComment,
              responseData
            );

            code = code.replace(originalFunction, codeWithBlockComment);
            progress.report({
              message: `Commenting function ${i + 1}`,
              increment: progressIncrement,
            });
          })
          .catch((error) => {
            vscode.window.showErrorMessage(
              "Failed to fetch comments for function: " + (i + 1)
            );
            console.error(error);
          });
      });

      const results = await Promise.allSettled(promises);

      const rejectedPromises = results.filter(
        (result) => result.status === "rejected"
      );
      if (rejectedPromises.length > 0) {
        vscode.window.showErrorMessage(
          "Some functions failed to fetch comments"
        );
      }

      progress.report({ message: "Commenting complete", increment: 100 });
      await updateEditorText(editor, code);
    }
  );
}
