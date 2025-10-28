import csv
import re

def get_first_word(text):
    """Extract the first word from a text string, handling special cases."""
    if not text:
        return ""
    
    # Handle compound emotions like "Obligation + Guilt + Anxiety"
    if "+" in text:
        first_emotion = text.split("+")[0].strip()
        return first_emotion.split()[0]
    
    # Handle regular text
    words = text.split()
    return words[0] if words else ""

def create_title(first_name, topic, primary_emotion):
    """Create title in format: FirstName-TopicFirstWordOnly-PrimaryEmotionFirstWordOnly"""
    topic_first_word = get_first_word(topic)
    emotion_first_word = get_first_word(primary_emotion)
    
    return f"{first_name}-{topic_first_word}-{emotion_first_word}"

def process_csv():
    input_file = r"c:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\quality-review\master-conversations-list-normalized-100_v2.csv"
    output_file = r"c:\Users\james\Master\BrightHub\brun\train-data\pmc\context-ai\pmct\quality-review\master-conversations-list-normalized-100_v3.csv"
    
    with open(input_file, 'r', newline='', encoding='utf-8') as infile:
        reader = csv.DictReader(infile)
        
        # Get the original fieldnames and create new ones
        original_fieldnames = reader.fieldnames
        
        # Create new fieldnames with Title as 2nd column
        new_fieldnames = ['conversation_id', 'title'] + [field for field in original_fieldnames if field != 'conversation_id']
        
        with open(output_file, 'w', newline='', encoding='utf-8') as outfile:
            writer = csv.DictWriter(outfile, fieldnames=new_fieldnames)
            writer.writeheader()
            
            for row in reader:
                # Create the title field
                first_name = row.get('first_name', '')
                topic = row.get('topic', '')
                primary_emotion = row.get('primary_emotions', '') or row.get('emotion', '')
                
                title = create_title(first_name, topic, primary_emotion)
                
                # Clear the notes field
                row['notes'] = ''
                
                # Create new row with title field
                new_row = {'conversation_id': row['conversation_id'], 'title': title}
                
                # Add all other fields
                for field in original_fieldnames:
                    if field != 'conversation_id':
                        new_row[field] = row[field]
                
                writer.writerow(new_row)
    
    print(f"CSV processing complete. Output saved to: {output_file}")

if __name__ == "__main__":
    process_csv()