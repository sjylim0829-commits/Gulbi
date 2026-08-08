import type { Category, ParsedCardTransaction } from '../types/financial';

// Default Keyword to Category Mapper
const KEYWORD_CATEGORY_MAP: Record<string, string> = {
  // Food & Dining
  '배달의민족': 'exp_food',
  '배민': 'exp_food',
  '쿠팡이츠': 'exp_food',
  '요기요': 'exp_food',
  '식당': 'exp_food',
  '아웃백': 'exp_food',
  '한식': 'exp_food',
  '일식': 'exp_food',
  '중화요리': 'exp_food',
  '치킨': 'exp_food',
  '피자': 'exp_food',
  '버거킹': 'exp_food',
  '맥도날드': 'exp_food',
  '롯데리아': 'exp_food',

  // Cafe & Dessert
  '스타벅스': 'exp_cafe',
  '투썸플레이스': 'exp_cafe',
  '메가커피': 'exp_cafe',
  '빽다방': 'exp_cafe',
  '컴포즈': 'exp_cafe',
  '이디야': 'exp_cafe',
  '파리바게뜨': 'exp_cafe',
  '뚜레쥬르': 'exp_cafe',
  '카페': 'exp_cafe',

  // Shopping & Mart
  '쿠팡': 'exp_shopping',
  '11번가': 'exp_shopping',
  '네이버페이': 'exp_shopping',
  'G마켓': 'exp_shopping',
  '옥션': 'exp_shopping',
  '올리브영': 'exp_shopping',
  '무신사': 'exp_shopping',
  '다이소': 'exp_shopping',
  '이마트': 'exp_mart',
  '홈플러스': 'exp_mart',
  '롯데마트': 'exp_mart',
  'GS25': 'exp_mart',
  'CU': 'exp_mart',
  '세븐일레븐': 'exp_mart',
  '이마트24': 'exp_mart',

  // Transport & Fuel
  '주유소': 'exp_transport',
  'GS칼텍스': 'exp_transport',
  'SK에너지': 'exp_transport',
  'S-OIL': 'exp_transport',
  'HD현대오일뱅크': 'exp_transport',
  '카카오T': 'exp_transport',
  '택시': 'exp_transport',
  '코레일': 'exp_transport',
  '지하철': 'exp_transport',
  '버스': 'exp_transport',
  'SOCAR': 'exp_transport',

  // Medical & Health
  '병원': 'exp_medical',
  '의원': 'exp_medical',
  '약국': 'exp_medical',
  '치과': 'exp_medical',
  '안과': 'exp_medical',
  '피부과': 'exp_medical',

  // Culture & Leisure
  'CGV': 'exp_culture',
  '메가박스': 'exp_culture',
  '롯데시네마': 'exp_culture',
  '넷플릭스': 'exp_culture',
  '유튜브': 'exp_culture',
  '멜론': 'exp_culture',
  '헬스장': 'exp_culture',
  '필라테스': 'exp_culture',

  // Utilities & Communication
  'SKT': 'exp_utility',
  'KT': 'exp_utility',
  'LGU+': 'exp_utility',
  '알뜰폰': 'exp_utility',
  '전기요금': 'exp_utility',
  '도시가스': 'exp_utility',
  '아파트관리비': 'exp_utility',
};

// Known Card Names Detector
const CARD_PROVIDERS = [
  '신한카드', '현대카드', 'KB국민카드', '국민카드', '삼성카드', '롯데카드',
  '우리카드', '하나카드', 'NH농협카드', '농협카드', '카카오뱅크', '토스카드', 'toss'
];

