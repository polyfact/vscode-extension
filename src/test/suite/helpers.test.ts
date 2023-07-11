import * as assert from "assert";
import { splitIntoCodeBlocks } from "../../helpers";

suite("Helpers Test Suite", () => {
  test("splitIntoCodeBlocks", () => {
    const code = "function foo() {}\nfunction bar() {}";
    const blocks = splitIntoCodeBlocks(code);
    assert.strictEqual(blocks.length, 2);
    assert.strictEqual(blocks[0], "function foo() {}");
    assert.strictEqual(blocks[1], "function bar() {}");
  });
});
