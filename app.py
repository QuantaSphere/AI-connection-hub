from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Allow all origins (for debugging, change later)
CORS(app, resources={r"/*": {"origins": [
    "https://lambent-cendol-123456.netlify.app",
    "https://quantasphere.github.io"
]}})
 

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_message = data.get("message", "No message received")
    return jsonify({"message": f"AI Response to: {user_message}"})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)  # Ensure it's accessible
