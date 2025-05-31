import json
import os

# File path for training data
file_path = "datasets/data.jsonl"

# Function to add new data
def add_data():
    while True:
        # Keep asking for a valid input
        print("--------------------------------------------------")
        action = input("\nPress (a) to add new data or (q) to quit: ").strip().lower()
        
        if action == "q":
            print("Exiting... Data saved successfully!")
            break
        elif action == "a":
            input_text = input("📝 Enter user input: ").strip()
            output_text = input("💬 Enter assistant output: ").strip()

            if input_text and output_text:
                new_entry = {"input": input_text, "output": output_text}
                
                # Append to the file
                with open(file_path, "a", encoding="utf-8") as file:
                    file.write(json.dumps(new_entry, ensure_ascii=False) + "\n")

                print("✅ Data added successfully!")
            else:
                print("⚠️ Both input and output are required!")
        # If input is not 'a' or 'q', just retry (no error message)
    
# Create the file if it doesn't exist
if not os.path.exists(file_path):
    open(file_path, "w").close()  # Create an empty file

# Run the data input function
add_data()
