import * as assert from "assert";
import * as commentUtils from "../../../src/commentUtils";

suite("Comment Utils Test Suite", () => {
  test("removeBlockComment", () => {
    const codeWithBlockComment = `
            /* This is a comment in JavaScript */
            const foo = 'bar';

            <!-- This is a comment in HTML -->
            <div></div>
        `;

    const codeWithoutBlockComment = `
            
            const foo = 'bar';

            
            <div></div>
        `;

    assert.strictEqual(
      commentUtils.removeBlockComment(codeWithBlockComment),
      codeWithoutBlockComment
    );
  });

  test("insertComment", () => {
    const snippet = "const foo = 'bar';";
    const data = {
      symbols: { open: "/**", close: " */" },
      comment: "This is a comment.",
    };

    const expectedOutput = "/**\nThis is a comment.\n */\nconst foo = 'bar';";

    assert.strictEqual(
      commentUtils.insertComment(snippet, data),
      expectedOutput
    );
  });

  test("insertComment should throw error when symbols or comment is not provided", () => {
    const snippet = "const foo = 'bar';";
    const dataWithoutSymbols = {
      comment: "This is a comment.",
    };
    const dataWithoutComment = {
      symbols: { open: "/**", close: " */" },
    };

    assert.throws(
      () => commentUtils.insertComment(snippet, dataWithoutSymbols),
      Error,
      "Incomplete data provided to insertComment"
    );
    assert.throws(
      () => commentUtils.insertComment(snippet, dataWithoutComment),
      Error,
      "Incomplete data provided to insertComment"
    );
  });

  test("extractBetweenBraces", () => {
    const text = "foo { bar } baz";
    const expectedOutput = "{ bar }";

    assert.strictEqual(commentUtils.extractBetweenBraces(text), expectedOutput);
  });

  test("extractBetweenBraces should throw error when braces are not found", () => {
    const textWithoutBraces = "foo bar baz";
    const textWithOnlyOpeningBrace = "foo { bar baz";
    const textWithOnlyClosingBrace = "foo bar } baz";

    assert.throws(
      () => commentUtils.extractBetweenBraces(textWithoutBraces),
      Error,
      "Matching braces not found"
    );
    assert.throws(
      () => commentUtils.extractBetweenBraces(textWithOnlyOpeningBrace),
      Error,
      "Matching braces not found"
    );
    assert.throws(
      () => commentUtils.extractBetweenBraces(textWithOnlyClosingBrace),
      Error,
      "Matching braces not found"
    );
  });
});
