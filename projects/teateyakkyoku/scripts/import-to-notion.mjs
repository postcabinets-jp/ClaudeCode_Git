// てあて薬局 漢方商品一覧 → Notion インポートスクリプト
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const NOTION_TOKEN = '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';
const DATABASE_ID = '33b9bf08-eefd-81d2-9bcf-fdde78e0f2f5';

const data = JSON.parse(
  readFileSync(join(__dirname, '../data/kampo-products.json'), 'utf-8')
);

const categoryMap = {
  kampo: '漢方薬',
  supplement: 'サプリメント',
  tea: '薬膳茶',
};

const fatigueTypeMap = {
  brain: '脳疲労タイプ',
  blood: '血流不足タイプ',
  autonomic: '自律神経乱れタイプ',
  visceral: '内臓疲労タイプ',
  energy: 'エネルギー不足タイプ',
};

// 漢方由来情報（東洋医学の典拠・処方由来）
const originMap = {
  'kampo-001': '出典：宋代の医書「普済本事方」。釣藤鈎（チョウトウコウ）を主薬とし、肝風を鎮め、頭部への血流を調整する処方。日本では特に高血圧に伴う頭重・めまいに広く用いられる。',
  'kampo-002': '出典：明代の医書「薬証弁読」発展系。逍遥散（宋代「太平恵民和剤局方」収載）に山梔子・牡丹皮を加味した処方。女性の気血調整の代表薬として東アジア全域で使用。',
  'kampo-003': '出典：漢代・張仲景「金匱要略」収載の古典処方。当帰・芍薬を主薬に水湿を排し血を補う。女性の三大漢方の一つとして日本で広く普及。',
  'kampo-004': '出典：漢代・張仲景「金匱要略」収載。桂枝・茯苓・牡丹皮・桃仁・芍薬の5味。瘀血（血の滞り）改善の代表処方で、日本では保険適用漢方として最も処方数が多い薬の一つ。',
  'kampo-005': '出典：漢代・張仲景「傷寒論」収載の柴胡加竜骨牡蛎湯。竜骨（古代動物の化石）と牡蛎（カキの貝殻）を配合し、神経の高ぶりを鎮める。精神症状を伴う疾患に広く応用。',
  'kampo-006': '出典：漢代・張仲景「金匱要略」収載。酸棗仁（ナツメの種）を主薬とし、血を養い心を落ち着かせる。中国・日本・韓国で2000年以上にわたり不眠治療に用いられてきた。',
  'kampo-007': '出典：金代・李東垣「脾胃論」収載の四君子湯を基本に、陳皮・半夏を加えた処方。脾胃（消化機能）を補う代表薬として現代医療でも広く使用。日本の保険漢方に収載。',
  'kampo-008': '出典：漢代・張仲景「金匱要略」収載。山椒・乾姜・人参・膠飴の4味のみのシンプルな処方。腸管の冷えに対する温法の代表として現代外科術後管理にも応用される。',
  'kampo-009': '出典：金代・李東垣「脾胃論」収載。黄耆・人参を中心に気を補い、下垂した気を持ち上げる（升提）。慢性疲労・免疫機能改善に関する現代研究も多数。',
  'kampo-010': '出典：漢代・張仲景「金匱要略」収載の八味腎気丸。六味地黄丸に桂枝・附子を加え腎陽を補う。中国・日本で「腎虚」治療の代表薬として1800年以上の使用歴。',
  'kampo-011': '出典：金代・劉河間「宣明論方」収載。18種の生薬で汗・尿・便の三方向から排泄を促す。現代では肥満症の漢方治療薬として日本・台湾で広く用いられる。',
  'kampo-012': '出典：漢代・張仲景「金匱要略」収載。麦門冬（ジャノヒゲの塊根）を主薬とし肺を潤す。乾燥した咳・喉の不調に特化し、現代の気管支炎・嗄声にも応用される。',
  'supp-001': '原産地：朝鮮半島・中国北部の高山地帯で栽培される多年草Panax ginseng。5000年以上の使用歴を持ち、中国最古の薬物書「神農本草経」上品（最高位）に記載。アダプトゲン研究はソ連時代から現代まで継続中。',
  'supp-002': '鉄分補給の概念は近代医学由来だが、補血（血を補う）思想は中国伝統医学の根幹。ヘム鉄は動物性食品由来で吸収率が非ヘム鉄の2〜3倍。葉酸は1941年に単離・命名された水溶性ビタミン。',
  'supp-003': 'マグネシウムは1755年に元素として発見。神経伝達・筋収縮・エネルギー産生（ATP）に必須の必須ミネラル。ビタミンB群はチアミン（B1）の1910年発見を皮切りに20世紀初頭に順次発見。',
  'tea-001': '菊花（キク科）・決明子（マメ科エビスグサの種）・枸杞子（ナス科クコの実）の組み合わせ。いずれも「神農本草経」または「本草綱目」（明代・李時珍著）に収載された伝統薬材。目の養生に特化した清熱・補益の組み合わせ。',
  'tea-002': '生姜（ショウガ科）・シナモン（クスノキ科）・なつめ（クロウメモドキ科）のブレンド。生姜は世界最古の香辛料の一つで「神農本草経」中品収載。シナモンはエジプト時代から交易品として珍重。なつめは「本草綱目」で「百果の王」と称された。',
  'tea-003': '酸棗仁（ナツメの種）・蓮子（ハスの実）・ラベンダー（シソ科）の組み合わせ。酸棗仁は「神農本草経」上品収載の安神（精神安定）薬材の代表。蓮子は仏教文化とともに東アジアに普及した安心・固精の薬材。',
  'tea-004': '陳皮（ミカン科・陳久した柑橘の皮）・山楂子（バラ科サンザシの実）・薏苡仁（イネ科ハトムギの種）のブレンド。陳皮は「本草綱目」で理気（気の流れを整える）の要薬。薏苡仁は漢代以前から食薬両用として使われた穀物。',
  'tea-005': '黄耆（マメ科キバナオウギの根）・党参（キキョウ科ツルニンジンの根）・なつめのブレンド。黄耆は「神農本草経」上品収載の補気昇陽薬の代表。党参は人参の代用品として清代以降に普及。気血を同時に補う「気血双補」の組み合わせ。',
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function createPage(product) {
  const fatigueTypes = product.target_fatigue_types.map((t) => ({
    name: fatigueTypeMap[t] || t,
  }));

  const body = {
    parent: { database_id: DATABASE_ID },
    properties: {
      商品名: {
        title: [{ text: { content: product.name } }],
      },
      カテゴリ: {
        select: { name: categoryMap[product.category] || product.category },
      },
      対象疲労タイプ: {
        multi_select: fatigueTypes,
      },
      対象症状: {
        rich_text: [{ text: { content: product.target_symptoms.join('、') } }],
      },
      向いている人: {
        rich_text: [{ text: { content: product.suitable_for } }],
      },
      注意事項: {
        rich_text: [{ text: { content: product.caution } }],
      },
      '通常価格（円）': { number: product.price },
      'お試し価格（円）': { number: product.trial_price },
      '使用期間（日）': { number: product.usage_duration_days },
      ステータス: {
        select: { name: product.is_active ? '公開中' : '非公開' },
      },
      由来・詳細: {
        rich_text: [
          {
            text: {
              content: originMap[product.id] || '要確認（炭谷さんへ確認）',
            },
          },
        ],
      },
    },
    // ページ本文：効能・詳細説明
    children: [
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '概要' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: product.description } }],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '効能メカニズム（東洋医学的観点）' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: product.mechanism } }],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: 'こんな人に向いています' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [{ text: { content: product.suitable_for } }],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '由来・歴史的背景' } }],
        },
      },
      {
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              text: {
                content: originMap[product.id] || '※炭谷さんへ確認予定。詳細情報を追記してください。',
              },
            },
          ],
        },
      },
      {
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ text: { content: '注意事項' } }],
        },
      },
      {
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ text: { content: product.caution } }],
          icon: { type: 'emoji', emoji: '⚠️' },
          color: 'yellow_background',
        },
      },
    ],
  };

  const res = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_TOKEN}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed for ${product.name}: ${err}`);
  }

  const json = await res.json();
  return json.id;
}

async function main() {
  const products = data.products;
  console.log(`投入開始: ${products.length}件`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    try {
      const id = await createPage(product);
      console.log(`✓ [${i + 1}/${products.length}] ${product.name} → ${id}`);
    } catch (err) {
      console.error(`✗ [${i + 1}/${products.length}] ${product.name}: ${err.message}`);
    }
    // API制限対策：300ms待機
    if (i < products.length - 1) await sleep(300);
  }

  console.log('\n完了！');
  console.log(`DB URL: https://www.notion.so/${DATABASE_ID.replace(/-/g, '')}`);
}

main().catch(console.error);
