import pandas as pd
from sklearn.pipeline import make_pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression

# Load your CSV file with labeled emotion data
df = pd.read_csv("ml_data.csv")  # Make sure this file is in the same folder

# Create a pipeline: vectorizer + classifier
model = make_pipeline(
    TfidfVectorizer(),
    LogisticRegression()
)

# Train the model
model.fit(df["text"], df["emotion"])

def detect_emotion(text: str) -> tuple[str, float]:
    pred = model.predict([text])[0]
    prob = max(model.predict_proba([text])[0])  # highest probability
    return pred, round(prob, 2)  # type: ignore # e.g., ('anxious', 0.87)

