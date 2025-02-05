describe('utils', function () {
  const chalk = require('chalk');
  const utils = require('../src/utils');

  const { strlen, repeat, pad, truncate, mergeOptions, wordWrap } = utils;

  chalk.level = 3;

  function zebra(str) {
    let result = '';

    for (let i = 0; i < str.length; i++) {
      if (i % 2 === 0) {
        result += chalk.whiteBright(str[i]);
      } else {
        result += chalk.blackBright(str[i]);
      }
    }

    return result;
  }

  describe('strlen', function () {
    it('length of "hello" is 5', function () {
      expect(strlen('hello')).toEqual(5);
    });

    it('length of "hi" is 2', function () {
      expect(strlen('hi')).toEqual(2);
    });

    it('length of "hello" in red is 5', function () {
      expect(strlen(chalk.red('hello'))).toEqual(5);
    });

    it('length of "hello" in zebra is 5', function () {
      expect(strlen(zebra('hello'))).toEqual(5);
    });

    it('length of "hello\\nhi\\nheynow" is 6', function () {
      expect(strlen('hello\nhi\nheynow')).toEqual(6);
    });

    it('length of "中文字符" is 8', function () {
      expect(strlen('中文字符')).toEqual(8);
    });

    it('length of "日本語の文字" is 12', function () {
      expect(strlen('日本語の文字')).toEqual(12);
    });

    it('length of "한글" is 4', function () {
      expect(strlen('한글')).toEqual(4);
    });
  });

  describe('repeat', function () {
    it('"-" x 3', function () {
      expect(repeat('-', 3)).toEqual('---');
    });

    it('"-" x 4', function () {
      expect(repeat('-', 4)).toEqual('----');
    });

    it('"=" x 4', function () {
      expect(repeat('=', 4)).toEqual('====');
    });
  });

  describe('pad', function () {
    it("pad('hello',6,' ', right) == ' hello'", function () {
      expect(pad('hello', 6, ' ', 'right')).toEqual(' hello');
    });

    it("pad('hello',7,' ', left) == 'hello  '", function () {
      expect(pad('hello', 7, ' ', 'left')).toEqual('hello  ');
    });

    it("pad('hello',8,' ', center) == ' hello  '", function () {
      expect(pad('hello', 8, ' ', 'center')).toEqual(' hello  ');
    });

    it("pad('hello',9,' ', center) == '  hello  '", function () {
      expect(pad('hello', 9, ' ', 'center')).toEqual('  hello  ');
    });

    it("pad('yo',4,' ', center) == ' yo '", function () {
      expect(pad('yo', 4, ' ', 'center')).toEqual(' yo ');
    });

    it('pad red(hello)', function () {
      expect(pad(chalk.red('hello'), 7, ' ', 'right')).toEqual('  ' + chalk.red('hello'));
    });

    it("pad('hello', 2, ' ', right) == 'hello'", function () {
      expect(pad('hello', 2, ' ', 'right')).toEqual('hello');
    });
  });

  describe('truncate', function () {
    it('truncate("hello", 5) === "hello"', function () {
      expect(truncate('hello', 5)).toEqual('hello');
    });

    it('truncate("hello sir", 7, "…") == "hello …"', function () {
      expect(truncate('hello sir', 7, '…')).toEqual('hello …');
    });

    it('truncate("hello sir", 6, "…") == "hello…"', function () {
      expect(truncate('hello sir', 6, '…')).toEqual('hello…');
    });

    it('truncate("goodnight moon", 8, "…") == "goodnig…"', function () {
      expect(truncate('goodnight moon', 8, '…')).toEqual('goodnig…');
    });

    it('truncate(colors.zebra("goodnight moon"), 15, "…") == colors.zebra("goodnight moon")', function () {
      let original = zebra('goodnight moon');
      expect(truncate(original, 15, '…')).toEqual(original);
    });

    it('truncate(colors.zebra("goodnight moon"), 8, "…") == colors.zebra("goodnig") + "…"', function () {
      let original = zebra('goodnight moon');
      let expected = zebra('goodnig') + '…';
      expect(truncate(original, 8, '…')).toEqual(expected);
    });

    it('truncate(colors.zebra("goodnight moon"), 9, "…") == colors.zebra("goodnig") + "…"', function () {
      let original = zebra('goodnight moon');
      let expected = zebra('goodnigh') + '…';
      expect(truncate(original, 9, '…')).toEqual(expected);
    });

    it('red(hello) + green(world) truncated to 9 chars', function () {
      let original = chalk.red('hello') + chalk.green(' world');
      let expected = chalk.red('hello') + chalk.green(' wo') + '…';
      expect(truncate(original, 9)).toEqual(expected);
    });

    it('red-on-green(hello) + green-on-red(world) truncated to 9 chars', function () {
      let original = chalk.red.bgGreen('hello') + chalk.green.bgRed(' world');
      let expected = chalk.red.bgGreen('hello') + chalk.green.bgRed(' wo') + '…';
      expect(truncate(original, 9)).toEqual(expected);
    });

    it('red-on-green(hello) + green-on-red(world) truncated to 10 chars - using inverse', function () {
      let original = chalk.red.bgGreen('hello' + chalk.inverse(' world'));
      let expected = chalk.red.bgGreen('hello' + chalk.inverse(' wor')) + '…';
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('red-on-green( zebra (hello world) ) truncated to 11 chars', function () {
      let original = chalk.red.bgGreen(zebra('hello world'));
      let expected = chalk.red.bgGreen(zebra('hello world'));
      expect(truncate(original, 11)).toEqual(expected);
    });

    it.skip('red-on-green( zebra (hello world) ) truncated to 10 chars', function () {
      let original = chalk.bgGreen(zebra('hello world'));
      let expected = chalk.bgGreen(zebra('hello wor')) + '…';

      console.log(truncate(original, 10).replace(/\u001b/g, 'ESC'));
      console.log(expected.replace(/\u001b/g, 'ESC'));
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('handles reset code', function () {
      let original = '\x1b[31mhello\x1b[0m world';
      let expected = '\x1b[31mhello\x1b[0m wor…';
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('handles reset code (EMPTY VERSION)', function () {
      let original = '\x1b[31mhello\x1b[0m world';
      let expected = '\x1b[31mhello\x1b[0m wor…';
      expect(truncate(original, 10)).toEqual(expected);
    });

    it('truncateWidth("漢字テスト", 15) === "漢字テスト"', function () {
      expect(truncate('漢字テスト', 15)).toEqual('漢字テスト');
    });

    it('truncateWidth("漢字テスト", 6) === "漢字…"', function () {
      expect(truncate('漢字テスト', 6)).toEqual('漢字…');
    });

    it('truncateWidth("漢字テスト", 5) === "漢字…"', function () {
      expect(truncate('漢字テスト', 5)).toEqual('漢字…');
    });

    it('truncateWidth("漢字testてすと", 12) === "漢字testて…"', function () {
      expect(truncate('漢字testてすと', 12)).toEqual('漢字testて…');
    });

    it('handles color code with CJK chars', function () {
      let original = '漢字\x1b[31m漢字\x1b[0m漢字';
      let expected = '漢字\x1b[31m漢字\x1b[0m漢…';
      expect(truncate(original, 11)).toEqual(expected);
    });
  });

  function defaultOptions() {
    return {
      chars: {
        top: '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        bottom: '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        left: '│',
        'left-mid': '├',
        mid: '─',
        'mid-mid': '┼',
        right: '│',
        'right-mid': '┤',
        middle: '│',
      },
      truncate: '…',
      colWidths: [],
      rowHeights: [],
      colAligns: [],
      rowAligns: [],
      style: {
        'padding-left': 1,
        'padding-right': 1,
        head: ['red'],
        border: ['grey'],
        compact: false,
      },
      head: [],
    };
  }

  describe('mergeOptions', function () {
    it('allows you to override chars', function () {
      expect(mergeOptions()).toEqual(defaultOptions());
    });

    it('chars will be merged deeply', function () {
      let expected = defaultOptions();
      expected.chars.left = 'L';
      expect(mergeOptions({ chars: { left: 'L' } })).toEqual(expected);
    });

    it('style will be merged deeply', function () {
      let expected = defaultOptions();
      expected.style['padding-left'] = 2;
      expect(mergeOptions({ style: { 'padding-left': 2 } })).toEqual(expected);
    });

    it('head will be overwritten', function () {
      let expected = defaultOptions();
      expected.style.head = [];
      //we can't use lodash's `merge()` in implementation because it would deeply copy array.
      expect(mergeOptions({ style: { head: [] } })).toEqual(expected);
    });

    it('border will be overwritten', function () {
      let expected = defaultOptions();
      expected.style.border = [];
      //we can't use lodash's `merge()` in implementation because it would deeply copy array.
      expect(mergeOptions({ style: { border: [] } })).toEqual(expected);
    });
  });

  describe('wordWrap', function () {
    it('length', function () {
      let input = 'Hello, how are you today? I am fine, thank you!';

      let expected = 'Hello, how\nare you\ntoday? I\nam fine,\nthank you!';

      expect(wordWrap(10, input).join('\n')).toEqual(expected);
    });

    it.skip('length with colors', function () {
      let input = chalk.red('Hello, how are') + chalk.blue(' you today? I') + chalk.green(' am fine, thank you!');

      let expected =
        chalk.red('Hello, how\nare') + chalk.blue(' you\ntoday? I') + chalk.green('\nam fine,\nthank you!');

      expect(wordWrap(10, input).join('\n')).toEqual(expected);
    });

    it('will not create an empty last line', function () {
      let input = 'Hello Hello ';

      let expected = 'Hello\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('will handle color reset code', function () {
      let input = '\x1b[31mHello\x1b[0m Hello ';

      let expected = '\x1b[31mHello\x1b[0m\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('will handle color reset code (EMPTY version)', function () {
      let input = '\x1b[31mHello\x1b[m Hello ';

      let expected = '\x1b[31mHello\x1b[m\nHello';

      expect(wordWrap(5, input).join('\n')).toEqual(expected);
    });

    it('words longer than limit will not create extra newlines', function () {
      let input = 'disestablishment is a multiplicity someotherlongword';

      let expected = 'disestablishment\nis a\nmultiplicity\nsomeotherlongword';

      expect(wordWrap(7, input).join('\n')).toEqual(expected);
    });

    it('multiple line input', function () {
      let input = 'a\nb\nc d e d b duck\nm\nn\nr';
      let expected = ['a', 'b', 'c d', 'e d', 'b', 'duck', 'm', 'n', 'r'];

      expect(wordWrap(4, input)).toEqual(expected);
    });

    it('will not start a line with whitespace', function () {
      let input = 'ab cd  ef gh  ij kl';
      let expected = ['ab cd', 'ef gh', 'ij kl'];
      expect(wordWrap(7, input)).toEqual(expected);
    });

    it('wraps CJK chars', function () {
      let input = '漢字 漢\n字 漢字';
      let expected = ['漢字 漢', '字 漢字'];
      expect(wordWrap(7, input)).toEqual(expected);
    });

    it('wraps CJK chars with colors', function () {
      let input = '\x1b[31m漢字\x1b[0m\n 漢字';
      let expected = ['\x1b[31m漢字\x1b[0m', ' 漢字'];
      expect(wordWrap(5, input)).toEqual(expected);
    });
  });

  describe('colorizeLines', function () {
    it('foreground colors continue on each line', function () {
      let input = chalk.red('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([chalk.red('Hello'), chalk.red('Hi')]);
    });

    it('foreground colors continue on each line', function () {
      let input = chalk.bgRed('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([chalk.bgRed('Hello'), chalk.bgRed('Hi')]);
    });

    it('styles will continue on each line', function () {
      let input = chalk.underline('Hello\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([chalk.underline('Hello'), chalk.underline('Hi')]);
    });

    it('styles that end before the break will not be applied to the next line', function () {
      let input = (chalk.underline('Hello') + '\nHi').split('\n');

      expect(utils.colorizeLines(input)).toEqual([chalk.underline('Hello'), 'Hi']);
    });

    it('the reset code can be used to drop styles', function () {
      let input = '\x1b[31mHello\x1b[0m\nHi'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[31mHello\x1b[0m', 'Hi']);
    });

    it('handles aixterm 16-color foreground', function () {
      let input = '\x1b[90mHello\nHi\x1b[0m'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[90mHello\x1b[39m', '\x1b[90mHi\x1b[0m']);
    });

    it('handles aixterm 16-color background', function () {
      let input = '\x1b[100mHello\nHi\x1b[m\nHowdy'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[100mHello\x1b[49m', '\x1b[100mHi\x1b[m', 'Howdy']);
    });

    it('handles aixterm 256-color foreground', function () {
      let input = '\x1b[48;5;8mHello\nHi\x1b[0m\nHowdy'.split('\n');
      expect(utils.colorizeLines(input)).toEqual(['\x1b[48;5;8mHello\x1b[49m', '\x1b[48;5;8mHi\x1b[0m', 'Howdy']);
    });

    it('handles CJK chars', function () {
      let input = chalk.red('漢字\nテスト').split('\n');

      expect(utils.colorizeLines(input)).toEqual([chalk.red('漢字'), chalk.red('テスト')]);
    });
  });
});
