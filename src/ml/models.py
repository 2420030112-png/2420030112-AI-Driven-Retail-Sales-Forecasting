"""
NEXUS Baseline Forecasting Models Module.
Implements the 5 baseline architectures required for Review 3:
1. Seasonal Naive Benchmark
2. ElasticNet Regularized Linear Regression
3. Random Forest Regressor
4. XGBoost Regressor
5. Prophet & SARIMAX Statistical Forecasters
"""

from typing import Dict, Any, List, Optional, Tuple
import time
import numpy as np
import pandas as pd
from sklearn.linear_model import ElasticNet
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from statsmodels.tsa.statespace.sarimax import SARIMAX
from prophet import Prophet

import sys
from pathlib import Path

ml_dir = Path(__file__).resolve().parent
if str(ml_dir) not in sys.path:
    sys.path.insert(0, str(ml_dir))

try:
    from metrics import calculate_metrics
except ImportError:
    from src.ml.metrics import calculate_metrics


class SeasonalNaiveForecaster:
    """
    Baseline 1: Seasonal Naive Forecaster.
    Projects future weekly sales based on the sales observed 52 weeks prior (t - 52).
    Falls back to lag 1 (t - 1) or historical series mean if 52-week lag is unobserved.
    """
    def __init__(self):
        self.series_history = {}
        self.series_means = {}
        self.overall_mean = 0.0
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, target_col: str = "Weekly_Sales"):
        start = time.time()
        self.overall_mean = float(train_df[target_col].mean())
        for (store, dept), group in train_df.groupby(["Store", "Dept"]):
            sorted_g = group.sort_values("Date")
            # Store date -> sales mapping
            self.series_history[(store, dept)] = dict(zip(pd.to_datetime(sorted_g["Date"]), sorted_g[target_col]))
            self.series_means[(store, dept)] = float(sorted_g[target_col].mean())
        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = []
        for _, row in test_df.iterrows():
            store = row["Store"]
            dept = row["Dept"]
            date = pd.to_datetime(row["Date"])
            target_lag_date = date - pd.Timedelta(weeks=52)

            key = (store, dept)
            history = self.series_history.get(key, {})

            if target_lag_date in history:
                pred = history[target_lag_date]
            elif "sales_lag_52w" in row and not pd.isnull(row["sales_lag_52w"]):
                pred = row["sales_lag_52w"]
            elif "sales_lag_1w" in row and not pd.isnull(row["sales_lag_1w"]):
                pred = row["sales_lag_1w"]
            else:
                pred = self.series_means.get(key, self.overall_mean)

            preds.append(pred)

        infer_time = (time.time() - start) * 1000.0
        return np.asarray(preds, dtype=float), infer_time


