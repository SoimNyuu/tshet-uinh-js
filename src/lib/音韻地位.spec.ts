import { readFileSync } from 'fs';

import test from 'ava';

import { iter音韻地位, query字頭 } from './解析資料';
import { 音韻地位 } from './音韻地位';

// 由音韻地位得出各項音韻屬性

test('測試「法」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '幫');
  t.is(當前音韻地位.呼, null);
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.重紐, null);
  t.is(當前音韻地位.韻, '凡');
  t.is(當前音韻地位.聲, '入');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全清');
  t.is(當前音韻地位.音, '脣');
  t.is(當前音韻地位.攝, '咸');

  // 其他
  t.is(當前音韻地位.描述, '幫三凡入');
  t.is(當前音韻地位.最簡描述, '幫凡入');
  t.is(當前音韻地位.表達式, '幫母 開合中立 三等 不分重紐 凡韻 入聲');
  t.is(當前音韻地位.編碼, 'A9D');

  t.true(當前音韻地位.等於(音韻地位.from描述('幫凡入')));
});

test('測試「祇」字對應的音韻地位的各項音韻屬性', t => {
  const 當前音韻地位 = 音韻地位.from描述('羣開三A支平');

  // 基本音韻屬性（六個）
  t.is(當前音韻地位.母, '羣');
  t.is(當前音韻地位.呼, '開');
  t.is(當前音韻地位.等, '三');
  t.is(當前音韻地位.重紐, 'A');
  t.is(當前音韻地位.韻, '支');
  t.is(當前音韻地位.聲, '平');

  // 拓展音韻屬性
  t.is(當前音韻地位.清濁, '全濁');
  t.is(當前音韻地位.音, '牙');
  t.is(當前音韻地位.攝, '止');

  // 其他
  t.is(當前音韻地位.描述, '羣開三A支平');
  t.is(當前音韻地位.最簡描述, '羣開A支平');
  t.is(當前音韻地位.表達式, '羣母 開口 三等 重紐A類 支韻 平聲');
  t.is(當前音韻地位.編碼, 'fFA');

  t.true(當前音韻地位.等於(音韻地位.from描述('羣開A支平')));
});

test('音韻地位.調整', t => {
  const 地位 = 音韻地位.from描述('幫三元上');
  t.is(地位.調整({ 聲: '平' }).描述, '幫三元平');
  t.throws(() => 地位.調整({ 母: '見' }), { message: /呼.*null/ }, '.調整() 會驗證新地位');
  t.is(地位.調整({ 母: '見', 呼: '合' }).描述, '見合三元上');
  t.is(地位.描述, '幫三元上', '.調整() 不修改原對象');
});

// 屬於

test('測試「法」字對應的音韻地位的屬於函式（基本用法）', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');
  t.true(當前音韻地位.屬於('幫母'));
  t.true(當前音韻地位.屬於('幫精組'));
  t.false(當前音韻地位.屬於('精組'));
  t.false(當前音韻地位.屬於('重紐A類 或 重紐B類'));
  t.false(當前音韻地位.屬於('喉音'));
  t.true(當前音韻地位.屬於('仄聲'));
  t.false(當前音韻地位.屬於('舒聲'));
  t.true(當前音韻地位.屬於('清音'));
  t.false(當前音韻地位.屬於('全濁'));
  t.false(當前音韻地位.屬於('次濁'));
  t.true(當前音韻地位.屬於('開合中立'));
  t.false(當前音韻地位.屬於('開口 或 合口'));
  t.true(當前音韻地位.屬於('幫組 輕脣韻'));
  t.false(當前音韻地位.屬於('陰聲韻'));
});

test('測試「法」字對應的音韻地位的屬於（複雜用法）及判斷函式', t => {
  const 當前音韻地位 = 音韻地位.from描述('幫三凡入');
  t.true(當前音韻地位.屬於('非 一等'));
  t.true(當前音韻地位.屬於('非 (一等)'));
  t.true(當前音韻地位.屬於('非 ((一等))'));
  t.true(當前音韻地位.屬於('非 (非 三等)'));
  t.true(當前音韻地位.屬於('非 非 非 一等'));
  t.true(當前音韻地位.屬於('三等 或 一等 且 來母')); // 「且」優先於「或」
  t.false(當前音韻地位.屬於('(三等 或 一等) 且 來母'));
  t.true(當前音韻地位.屬於`一四等 或 ${當前音韻地位.描述 === '幫三凡入'}`);
  t.true(當前音韻地位.屬於`${() => '三等'} 或 ${() => '短路〔或〕'}`);
  t.false(當前音韻地位.屬於`非 ${() => '三等'} 且 ${() => '短路〔且〕'}`);
  t.throws(() => 當前音韻地位.屬於`${() => '三等'} 或 ${'立即求值'}`, { message: 'unreconized test condition: 立即求值' });
  t.is(
    當前音韻地位.判斷(
      [
        ['遇果假攝 或 支脂之佳韻', ''],
        ['蟹攝 或 微韻', 'i'],
        ['效流攝', 'u'],
        [
          '深咸攝',
          [
            ['舒聲', 'm'],
            ['入聲', 'p'],
          ],
        ],
        [
          '臻山攝',
          [
            ['舒聲', 'n'],
            ['入聲', 't'],
          ],
        ],
        [
          '通江宕梗曾攝',
          [
            ['舒聲', 'ng'],
            ['入聲', 'k'],
          ],
        ],
      ],
      '無韻尾規則'
    ),
    'p'
  );
});

