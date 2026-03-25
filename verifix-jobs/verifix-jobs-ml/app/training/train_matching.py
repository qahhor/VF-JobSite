"""
CatBoost training pipeline for candidate-vacancy matching.

Usage:
    python -m app.training.train_matching --db-url postgresql://verifix:pass@localhost/verifix_jobs
"""

import argparse
import json
import logging
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def load_data(db_url: str) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    from sqlalchemy import create_engine
    engine = create_engine(db_url)
    applications = pd.read_sql("SELECT id, candidate_id, vacancy_id, status, source, applied_at FROM application WHERE deleted_at IS NULL", engine)
    candidates = pd.read_sql("SELECT id, city, preferred_salary, skills, preferred_categories, education_level, myid_status FROM candidate WHERE deleted_at IS NULL", engine)
    vacancies = pd.read_sql("SELECT id, category, city, salary_from, salary_to, employment_type, positions_count FROM vacancy WHERE deleted_at IS NULL", engine)
    logger.info(f"Loaded: {len(applications)} apps, {len(candidates)} candidates, {len(vacancies)} vacancies")
    return applications, candidates, vacancies


def build_features(apps, candidates, vacancies):
    df = apps.merge(candidates, left_on='candidate_id', right_on='id', suffixes=('', '_c'))
    df = df.merge(vacancies, left_on='vacancy_id', right_on='id', suffixes=('', '_v'))
    features = pd.DataFrame()
    features['city_match'] = (df['city'] == df['city_v']).astype(int)
    features['category_match'] = df.apply(lambda r: 1 if r.get('preferred_categories') and r.get('category') and r['category'] in str(r['preferred_categories']) else 0, axis=1)
    features['salary_in_range'] = df.apply(lambda r: 1 if r.get('preferred_salary') and r.get('salary_from') and r['salary_from'] <= r['preferred_salary'] else 0, axis=1)
    features['myid_verified'] = (df['myid_status'] == 'VERIFIED').astype(int)
    edu_map = {'PRIMARY': 1, 'SECONDARY': 2, 'VOCATIONAL': 3, 'BACHELORS': 4, 'MASTERS': 5}
    features['education_level'] = df['education_level'].map(edu_map).fillna(0)
    for src in ['TELEGRAM', 'WEB', 'REFERRAL']:
        features[f'source_{src.lower()}'] = (df['source'] == src).astype(int)
    target = (df['status'] == 'HIRED').astype(int)
    return features, target


def train_model(X, y, output_dir='models'):
    try:
        from catboost import CatBoostClassifier
        model = CatBoostClassifier(iterations=500, depth=6, learning_rate=0.05, loss_function='Logloss', verbose=50, random_seed=42)
    except ImportError:
        from sklearn.ensemble import GradientBoostingClassifier
        model = GradientBoostingClassifier(n_estimators=200, max_depth=5, random_state=42)

    from sklearn.model_selection import train_test_split
    from sklearn.metrics import roc_auc_score, classification_report
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    model.fit(X_train, y_train)
    y_prob = model.predict_proba(X_test)[:, 1]
    auc = roc_auc_score(y_test, y_prob)
    logger.info(f"AUC: {auc:.4f}\n{classification_report(y_test, model.predict(X_test))}")

    Path(output_dir).mkdir(parents=True, exist_ok=True)
    ts = datetime.now().strftime('%Y%m%d_%H%M%S')
    # Save model using joblib (safe serialization)
    import joblib
    joblib.dump(model, f'{output_dir}/matching_model_{ts}.joblib')
    # Save metadata as JSON
    with open(f'{output_dir}/model_meta_{ts}.json', 'w') as f:
        json.dump({'auc': auc, 'features': X.columns.tolist(), 'samples': len(X), 'timestamp': ts}, f, indent=2)
    logger.info(f"Model saved to {output_dir}/matching_model_{ts}.joblib")
    return model, auc


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--db-url', required=True)
    parser.add_argument('--output-dir', default='models')
    parser.add_argument('--min-samples', type=int, default=100)
    args = parser.parse_args()

    apps, candidates, vacancies = load_data(args.db_url)
    if len(apps) < args.min_samples:
        logger.warning(f"Only {len(apps)} apps. Need {args.min_samples}+. Skipping."); return
    X, y = build_features(apps, candidates, vacancies)
    if y.sum() < 10:
        logger.warning(f"Only {y.sum()} positive (HIRED). Need 10+. Skipping."); return
    train_model(X, y, args.output_dir)


if __name__ == '__main__':
    main()