class ElasticNetForecaster:
    """
    Baseline 2: ElasticNet Regularized Linear Model.
    Learns linear relationship across lag features, markdowns, and macroeconomic indicators.
    """
    def __init__(self, alpha: float = 0.1, l1_ratio: float = 0.5):
        self.alpha = alpha
        self.l1_ratio = l1_ratio
        self.model = ElasticNet(alpha=alpha, l1_ratio=l1_ratio, max_iter=2000, random_state=42)
        self.feature_columns = []
        self.train_time = 0.0

    def fit(self, X_train: pd.DataFrame, y_train: pd.Series, feature_cols: List[str]):
        self.feature_columns = feature_cols
        start = time.time()
        self.model.fit(X_train[self.feature_columns], y_train)
        self.train_time = time.time() - start
        return self

    def predict(self, X_test: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = self.model.predict(X_test[self.feature_columns])
        infer_time = (time.time() - start) * 1000.0
        return preds, infer_time


class RandomForestForecaster:
    """
    Baseline 3: Random Forest Regressor Ensemble.
    Bagged ensemble of decorrelated decision trees capturing non-linear interactions.
    """
    def __init__(self, n_estimators: int = 100, max_depth: int = 12):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )
        self.feature_columns = []
        self.train_time = 0.0

    def fit(self, X_train: pd.DataFrame, y_train: pd.Series, feature_cols: List[str]):
        self.feature_columns = feature_cols
        start = time.time()
        self.model.fit(X_train[self.feature_columns], y_train)
        self.train_time = time.time() - start
        return self

    def predict(self, X_test: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = self.model.predict(X_test[self.feature_columns])
        infer_time = (time.time() - start) * 1000.0
        return preds, infer_time


class XGBoostForecaster:
    """
    Baseline 4: XGBoost Regressor (v2.4+ / v3.4+).
    Regularized gradient boosted trees with cache-aware histogram split finding.
    """
    def __init__(self, n_estimators: int = 150, max_depth: int = 6, learning_rate: float = 0.08):
        self.model = xgb.XGBRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            learning_rate=learning_rate,
            subsample=0.85,
            colsample_bytree=0.85,
            reg_alpha=0.1,
            reg_lambda=1.0,
            tree_method="hist",
            random_state=42,
            n_jobs=-1
        )
        self.feature_columns = []
        self.train_time = 0.0

    def fit(self, X_train: pd.DataFrame, y_train: pd.Series, feature_cols: List[str]):
        self.feature_columns = feature_cols
        start = time.time()
        self.model.fit(X_train[self.feature_columns], y_train)
        self.train_time = time.time() - start
        return self

    def predict(self, X_test: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = self.model.predict(X_test[self.feature_columns])
        infer_time = (time.time() - start) * 1000.0
        return preds, infer_time


class ProphetForecaster:
    """
    Baseline 5A: Bayesian Generalized Additive Forecaster (Prophet).
    Models piecewise trends, annual Fourier seasonality, and holiday changepoints per series.
    Guarantees exact target row and date alignment across all (Store, Dept) series with zero future sales leakage.
    """
    def __init__(self):
        self.series_models = {}  # (Store, Dept) -> Prophet model
        self.series_means = {}
        self.overall_mean = 0.0
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, target_col: str = "Weekly_Sales"):
        start = time.time()
        self.overall_mean = float(train_df[target_col].mean())
        
        # Fit independent models per (Store, Dept) series to ensure exact row/date alignment
        for (store, dept), g in train_df.groupby(["Store", "Dept"]):
            df_p = pd.DataFrame({
                "ds": pd.to_datetime(g["Date"]),
                "y": g[target_col].values,
            }).sort_values("ds").reset_index(drop=True)
            self.series_means[(store, dept)] = float(g[target_col].mean())
            
            try:
                m = Prophet(
                    yearly_seasonality=True,
                    weekly_seasonality=False,
                    daily_seasonality=False,
                    changepoint_prior_scale=0.05
                )
                m.add_country_holidays(country_name="US")
                m.fit(df_p)
                self.series_models[(store, dept)] = m
            except Exception:
                self.series_models[(store, dept)] = None

        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = np.zeros(len(test_df), dtype=float)

        for (store, dept), group_indices in test_df.groupby(["Store", "Dept"]).groups.items():
            sub_df = test_df.loc[group_indices]
            m = self.series_models.get((store, dept))
            if m is not None:
                future = pd.DataFrame({"ds": pd.to_datetime(sub_df["Date"])})
                fc = m.predict(future)
                preds[test_df.index.get_indexer(group_indices)] = fc["yhat"].values
            else:
                fallback = self.series_means.get((store, dept), self.overall_mean)
                preds[test_df.index.get_indexer(group_indices)] = fallback

        infer_time = (time.time() - start) * 1000.0
        return preds, infer_time


