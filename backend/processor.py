"""VocabForge — core processing engine (ported from convert.py)."""

import re

from vocab import get_ipa, get_meaning, get_pos, get_reflection, get_root

# ── Regex patterns ────────────────────────────────────────────────

TIMESTAMP_RE = re.compile(r'\[(\d+:\d+)\]')
WATERMARK_RE = re.compile(r'微信公众号.*|WeChat.*|AmazingScript.*|微信号.*')
HEADER_RE = re.compile(r'^[-—]\s*S01E')
DECORATE_RE = re.compile(r'^\*{3,}.*\*{3,}$')
PAGE_RE = re.compile(r'\s*第\s*\d+\s*页\s*/\s*共\s*\d+\s*页')
VOCAB_RE = re.compile(r'[:;]\s*(?:vi|vt|n|adj|adv|pron|prep|conj|int|abbr|art|v|det|num)\b')


# ── Inflection helpers ────────────────────────────────────────────

def get_inflections(word):
    """Generate common inflected forms of a word."""
    forms = {word, word.lower(), word.capitalize(), word.upper()}
    w = word.lower()
    base = {w}
    # s / es
    if w.endswith(('s', 'x', 'ch', 'sh', 'o')):
        base.add(w + 'es')
    elif w.endswith('y') and len(w) > 2 and w[-2] not in 'aeiou':
        base.add(w[:-1] + 'ies')
    else:
        base.add(w + 's')
    # ed
    if w.endswith('e'):
        base.add(w + 'd')
    elif w.endswith('y') and len(w) > 2 and w[-2] not in 'aeiou':
        base.add(w[:-1] + 'ied')
    else:
        base.add(w + 'ed')
    # ing
    if w.endswith('e') and not w.endswith('ee') and len(w) > 2:
        base.add(w[:-1] + 'ing')
    else:
        base.add(w + 'ing')
    # double consonant (CVC pattern)
    if re.match(r'^[^aeiou][aeiou][^aeiou]$', w):
        base.add(w + w[-1] + 'ed')
        base.add(w + w[-1] + 'ing')
    # special irregulars
    irregular = {
        'lead': {'led', 'leads', 'leading'},
        'lie': {'lay', 'lain', 'lied', 'lies', 'lying'},
        'let': {'lets', 'letting'},
    }
    if w in irregular:
        base |= irregular[w]
    forms.update(base)
    return forms


INFLECTION_CACHE = {}


def get_all_forms(word):
    if word not in INFLECTION_CACHE:
        INFLECTION_CACHE[word] = get_inflections(word)
    return INFLECTION_CACHE[word]


# ── Text processing ───────────────────────────────────────────────

def is_noise(s):
    """Check if a line should be filtered out."""
    if not s:
        return True
    if HEADER_RE.match(s):
        return True
    if DECORATE_RE.match(s):
        return True
    if WATERMARK_RE.search(s):
        return True
    if VOCAB_RE.search(s):
        return True
    if re.match(r'^[一-鿿]+-S01E\d{2}$', s):
        return True
    if ';;' in s or ',,' in s:
        return True
    if s.count(':') > 1 and re.search(r'[一-鿿]', s):
        return True
    if s.count(';') > 3:
        return True
    letter_count = sum(1 for c in s if c.isalpha())
    if letter_count < 3 and len(s) > 5:
        return True
    return False


def has_chinese(s):
    return bool(re.search(r'[一-鿿]', s))


def has_english(s):
    return bool(re.search(r'[a-zA-Z]{2,}', s))


def extract_pairs(raw_text):
    """Split raw bilingual text into (en, cn) pairs.
    Accepts plain text (no PDF dependency)."""
    lines = [l.strip() for l in raw_text.split('\n') if l.strip()]
    filtered = [l for l in lines if not is_noise(l)]

    pairs = []
    buf = []

    def flush():
        if buf:
            en = re.sub(r'\s+', ' ', ' '.join(buf)).strip()
            pairs.append((en, ''))
            buf.clear()

    for line in filtered:
        ts_match = TIMESTAMP_RE.search(line)
        ts = ts_match.group(1) if ts_match else ''
        line_clean = TIMESTAMP_RE.sub('', line).strip()

        cn = has_chinese(line_clean)
        en = has_english(line_clean)

        if cn and en:
            en_chars, cn_chars = [], []
            in_cn = False
            for ch in line_clean:
                cp = ord(ch)
                if cp >= 0x2000 and not in_cn:
                    in_cn = True
                    cn_chars.append(ch)
                elif cp < 0x200 and cp != 0 and in_cn:
                    in_cn = False
                    en_chars.append(ch)
                elif cp >= 0x2000:
                    cn_chars.append(ch)
                else:
                    en_chars.append(ch)

            en_text = re.sub(r'\s+', ' ', ''.join(en_chars)).strip()
            cn_text = re.sub(r'\s+', ' ', ''.join(cn_chars)).strip()

            flush()
            ts_suffix = f' {ts}' if ts else ''
            pairs.append((en_text, cn_text + ts_suffix))

        elif cn and not en:
            flush()
            cn_text = re.sub(r'\s+', ' ', line_clean).strip()
            ts_suffix = f' {ts}' if ts else ''
            if pairs and pairs[-1][1]:
                pairs[-1] = (pairs[-1][0], pairs[-1][1] + cn_text + ts_suffix)
            elif pairs and not pairs[-1][1]:
                pairs[-1] = (pairs[-1][0], cn_text + ts_suffix)
            else:
                pairs.append(('', cn_text + ts_suffix))

        elif en and not cn:
            en_text = re.sub(r'\s+', ' ', line_clean).strip()
            if buf and en_text and en_text[0].islower():
                buf.append(en_text)
            elif buf:
                flush()
                buf.append(en_text)
            else:
                buf.append(en_text)

    flush()
    return pairs


