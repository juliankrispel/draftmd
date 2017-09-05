import { parse, transform } from './draftmd';
import { convertToRaw } from 'draft-js';

describe('transform', () => {
  it('takes array as input and returns ')
});

it('parses tokens', () => {
  const tokens = parse(
  `# Hello World
  How's __it hanging__?
  - One
  - Two
  - Three`);

  console.log(convertToRaw(tokens.content));
});