export function parseSMSOrNotificationText(
  text: string,
  categories: Category[]
): ParsedCardTransaction[] {
  if (!text || !text.trim()) return [];

  // Split text by lines or double linebreaks or SMS separators
  const blocks = text
    .split(/\n{2,}|(?=\[\Web발신\])|(?=\[신한카드\])|(?=\[현대카드\])|(?=\[KB국민\])|(?=\[삼성카드\])|(?=\[롯데카드\])|(?=\[우리카드\])|(?=\[하나카드\])|(?=\[카카오뱅크\])|(?=\[Toss\])/g)
    .map(b => b.trim())
    .filter(b => b.length > 0);

  const results: ParsedCardTransaction[] = [];
  const currentYear = new Date().getFullYear();

  blocks.forEach((block, idx) => {
    // 1. Detect Card Company / Payment Method
    let paymentMethod = '신용/체크카드';
    for (const card of CARD_PROVIDERS) {
      if (block.includes(card)) {
        paymentMethod = card;
        break;
      }
    }
    if (paymentMethod === '국민카드') paymentMethod = 'KB국민카드';
    if (paymentMethod === '농협카드') paymentMethod = 'NH농협카드';

    // 2. Extract Amount (e.g. 15,000원 or 15000원 or 15,000)
    let amount = 0;
    const amountMatch = block.match(/([\d,]+)\s*원/) || block.match(/승인\s*([\d,]+)/) || block.match(/([\d,]{4,})\b/);
    if (amountMatch) {
      const cleanNum = amountMatch[1].replace(/,/g, '');
      amount = parseInt(cleanNum, 10);
    }

    if (isNaN(amount) || amount <= 0) {
      return; // Skip non-financial text blocks
    }

    // 3. Extract Date & Time (e.g. 08/08 14:30 or 08-08 14:30 or 2026.08.08 14:30)
    let dateStr = new Date().toISOString().split('T')[0];
    let timeStr = '12:00';

    const fullDateMatch = block.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    const shortDateMatch = block.match(/(\d{1,2})[./-](\d{1,2})/);
    const timeMatch = block.match(/(\d{1,2}):(\d{2})/);

    if (fullDateMatch) {
      const [, year, month, day] = fullDateMatch;
      dateStr = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } else if (shortDateMatch) {
      const [, month, day] = shortDateMatch;
      dateStr = `${currentYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    if (timeMatch) {
      const [, hour, min] = timeMatch;
      timeStr = `${hour.padStart(2, '0')}:${min.padStart(2, '0')}`;
    }

    // 4. Extract Merchant Name
    let merchant = '가맹점 미지정';
    // Remove known keywords from line to isolate merchant
    let cleaned = block
      .replace(/\[Web발신\]/g, '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/승인/g, '')
      .replace(/일시불/g, '')
      .replace(/[\d,]+\s*원/g, '')
      .replace(/(\d{1,2})[./-](\d{1,2})/g, '')
      .replace(/(\d{1,2}):(\d{2})/g, '')
      .replace(/홍\*길|김\*수|박\*민|이\*정|신\*훈/g, '')
      .trim();

    // Take last non-empty word or matching merchant pattern
    const words = cleaned.split(/\s+/).filter(w => w.length > 0 && !w.includes('카드'));
    if (words.length > 0) {
      merchant = words[words.length - 1];
    }

    // 5. Suggest Category
    let suggestedCategory = categories.find(c => c.id === 'exp_etc') || categories[0];
    let confidence: 'high' | 'medium' | 'low' = 'low';

    for (const [kw, catId] of Object.entries(KEYWORD_CATEGORY_MAP)) {
      if (block.includes(kw) || merchant.includes(kw)) {
        const found = categories.find(c => c.id === catId);
        if (found) {
          suggestedCategory = found;
          confidence = 'high';
          break;
        }
      }
    }

    if (confidence === 'low' && merchant !== '가맹점 미지정') {
      confidence = 'medium';
    }

    results.push({
      id: `parsed-${Date.now()}-${idx}`,
      date: dateStr,
      time: timeStr,
      merchant: merchant,
      amount: amount,
      paymentMethod: paymentMethod,
      suggestedCategoryId: suggestedCategory.id,
      suggestedCategoryName: suggestedCategory.name,
      confidence: confidence,
      rawText: block,
      selected: true,
    });
  });

  return results;
}

export function parseCSVStatement(
  csvText: string,
  categories: Category[]
): ParsedCardTransaction[] {
  const lines = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 1) return [];

  const results: ParsedCardTransaction[] = [];
  const currentYear = new Date().getFullYear();

  // Inspect headers if present
  const startIndex = lines[0].includes('일자') || lines[0].includes('날짜') || lines[0].includes('금액') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.replace(/^["']|["']$/g, '').trim());
    if (cols.length < 3) continue;

    // Try finding date, merchant, amount in columns
    let dateStr = `${currentYear}-08-08`;
    let merchant = '가맹점';
    let amount = 0;
    let paymentMethod = '카드명세서';

    cols.forEach(col => {
      if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}$/.test(col)) {
        dateStr = col.replace(/\./g, '-');
      } else if (/^\d{1,2}[-/.]\d{1,2}$/.test(col)) {
        dateStr = `${currentYear}-${col.replace(/\./g, '-').padStart(5, '0')}`;
      } else if (/^\d[\d,]+$/.test(col) || (parseInt(col.replace(/,/g, ''), 10) > 0)) {
        const parsedAmt = parseInt(col.replace(/,/g, ''), 10);
        if (!isNaN(parsedAmt) && parsedAmt > 100) {
          amount = parsedAmt;
        }
      } else if (col.length > 1 && !col.includes('승인') && !col.includes('일시불')) {
        merchant = col;
      }
    });

    if (amount > 0) {
      // Suggest category
      let suggestedCategory = categories.find(c => c.id === 'exp_etc') || categories[0];
      for (const [kw, catId] of Object.entries(KEYWORD_CATEGORY_MAP)) {
        if (merchant.includes(kw)) {
          const found = categories.find(c => c.id === catId);
          if (found) {
            suggestedCategory = found;
            break;
          }
        }
      }

      results.push({
        id: `csv-${Date.now()}-${i}`,
        date: dateStr,
        time: '12:00',
        merchant,
        amount,
        paymentMethod,
        suggestedCategoryId: suggestedCategory.id,
        suggestedCategoryName: suggestedCategory.name,
        confidence: 'medium',
        rawText: lines[i],
        selected: true,
      });
    }
  }

  return results;
}