def clean_pairs(pairs):
    """Merge broken lines and remove noise from extracted pairs."""
    cleaned = []
    for en, cn in pairs:
        en = PAGE_RE.sub('', en).strip()
        cn = PAGE_RE.sub('', cn).strip()
        if re.match(r'^[\s;:.,()\[\]{}\'\"-]+$', en):
            continue
        if en and not re.search(r'[a-zA-Z]{3,}', en) and len(en) < 5:
            continue
        cn = re.sub(r'\s+', ' ', cn).strip()
        if en or cn:
            cleaned.append((en, cn))

    merged = []
    for en, cn in cleaned:
        if merged:
            le, lc = merged[-1]
            if le and lc and en and cn and not le.rstrip().endswith(('.', '!', '?')):
                merged[-1] = (le + ' ' + en, lc + cn)
                continue
            if le and not lc and cn and not en:
                merged[-1] = (le, cn)
                continue
            if le and lc and en and not cn and not le.rstrip()[-1] in '.!?':
                merged[-1] = (le + ' ' + en, lc)
                continue
        merged.append((en, cn))
    return merged


def bold_vocab_in_text(text, vocab):
    """Highlight vocab words with ==**word**== format."""
    result = text
    for w in sorted(vocab, key=len, reverse=True):
        for form in get_all_forms(w):
            pattern = re.compile(
                r'(?<!\*)\b(' + re.escape(form) + r')\b(?!\*)', re.IGNORECASE)
            result = pattern.sub(lambda m: f'==**{m.group(1)}**==', result)
    return result


def bold_chinese_in_text(cn_text, word):
    """Bold the Chinese meaning(s) of a vocab word in the Chinese text."""
    meanings = [m.strip() for m in get_meaning(word).split('；') if m.strip()]
    expanded = []
    for m in meanings:
        expanded.append(m)
        for suffix in ['的', '者', '地', '性']:
            if m.endswith(suffix) and len(m) > 2:
                expanded.append(m[:-len(suffix)])
    expanded = sorted(set(expanded), key=len, reverse=True)
    result = cn_text
    for m in expanded:
        if m in result:
            pattern = re.compile(r'(?<!\*==)' + re.escape(m) + r'(?!==\*)')
            result = pattern.sub(lambda mo: f'==**{mo.group(0)}**==', result)
    return result


def find_vocab_matches(pairs, vocab):
    """Build word -> [(en, cn), ...] mapping for all vocab words in pairs."""
    word_sentences = {}
    for en, cn in pairs:
        en_lower = en.lower()
        for w in vocab:
            for form in get_all_forms(w):
                if re.search(r'\b' + re.escape(form) + r'\b', en_lower):
                    if w not in word_sentences:
                        word_sentences[w] = []
                    word_sentences[w].append((en, cn))
                    break
    return word_sentences


# ── Markdown output ───────────────────────────────────────────────

def format_markdown(pairs, title, vocab=None):
    """2-column table: left=台词(EN+CN), right=单词 info."""
    word_sentences = find_vocab_matches(pairs, vocab) if vocab else {}

    lines = [f'# {title}', '', '| 台词 | 单词 |', '| --- | --- |']

    for en, cn in pairs:
        if not en:
            en = '…'
        if not cn:
            cn = '…'

        matched_words = set()
        if vocab:
            en_lower = en.lower()
            for w in word_sentences:
                for form in get_all_forms(w):
                    if re.search(r'\b' + re.escape(form) + r'\b', en_lower):
                        matched_words.add(w)
                        break

        en_display = bold_vocab_in_text(en, matched_words) if matched_words else en
        cn_display = cn
        if matched_words:
            for w in matched_words:
                cn_display = bold_chinese_in_text(cn_display, w)

        left_cell = f'{en_display}<br>{cn_display}'

        right_cell = ''
        if matched_words:
            parts = []
            for w in sorted(matched_words):
                meanings = [m.strip()
                            for m in get_meaning(w).split('；') if m.strip()]
                first_meaning = meanings[0] if meanings else w
                pos = get_pos(w)
                ipa = get_ipa(w)
                root = get_root(w)
                count = len(word_sentences[w])
                reflection = get_reflection(w)
                card = (
                    f'**{w.capitalize()}** {ipa} ({pos}. {first_meaning})<br>'
                    f'💡 **思考：** {reflection}'
                )
                parts.append(card)
            right_cell = '<br><br>'.join(parts)

        left_cell = left_cell.replace('|', '\\|')
        right_cell = right_cell.replace('|', '\\|')
        lines.append(f'| {left_cell} | {right_cell} |')

    return '\n'.join(lines)


# ── Entry point ───────────────────────────────────────────────────

def process_dialogues(dialogues_text, vocab_set, title="学习笔记"):
    """Full pipeline: text → (en, cn) pairs → Markdown output.

    Args:
        dialogues_text: Raw bilingual dialogue text (pasted by user)
        vocab_set: Set of vocabulary words (lowercase base forms)
        title: Title for the output document

    Returns:
        dict with keys: markdown, pair_count, match_count
    """
    pairs = extract_pairs(dialogues_text)
    pairs = clean_pairs(pairs)
    md = format_markdown(pairs, title, vocab_set)

    match_count = 0
    if vocab_set:
        word_sentences = find_vocab_matches(pairs, vocab_set)
        match_count = len(word_sentences)

    return {
        "markdown": md,
        "pair_count": len(pairs),
        "match_count": match_count,
    }
