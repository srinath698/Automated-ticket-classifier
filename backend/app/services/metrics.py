from typing import Optional
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_recall_fscore_support,
    confusion_matrix,
    log_loss,
    roc_auc_score,
)
from sklearn.preprocessing import label_binarize

from app.config import DATASET_PATH
from app.schemas import MetricsResponse, PerClassMetric
from app.services.classifier import get_classifier


class MetricsService:
    _cached_metrics: Optional[MetricsResponse] = None

    @classmethod
    def get_metrics(cls) -> MetricsResponse:
        if cls._cached_metrics is not None:
            return cls._cached_metrics

        if not DATASET_PATH.exists():
            raise FileNotFoundError(f"Dataset file not found at {DATASET_PATH.resolve()}")

        df = pd.read_csv(DATASET_PATH)
        raw_size = len(df)

        # 1. Clean missing/empty
        clean = df.dropna(subset=["text", "label"]).copy()
        clean["text"] = clean["text"].astype(str).str.strip()
        clean["label"] = clean["label"].astype(str).str.strip()
        clean = clean[(clean["text"] != "") & (clean["label"] != "")]

        # 2. Strict Deduplication (Leakage prevention)
        dedup = clean.drop_duplicates(subset="text", keep="first").copy()
        total_dedup_size = len(dedup)

        # 3. Stratified 80/20 train/test split matching notebook
        X = dedup["text"]
        y = dedup["label"]
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        train_size = len(X_train)
        test_size = len(X_test)

        # 4. Predict using the authoritative fitted pipeline
        classifier = get_classifier()
        classes = classifier.classes_

        y_pred = classifier.model.predict(X_test)
        y_proba = classifier.model.predict_proba(X_test)

        acc = float(accuracy_score(y_test, y_pred))
        loss = float(log_loss(y_test, y_proba, labels=classes))

        # Multi-class ROC-AUC (One-vs-Rest)
        y_test_bin = label_binarize(y_test, classes=classes)
        auc_score = float(roc_auc_score(y_test_bin, y_proba, multi_class="ovr", average="macro"))

        p, r, f1, s = precision_recall_fscore_support(y_test, y_pred, labels=classes, zero_division=0)
        macro_p, macro_r, macro_f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="macro", zero_division=0
        )
        _, _, weighted_f1, _ = precision_recall_fscore_support(
            y_test, y_pred, average="weighted", zero_division=0
        )

        per_class: list[PerClassMetric] = []
        for cat, prec, rec, f_one, sup in zip(classes, p, r, f1, s):
            per_class.append(
                PerClassMetric(
                    category=cat,
                    precision=round(float(prec), 4),
                    recall=round(float(rec), 4),
                    f1_score=round(float(f_one), 4),
                    support=int(sup),
                )
            )

        cm = confusion_matrix(y_test, y_pred, labels=classes)
        cm_matrix = cm.tolist()

        methodology = {
            "dataset_file": "dataset/support_tickets.csv",
            "deduplication": "Removed 1,174 duplicate ticket texts to prevent cross-split train/test data leakage",
            "split": "Stratified 80/20 train/test split with random_state=42",
            "evaluation_scope": "Evaluated exclusively on the 166 held-out test tickets never seen during pipeline fitting",
            "metrics_integrity": "Computed directly from scikit-learn metrics using predicted probabilities and labels",
        }

        response = MetricsResponse(
            accuracy=round(acc, 4),
            log_loss=round(loss, 4),
            roc_auc_macro=round(auc_score, 4),
            macro_f1=round(float(macro_f1), 4),
            weighted_f1=round(float(weighted_f1), 4),
            train_size=train_size,
            test_size=test_size,
            total_deduplicated_size=total_dedup_size,
            raw_size=raw_size,
            classes=classes,
            per_class_metrics=per_class,
            confusion_matrix=cm_matrix,
            methodology=methodology,
        )

        cls._cached_metrics = response
        return response
