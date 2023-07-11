import * as vscode from "vscode";

import { APIHandler } from "./api";
import { isError } from "./helpers";

const ERR_NOT_FUNCTION = "The provided data does not represent a function.";
const ERR_INCOMPLETE_DATA =
  "The provided data is incomplete. It must contain symbols and a comment.";

type Data = {
  symbols?: { open: string; close: string };
  comment?: string;
  firstLine?: string;
  isFunction?: boolean;
};

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

export function insertComment(snippet: string, data: Data) {
  const { symbols, comment, isFunction } = data;

  if (!isFunction) {
    throw new Error(ERR_NOT_FUNCTION);
  }

  if (!symbols || !comment) {
    throw new Error(ERR_INCOMPLETE_DATA);
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

export function parseResponse(response: any): any {
  return JSON.parse(extractBetweenBraces(response.data));
}

export function updateEditorText(
  editor: vscode.TextEditor,
  code: string
): Thenable<boolean> {
  const fullRange = editor.document.validateRange(
    new vscode.Range(0, 0, Infinity, Infinity)
  );

  return editor.edit((editBuilder) => {
    editBuilder.replace(fullRange, code);
  });
}

async function commentFunction(
  originalFunction: string,
  language: string,
  accessToken: string,
  mode: string
): Promise<string> {
  const request = new APIHandler();
  const response = await request.comment(
    originalFunction,
    language,
    accessToken,
    mode
  );
  const responseData = parseResponse(response);

  return insertComment(originalFunction, responseData);
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
      progress.report({ message: "Generating...", increment: 3 });
      const progressIncrement = 100 / functionsInCode.length;
      const language = editor.document.languageId;

      const config = vscode.workspace.getConfiguration("polyfact-extension");
      const accessToken = config.get("accessToken") as string;
      const mode = config.get("mode") as string;

      const promises = functionsInCode.map(async (originalFunction, i) => {
        try {
          const codeWithBlockComment = await commentFunction(
            originalFunction,
            language,
            accessToken,
            mode
          );

          code = code.replace(originalFunction, codeWithBlockComment);

          progress.report({
            message: `Commenting function ${i + 1}`,
            increment: progressIncrement,
          });
        } catch (error) {
          if (isError(error)) {
            if (error.message === ERR_NOT_FUNCTION) {
              console.log("It's not a function : ", originalFunction);
            } else if (error.message === ERR_INCOMPLETE_DATA) {
              vscode.window.showErrorMessage(
                "Failed to fetch comments for function: " + (i + 1)
              );
            }
            console.error(error);
          } else {
            console.error("An unexpected error occurred: ", error);
          }
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