class SARIMAXForecaster:
    """
    Baseline 5B: Seasonal Autoregressive Integrated Moving Average with Exogenous Regressors.
    Fits SARIMAX per (Store, Dept) series to guarantee exact target row and date alignment.
    """
    def __init__(self, order: Tuple[int, int, int] = (1, 1, 0)):
        self.order = order
        self.series_models = {}  # (Store, Dept) -> SARIMAXResults
        self.series_means = {}
        self.exog_cols = []
        self.overall_mean = 0.0
        self.train_time = 0.0

    def fit(self, train_df: pd.DataFrame, target_col: str = "Weekly_Sales", exog_cols: Optional[List[str]] = None):
        start = time.time()
        self.exog_cols = exog_cols or []
        self.overall_mean = float(train_df[target_col].mean())

        for (store, dept), g in train_df.groupby(["Store", "Dept"]):
            sorted_g = g.sort_values("Date").reset_index(drop=True)
            y = sorted_g[target_col].values
            exog = sorted_g[self.exog_cols].values if self.exog_cols else None
            self.series_means[(store, dept)] = float(np.mean(y))

            try:
                model = SARIMAX(
                    y,
                    exog=exog,
                    order=self.order,
                    enforce_stationarity=False,
                    enforce_invertibility=False
                )
                res = model.fit(disp=False, maxiter=50)
                self.series_models[(store, dept)] = res
            except Exception:
                self.series_models[(store, dept)] = None

        self.train_time = time.time() - start
        return self

    def predict(self, test_df: pd.DataFrame) -> Tuple[np.ndarray, float]:
        start = time.time()
        preds = np.zeros(len(test_df), dtype=float)

        for (store, dept), group_indices in test_df.groupby(["Store", "Dept"]).groups.items():
            sub_df = test_df.loc[group_indices].sort_values("Date")
            n_steps = len(sub_df)
            exog_test = sub_df[self.exog_cols].values if self.exog_cols else None

            res = self.series_models.get((store, dept))
            if res is not None:
                try:
                    fc = res.forecast(steps=n_steps, exog=exog_test)
                    preds[test_df.index.get_indexer(sub_df.index)] = fc
                except Exception:
                    preds[test_df.index.get_indexer(sub_df.index)] = self.series_means.get((store, dept), self.overall_mean)
            else:
                preds[test_df.index.get_indexer(sub_df.index)] = self.series_means.get((store, dept), self.overall_mean)

        infer_time = (time.time() - start) * 1000.0
        return preds, infer_time


def predict_recursive_multistep(
    model: Any,
    eval_df: pd.DataFrame,
    history_df: pd.DataFrame,
    feature_cols: List[str],
    target_col: str = "Weekly_Sales"
) -> Tuple[np.ndarray, float]:
    """
    Executes true multi-step out-of-time forecasting with zero future target leakage.
    At forecast origin T0, future target sales in eval_df are strictly inaccessible.
    Autoregressive lags (1w, 2w, 4w, 8w) and rolling statistics (4w, 12w) are updated
    dynamically using the model's own prior step forecasts.
    Long lags >= 52w use verified pre-split historical observations.
    """
    start = time.time()
    preds = np.zeros(len(eval_df), dtype=float)

    for (store, dept), group_indices in eval_df.groupby(["Store", "Dept"]).groups.items():
        eval_slice = eval_df.loc[group_indices].sort_values("Date")
        orig_indices = eval_slice.index

        hist_slice = history_df[(history_df["Store"] == store) & (history_df["Dept"] == dept)].sort_values("Date")
        if len(hist_slice) > 0:
            sales_history = list(hist_slice[target_col].values)
            series_mean = float(np.mean(sales_history))
        else:
            series_mean = float(history_df[target_col].mean())
            sales_history = [series_mean] * 52

        step_preds = []
        for _, row in eval_slice.iterrows():
            row_dict = row.to_dict()
            n_hist = len(sales_history)
            row_dict["sales_lag_1w"] = sales_history[-1] if n_hist >= 1 else series_mean
            row_dict["sales_lag_2w"] = sales_history[-2] if n_hist >= 2 else series_mean
            row_dict["sales_lag_4w"] = sales_history[-4] if n_hist >= 4 else series_mean
            row_dict["sales_lag_8w"] = sales_history[-8] if n_hist >= 8 else series_mean
            row_dict["sales_lag_52w"] = sales_history[-52] if n_hist >= 52 else series_mean

            w4 = sales_history[-4:] if n_hist >= 4 else sales_history
            w12 = sales_history[-12:] if n_hist >= 12 else sales_history
            row_dict["sales_rolling_mean_4w"] = float(np.mean(w4))
            row_dict["sales_rolling_std_4w"] = float(np.std(w4)) if len(w4) > 1 else 0.0
            row_dict["sales_rolling_mean_12w"] = float(np.mean(w12))

            row_feat_df = pd.DataFrame([row_dict])[feature_cols]

            if hasattr(model, "predict"):
                pred_out = model.predict(row_feat_df)
                if isinstance(pred_out, tuple):
                    y_hat = float(pred_out[0][0])
                elif isinstance(pred_out, np.ndarray):
                    y_hat = float(pred_out[0])
                else:
                    y_hat = float(pred_out)
            else:
                y_hat = series_mean

            step_preds.append(y_hat)
            sales_history.append(y_hat)

        preds[eval_df.index.get_indexer(orig_indices)] = step_preds

    infer_time = (time.time() - start) * 1000.0
    return preds, infer_time
