from flask import Flask, request, jsonify, render_template
from openai import OpenAI

app = Flask(__name__)

def load_api_key():
    with open("api_key.txt", "r") as file:
        return file.read().strip()

api_key = load_api_key()
client = OpenAI(api_key=api_key)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_input = data["user_input"]
    chat_history = data["chat_history"]
    selected_model = data['selected_model']
    
    chat_history.append({"role": "user", "content": user_input})

    response = client.chat.completions.create(
        model=selected_model,
        messages=chat_history
    )

    if response.choices:
        message_content = response.choices[0].message.content
        chat_history.append({"role": "assistant", "content": message_content})
    else:
        message_content = "No response received."

    return jsonify({"response": message_content, "chat_history": chat_history})

if __name__ == "__main__":
    app.run(debug=True)