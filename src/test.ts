import { parseNative } from 'tsconfck';

async function main() {
  const { tsconfig } = await parseNative(__dirname + '../../tsconfig.json');
  console.log(tsconfig);
}

main();
