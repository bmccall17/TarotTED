import json

with open('docs/fullmeaning_Wands.jsonl', 'r') as f:
    lines = [l.strip() for l in f if l.strip() and not l.strip().startswith('```')]

    for i, line in enumerate(lines, 1):
        try:
            obj = json.loads(line)
            print(f'{i}. ✅ {obj.get("Card", "Unknown")}')
        except json.JSONDecodeError as e:
            print(f'{i}. ❌ {e.msg} at position {e.pos}')
            print(f'   Context: ...{line[max(0,e.pos-30):min(len(line),e.pos+30)]}...')
            print()
