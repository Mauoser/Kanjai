// utils/romajiConverter.js
// Standalone utility file for romaji to hiragana conversion

const romajiMap = {
  // Vowels
  a: "あ",
  i: "い",
  u: "う",
  e: "え",
  o: "お",
  // K-line
  ka: "か",
  ki: "き",
  ku: "く",
  ke: "け",
  ko: "こ",
  kya: "きゃ",
  kyu: "きゅ",
  kyo: "きょ",
  // G-line
  ga: "が",
  gi: "ぎ",
  gu: "ぐ",
  ge: "げ",
  go: "ご",
  gya: "ぎゃ",
  gyu: "ぎゅ",
  gyo: "ぎょ",
  // S-line
  sa: "さ",
  shi: "し",
  si: "し",
  su: "す",
  se: "せ",
  so: "そ",
  sha: "しゃ",
  shu: "しゅ",
  sho: "しょ",
  sya: "しゃ",
  syu: "しゅ",
  syo: "しょ", // Alternative spellings
  // Z-line
  za: "ざ",
  ji: "じ",
  zi: "じ",
  zu: "ず",
  ze: "ぜ",
  zo: "ぞ",
  ja: "じゃ",
  ju: "じゅ",
  jo: "じょ",
  jya: "じゃ",
  jyu: "じゅ",
  jyo: "じょ", // Alternative spellings
  // T-line
  ta: "た",
  chi: "ち",
  ti: "ち",
  tsu: "つ",
  tu: "つ",
  te: "て",
  to: "と",
  cha: "ちゃ",
  chu: "ちゅ",
  cho: "ちょ",
  tya: "ちゃ",
  tyu: "ちゅ",
  tyo: "ちょ", // Alternative spellings
  cya: "ちゃ",
  cyu: "ちゅ",
  cyo: "ちょ", // Alternative spellings
  // D-line
  da: "だ",
  di: "ぢ",
  du: "づ",
  de: "で",
  do: "ど",
  // N-line
  na: "な",
  ni: "に",
  nu: "ぬ",
  ne: "ね",
  no: "の",
  nya: "にゃ",
  nyu: "にゅ",
  nyo: "にょ",
  // H-line
  ha: "は",
  hi: "ひ",
  fu: "ふ",
  hu: "ふ",
  he: "へ",
  ho: "ほ",
  hya: "ひゃ",
  hyu: "ひゅ",
  hyo: "ひょ",
  // B-line
  ba: "ば",
  bi: "び",
  bu: "ぶ",
  be: "べ",
  bo: "ぼ",
  bya: "びゃ",
  byu: "びゅ",
  byo: "びょ",
  // P-line
  pa: "ぱ",
  pi: "ぴ",
  pu: "ぷ",
  pe: "ぺ",
  po: "ぽ",
  pya: "ぴゃ",
  pyu: "ぴゅ",
  pyo: "ぴょ",
  // M-line
  ma: "ま",
  mi: "み",
  mu: "む",
  me: "め",
  mo: "も",
  mya: "みゃ",
  myu: "みゅ",
  myo: "みょ",
  // Y-line
  ya: "や",
  yu: "ゆ",
  yo: "よ",
  // R-line
  ra: "ら",
  ri: "り",
  ru: "る",
  re: "れ",
  ro: "ろ",
  rya: "りゃ",
  ryu: "りゅ",
  ryo: "りょ",
  // W-line
  wa: "わ",
  wi: "ゐ",
  we: "ゑ",
  wo: "を",
  // Double consonants (small tsu)
  kka: "っか",
  kki: "っき",
  kku: "っく",
  kke: "っけ",
  kko: "っこ",
  ssa: "っさ",
  sshi: "っし",
  ssu: "っす",
  sse: "っせ",
  sso: "っそ",
  tta: "った",
  cchi: "っち",
  ttsu: "っつ",
  tte: "って",
  tto: "っと",
  ppa: "っぱ",
  ppi: "っぴ",
  ppu: "っぷ",
  ppe: "っぺ",
  ppo: "っぽ",
  // Special
  nn: "ん",
};

export const convertRomajiToHiragana = (text) => {
  if (!text) return text;

  // Replace special sequences first
  let processedText = text.toLowerCase();
  processedText = processedText.replace(/nn/g, "|NN|");
  processedText = processedText.replace(/n['-]/g, "|N|");

  let result = "";
  let i = 0;

  while (i < processedText.length) {
    // Check for placeholders
    if (processedText.substring(i).startsWith("|NN|")) {
      result += "ん";
      i += 4;
      continue;
    }
    if (processedText.substring(i).startsWith("|N|")) {
      result += "ん";
      i += 3;
      continue;
    }

    let found = false;

    // Try 3-character combinations
    if (i + 3 <= processedText.length) {
      const threeChar = processedText.substring(i, i + 3);
      if (romajiMap[threeChar]) {
        result += romajiMap[threeChar];
        i += 3;
        found = true;
      }
    }

    // Try 2-character combinations
    if (!found && i + 2 <= processedText.length) {
      const twoChar = processedText.substring(i, i + 2);
      if (romajiMap[twoChar]) {
        result += romajiMap[twoChar];
        i += 2;
        found = true;
      }
    }

    // Try 1-character
    if (!found) {
      const oneChar = processedText.substring(i, i + 1);

      // Special handling for standalone 'n'
      if (oneChar === "n") {
        // Check what follows
        if (i === processedText.length - 1) {
          // At the end of input, keep as 'n' for now
          result += "n";
          i++;
        } else {
          const nextChar = processedText[i + 1];
          // If next char would form a valid combination, leave it
          if ("aiueoyw".includes(nextChar)) {
            // Will be handled by 2-char combinations in next iteration
            // Skip this 'n' for now
            found = false;
          } else {
            // Convert to ん before consonants
            result += "ん";
            i++;
            found = true;
          }
        }
      } else if (romajiMap[oneChar]) {
        result += romajiMap[oneChar];
        i++;
        found = true;
      } else {
        // Keep original character
        result += processedText[i];
        i++;
        found = true;
      }
    }

    if (!found) {
      // This handles the skipped 'n' case
      // Just move forward without adding anything
      i++;
    }
  }

  return result;
};

export { romajiMap };