test('測試不合法表達式', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');
  const is = 地位.屬於.bind(地位);
  t.throws(() => is``, { message: 'empty expression' });
  t.throws(() => is`三等 且 ()`, { message: 'expect expression, got: )' });
  t.throws(() => is`一等 或`, { message: 'expect expression, got: end of expression' });
  t.throws(() => is`或 一等`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 (或 一等)`, { message: 'expect expression, got: 或' });
  t.throws(() => is`三等 且 非`, { message: "expect operand or '(', got: end of expression" });
  t.throws(() => is`桓韻`, { message: '桓韻不存在' });
  t.throws(() => is`${'桓韻'}`, { message: '桓韻不存在' });
  t.throws(() => is`三等 或 桓韻`, { message: '桓韻不存在' });
});

test('測試判斷式拋異常', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');
  t.throws(
    () =>
      地位.判斷([
        ['遇果假攝 或 支脂之佳韻', ''],
        // ...
        [
          '深咸攝',
          [
            ['舒聲', 'm'],
            ['促聲', 'p'],
          ],
        ],
        // ...
        ['短路！', ''],
      ]),
    { message: '促聲不存在' }
  );
  t.throws(() => 地位.判斷([], '壞耶'), { message: '壞耶' });
});

test('判斷式 null 與 fallback', t => {
  const 地位 = 音韻地位.from描述('幫三凡入');

  t.is(地位.判斷([]), null);
  t.is(地位.判斷([['見母', 42]]), null);

  const 規則: Parameters<音韻地位['判斷']>[0] = [
    ['幫組', []],
    ['幫母 凡韻', 43],
  ];
  t.is(地位.判斷(規則), null);
  t.throws(() => 地位.判斷(規則, '壞耶'), { message: '壞耶' });
});

// 遍歷所有音韻地位

test('使用「iter音韻地位」函式遍歷所有音韻地位', t => {
  for (const 當前音韻地位 of iter音韻地位()) {
    t.true(音韻地位.from編碼(當前音韻地位.編碼).等於(當前音韻地位), 當前音韻地位.描述);
    t.true(當前音韻地位.屬於(當前音韻地位.表達式));
  }
});

test('根據原資料檔遍歷所有音韻地位2', t => {
  for (const line of readFileSync('prepare/data.csv', { encoding: 'utf8' }).split('\n').slice(1, -1)) {
    const [, 韻部原貌1, 最簡描述1, 反切覈校前1, 原反切1, 字頭覈校前1, 原字頭1, 原釋義1, 釋義補充1] = line.split(',');
    if (!最簡描述1) {
      continue;
    }
    const 反切1 = 原反切1 || 反切覈校前1 || null;
    const 字頭1 = 原字頭1 || 字頭覈校前1;
    const 釋義1 = 原釋義1 + (釋義補充1 && `（${釋義補充1}）`);

    const 音韻地位1 = 音韻地位.from描述(最簡描述1);
    t.true(
      query字頭(字頭1).some(({ 音韻地位: 音韻地位2, 韻部原貌: 韻部原貌2, 反切: 反切2, 解釋: 解釋2 }) => {
        return 音韻地位1.等於(音韻地位2) && 韻部原貌1 == 韻部原貌2 && 反切1 === 反切2 && 釋義1 === 解釋2;
      }),
      line
    );
  }
});

// 音韻編碼

test('其他分析體系音韻地位', t => {
  let 地位 = 音韻地位.from描述('章開A支平');
  t.is(地位.描述, '章開三A支平');
  let { 編碼 } = 地位;
  t.is(編碼, 'XFQ');
  t.is(音韻地位.from編碼(編碼).描述, '章開三A支平');

  地位 = 音韻地位.from描述('並開咍上');
  t.is(地位.描述, '並開一咍上');
  ({ 編碼 } = 地位);
  t.is(編碼, 'CTh');
  t.is(音韻地位.from編碼(編碼).描述, '並開一咍上');

  for (const [描述, 編碼] of [
    ['幫三清入', 'AuT'],
    ['幫三A清入', 'AuD'],
    ['幫三B清入', 'AuH'],
  ]) {
    const 地位 = 音韻地位.from描述(描述);
    t.is(地位.描述, 描述);
    t.is(地位.編碼, 編碼, 地位.描述);
    t.is(音韻地位.from編碼(編碼).描述, 地位.描述);
  }
});

test('最簡描述', t => {
  const from = 音韻地位.from描述;
  t.is(from('見開嚴平').最簡描述, '見嚴平');
  t.is(from('見合凡平').最簡描述, '見凡平');
  t.is(from('見合嚴平').最簡描述, '見合嚴平');
  t.is(from('見開凡平').最簡描述, '見開凡平');
  t.is(from('見開模平').最簡描述, '見開模平');
});

test('不合法音韻地位', t => {
  t.throws(() => new 音韻地位('匣', '開', '三', null, '眞', '平'), { message: /重紐.*null/ });
});
