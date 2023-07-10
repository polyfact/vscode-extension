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
  const { symbols, comment, isFunction } = data;

  if (!isFunction) {
    throw new Error("NOT_FUNCTION");
  }

  if (!symbols || !comment) {
    console.log({ symbols, comment, snippet, data });
    throw new Error("INCOMPLETE_DATA");
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
  ]
    .join("\n")
    .trim();
}

export function extractBetweenBraces(text: string) {
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
    editor.document.positionAt(999999999999)
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
      progress.report({ message: "Generating...", increment: 0 });
      const progressIncrement = 100 / functionsInCode.length;
      const language = editor.document.languageId;

      const config = vscode.workspace.getConfiguration("polyfact-extension");
      const accessToken = config.get("accessToken") as string;
      const mode = config.get("mode") as string;

      const promises = functionsInCode.map(async (originalFunction, i) => {
        const request = new APIHandler();

        try {
          const response = await request.comment(
            originalFunction,
            language,
            accessToken,
            mode
          );
          const responseData = parseResponse(response);
          const codeWithBlockComment = insertComment(
            originalFunction,
            responseData
          );

          code = code.replace(originalFunction, codeWithBlockComment);

          progress.report({
            message: `Commenting function ${i + 1}`,
            increment: progressIncrement,
          });
        } catch (error: any) {
          console.log({ error });
          if (error.message === "NOT_FUNCTION") {
            console.log("It's not a function : ", originalFunction);
          } else if (error.message === "INCOMPLETE_DATA") {
            vscode.window.showErrorMessage(
              "Failed to fetch comments for function: " + (i + 1)
            );
          }
          console.error(error);
          request.cancelOperation(true);
        }
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
