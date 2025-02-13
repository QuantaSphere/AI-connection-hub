from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["https://lambent-cendol-123456.netlify.app"])

@app.route("/chat", methods=["POST"])
def chat():
    return {"message": "Hello from AI"}

if __name__ == "__main__":
    app.run()
