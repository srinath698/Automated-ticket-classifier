"""
Train Support Ticket Auto-Classifier
Replicates the exact training pipeline from notebooks/automated_ticket_classifier.ipynb:
- Data cleaning & deduplication
- Train/Test Split (80/20, random_state=42, stratified)
- TfidfVectorizer(max_features=5000, stop_words="english")
- LogisticRegression(max_iter=1000, random_state=42)
- Evaluates test accuracy and classification metrics
- Saves fitted pipeline to models/ticket_classifier.joblib
"""

from pathlib import Path
import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline


def train_model():
    dataset_path = Path("dataset/support_tickets.csv")
    if not dataset_path.exists():
        raise FileNotFoundError(f"Dataset not found at {dataset_path.resolve()}")

    print(f"Loading dataset from: {dataset_path}")
    df = pd.read_csv(dataset_path)

    # 1. Validation & Cleaning
    required_columns = {"text", "label"}
    missing_columns = required_columns.difference(df.columns)
    if missing_columns:
        raise ValueError(f"Dataset is missing required columns: {sorted(missing_columns)}")

    df_clean = df.dropna(subset=["text", "label"]).copy()
    df_clean["text"] = df_clean["text"].astype(str).str.strip()
    df_clean["label"] = df_clean["label"].astype(str).str.strip()
    df_clean = df_clean[(df_clean["text"] != "") & (df_clean["label"] != "")]

    label_counts_per_text = df_clean.groupby("text")["label"].nunique()
    conflicting_texts = label_counts_per_text[label_counts_per_text > 1]
    if not conflicting_texts.empty:
        raise ValueError(f"Found {len(conflicting_texts)} texts with conflicting labels!")

    # 2. Deduplication
    rows_before = len(df_clean)
    df_clean = df_clean.drop_duplicates(subset="text", keep="first").copy()
    print(f"Deduplication: {rows_before} -> {len(df_clean)} rows.")

    # 3. Train / Test Split
    X = df_clean["text"]
    y = df_clean["label"]
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y,
    )
    print(f"Training split: {len(X_train)} samples, Test split: {len(X_test)} samples.")
    print(f"Number of target categories: {y.nunique()}")

    # 4. Pipeline Definition & Training
    print("Training TF-IDF + Logistic Regression pipeline...")
    pipeline = Pipeline(steps=[
        ("tfidf", TfidfVectorizer(max_features=5000, stop_words="english")),
        ("logreg", LogisticRegression(max_iter=1000, random_state=42)),
    ])
    pipeline.fit(X_train, y_train)

    # 5. Evaluation
    y_pred = pipeline.predict(X_test)
    acc = accuracy_score(y_test, y_pred)
    print(f"\nModel Evaluation:")
    print(f"Test Accuracy: {acc:.4f} ({acc*100:.2f}%)")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))

    # 6. Save Pipeline
    model_dir = Path("models")
    model_dir.mkdir(parents=True, exist_ok=True)
    model_path = model_dir / "ticket_classifier.joblib"
    joblib.dump(pipeline, model_path)
    print(f"Successfully saved fitted pipeline to: {model_path.resolve()}")
    print(f"Model file size: {model_path.stat().st_size:,} bytes")


if __name__ == "__main__":
    train_model()
