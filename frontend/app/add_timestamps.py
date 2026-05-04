import re

with open('/c/Users/67373/Desktop/vocabforge/frontend/app/page.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

timestamps = {
    38: ' 00:08',
    40: ' 00:21',
    42: ' 00:27',
    44: ' 00:36',
    46: ' 00:42',
    48: ' 00:44',
    50: ' 00:47',
    52: ' 01:18',
    54: ' 01:21',
    56: ' 02:03',
    58: ' 02:05',
    60: ' 02:06',
    62: ' 02:07',
    64: ' 02:13',
    66: ' 02:34',
    68: ' 02:36',
    70: ' 02:41',
    72: ' 02:45',
    74: ' 02:51',
    76: ' 02:57',
    78: ' 02:58',
    80: ' 03:03',
    82: ' 03:08',
    84: ' 03:13',
    86: ' 03:18',
    88: ' 03:24',
    90: ' 05:42',
    92: ' 05:45',
    94: ' 05:49',
    96: ' 05:58',
    98: ' 06:07',
    100: ' 06:19',
    102: ' 06:28',
    104: ' 06:33',
    106: ' 06:34',
    108: ' 06:38',
    110: ' 06:56',
    112: ' 07:23',
    114: ' 07:26',
    116: ' 07:36',
}

modified = False
for idx, ts in timestamps.items():
    line = lines[idx]
    if re.search(r'\d{2}:\d{2}', line):
        print(f'Line {idx+1} already has timestamp, skipping')
        continue
    stripped = line.rstrip('\n')
    has_backtick = stripped.endswith('`')
    if has_backtick:
        stripped = stripped[:-1]
    stripped = stripped + ts
    if has_backtick:
        stripped += '`'
    lines[idx] = stripped + '\n'
    print(f'Updated line {idx+1}: added {ts}')
    modified = True

if modified:
    with open('/c/Users/67373/Desktop/vocabforge/frontend/app/page.tsx', 'w', encoding='utf-8') as f:
        f.writelines(lines)
    print('File saved')
else:
    print('No changes made')
