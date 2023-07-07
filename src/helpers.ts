export function splitIntoCodeBlocks(code: string): string[] {
  const codeBlocks = code.split(/\n(?=[a-zA-Z])/g);

  return codeBlocks.filter((block) => block.split("\n").length >= 5);
}
