import Markdown from 'markdown-it';
import R from 'ramda';
import { OrderedMap } from 'immutable';
const mark = new Markdown({
  html: true,
});

import { Modifier, ContentBlock, genKey, ContentState } from 'draft-js';

const toList = R.unapply(R.identity);

const fromList = R.apply(R.identity);

const eq = R.pipe(
  R.prop('type'),
  R.equals('paragraph_open'),
);

const isType = type => R.pipe(
  R.last,
  R.prop('type'),
  R.equals(type),
);

const styles = {
  'BOLD': 'BOLD',
}

const blockDict = {
  'h1': 'header-one',
  'h2': 'header-two',
  'h3': 'header-three',
  'h4': 'header-four',
  'h5': 'header-four',
  'h6': 'header-four',
  'ul': 'unordered-list-item',
  'ol': 'ordered-list-item',
}

const openBlock = ([accum, val]) => {
  // console.log('open block', val)
  return {
    ...accum,
    openBlock: accum.openBlock ? accum.openBlock : val,
  };
};

const closeBlock = ([accum, val]) => ({
  ...accum,
  openBlock: accum.openBlock.tag === val.tag ? false: accum.openBlock,
});

const transformInline = ([accum, val]) => {
  const newBlock = new ContentBlock({
    key: genKey(),
    text: '',
    type: blockDict[accum.openBlock.tag] || 'unstyled',
  });

  // const newContent = ContentState.createFromBlockArray([newBlock])

  let content = ContentState.createFromBlockArray([
   ...accum.content.getBlockMap().toArray(),
    newBlock,
  ]);

  val.children.forEach(child => {
    const selection = content.getSelectionAfter().merge({
      anchorKey: newBlock.getKey(),
      focusKey: newBlock.getKey(),
    });

    console.log('child', child);
    // console.log(selection)
    content = Modifier.insertText(
      content,
      selection,
      child.content,
    );
  })

  return { 
    ...accum,
    content,
  };
};

const reduce = R.pipe(
  toList,
  R.cond([
    [R.anyPass([
      isType('heading_open'),
      isType('paragraph_open'),
      isType('list_item_open'),
      isType('bullet_list_open'),
    ]), openBlock],
    [R.anyPass([
      isType('paragraph_close'),
      isType('heading_close'),
      isType('list_item_close'),
      isType('bullet_list_close'),
    ]), closeBlock],
    [isType('inline'), transformInline],
    [R.T, R.head],
  ])
);

export const transform = tokens => R.reduce(
  reduce,
  {
    content: ContentState.createFromBlockArray([]),
    openBlock: false,
  },
  tokens
);

export const parse = (string) => {
  const tokens = mark.parse(string, mark.options);
  // console.log('tokens', tokens);
  return transform(tokens);
};

export default {};
