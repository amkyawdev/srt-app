"""
Bot module for SRT Translate App
This module can be used for standalone bot functionality or integrated with the main API.
"""
import os
from groq import Groq

# Initialize Groq client
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def get_bot_response(message: str) -> str:
    """
    Get a response from the Groq AI bot.
    
    Args:
        message: User's input message
        
    Returns:
        AI-generated response string
    """
    try:
        completion = groq_client.chat.completions.create(
            model="mixtral-8x7b-32768",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant for SRT Translate App. You help users with translation questions and app usage."
                },
                {"role": "user", "content": message}
            ],
            temperature=0.7,
            max_tokens=1024
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"I apologize, but I encountered an error: {str(e)}"

if __name__ == "__main__":
    # Simple CLI for testing
    print("SRT Translate Bot - CLI Mode")
    print("Type 'exit' to quit\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ['exit', 'quit']:
            break
        response = get_bot_response(user_input)
        print(f"Bot: {response}\n")