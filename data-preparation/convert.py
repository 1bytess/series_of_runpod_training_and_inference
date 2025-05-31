import json

# Input and output filenames
input_filename = "datasets/data.jsonl"
output_filename = "dataset.json"

# Read JSONL and convert to new format
converted = []
with open(input_filename, "r", encoding="utf-8") as f:
    for line in f:
        item = json.loads(line)
        converted.append({
            "instruction": item["input"],
            "input": "",
            "output": item["output"]
        })

# Save as JSON array
with open(output_filename, "w", encoding="utf-8") as f:
    json.dump(converted, f, ensure_ascii=False, indent=2)

print(f"Converted {len(converted)} entries to '{output_filename}'")
