from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Define CORS policy: Allow only GitHub Pages & Netlify
CORS(app, resources={
    r"/chat": {"origins": "https://quantasphere.github.io"},
    r"/netlify-chat": {"origins": "https://lambent-cendol-123456.netlify.app"}
})

@app.route("/chat", methods=["POST"])
def github_chat():
    data = request.get_json()
    user_message = data.get("message", "No message received")
    return jsonify({"response": f"GitHub Pages AI Response to: {user_message}"})

@app.route("/netlify-chat", methods=["POST"])
def netlify_chat():
    data = request.get_json()
    user_message = data.get("message", "No message received")
    return jsonify({"response": f"Netlify AI Response to: {user_message}"})

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "API is running! Use /chat (GitHub) or /netlify-chat (Netlify) with POST."})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
