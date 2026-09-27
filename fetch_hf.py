#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
fetch_hf.py — 每日 Hugging Face 熱門模型雷達：抓取 → 清洗 → 評分 → 精選 → 輸出

設計原則
--------
1. 零相依：只用 Python 標準函式庫（3.8+），macOS 內建或任何 Python 環境都能跑。
2. 三段式漏斗（BCG 式可解釋）：
     ① 衛生過濾：辨識「量化/格式轉檔」「微調」「LoRA/Adapter」「合併」等衍生版本，
        避免同一個基礎模型的十幾個 GGUF/MLX 轉檔洗版。
     ② 有趣度評分（0–100）：熱度動能、按讚速度、新鮮度、原創性、任務稀有度五個維度加權。
     ③ 多樣性精選：同作者、同任務設上限，確保「今日精選」橫跨不同模態。
3. 失敗安全：網路或解析失敗時保留舊檔（原子寫入），並回傳非零 exit code。
4. 產出兩種格式：
     daily_models.json  → 給 server.py（方案 A）或其他程式使用
     daily_models.js    → 給 index.html 直接以 <script> 載入（方案 B：file:// 也能讀）
   並把每日快照存到 history/YYYY-MM-DD.json，用來計算「今日新進榜」與排名變化。

用法
----
    python3 fetch_hf.py                 # 預設抓 60 筆、精選 12 筆
    python3 fetch_hf.py --limit 100 --top 15
    HF_TOKEN=hf_xxx python3 fetch_hf.py # 帶 token 可提高 API 額度（選用）
    python3 fetch_hf.py --raw-file raw.json   # 離線重算（除錯用）
"""
from __future__ import annotations

import argparse
import json
import math
import os
import re
import ssl
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

__version__ = "1.0.0"

BASE_DIR = Path(__file__).resolve().parent
HF_ENDPOINT = os.environ.get("HF_ENDPOINT", "https://huggingface.co").rstrip("/")  # 可改用鏡像站
API_MODELS = f"{HF_ENDPOINT}/api/models"
API_TRENDING = f"{HF_ENDPOINT}/api/trending"
USER_AGENT = f"ModelLearning-Radar/{__version__} (+local dashboard; python-urllib)"

# 有趣度評分權重（加總 = 1）。想調整偏好，改這裡即可。
WEIGHTS = {
    "momentum": 0.35,     # 熱度動能：HF trendingScore 的池內百分位
    "velocity": 0.25,     # 按讚速度：likes / 上架天數 的池內百分位
    "recency": 0.15,      # 新鮮度：exp(-天數 / 14)
    "originality": 0.15,  # 原創性：原創 > 微調 > 合併/Adapter > 量化轉檔
    "rarity": 0.10,       # 任務稀有度：今日榜單中該任務越少見分數越高
}
RECENCY_HALF_LIFE_DAYS = 14.0
ORIGINALITY = {"original": 1.0, "finetune": 0.45, "derived": 0.40, "merge": 0.35, "adapter": 0.35, "quantized": 0.0}
DERIVATIVE_LABEL = {
    "original": "原創",
    "finetune": "微調衍生",
    "derived": "衍生",
    "merge": "模型合併",
    "adapter": "LoRA / Adapter",
    "quantized": "量化 / 格式轉檔",
}
QUANT_TAGS = {"gguf", "awq", "gptq", "exl2", "exl3", "bnb-4bit", "4-bit", "8-bit", "2-bit", "3-bit", "int4", "int8", "nf4"}
QUANT_LIBS = {"gguf", "llama.cpp", "ctranslate2", "onnx", "openvino", "coreml"}
PERMISSIVE_LICENSES = {"apache-2.0", "mit", "bsd-3-clause", "bsd-2-clause", "bsd", "cc-by-4.0", "openrail", "unlicense"}
SAFETY_REMOVED_TAGS = {"abliterated", "uncensored", "heretic"}
# 顯示時略過的系統性標籤（不具資訊量）
NOISE_TAG_PREFIXES = ("region:", "endpoints_compatible", "text-generation-inference", "deploy:", "base_model:",
                      "license:", "arxiv:", "dataset:", "diffusers:", "autotrain_compatible", "eval-results",
                      "model-index", "custom_code", "safetensors", "conversational", "has_space", "doi:")

# pipeline_tag → (中文名稱, 模態群組)
TASKS: Dict[str, Tuple[str, str]] = {
    "text-generation": ("文字生成", "language"),
    "text2text-generation": ("文字轉換生成", "language"),
    "text-classification": ("文字分類", "language"),
    "token-classification": ("詞元標註 / NER", "language"),
    "question-answering": ("問答", "language"),
    "summarization": ("摘要", "language"),
    "translation": ("翻譯", "language"),
    "fill-mask": ("遮蔽填空", "language"),
    "zero-shot-classification": ("零樣本文字分類", "language"),
    "sentence-similarity": ("句子相似度 / 嵌入", "language"),
    "feature-extraction": ("特徵萃取 / 嵌入", "language"),
    "text-ranking": ("文字重排序", "language"),
    "table-question-answering": ("表格問答", "language"),
    "image-text-to-text": ("圖文理解（VLM）", "multimodal"),
    "video-text-to-text": ("影片理解", "multimodal"),
    "any-to-any": ("全模態", "multimodal"),
    "visual-question-answering": ("視覺問答", "multimodal"),
    "document-question-answering": ("文件問答", "multimodal"),
    "image-to-text": ("影像描述", "multimodal"),
    "zero-shot-image-classification": ("零樣本影像分類", "multimodal"),
    "zero-shot-object-detection": ("零樣本物件偵測", "multimodal"),
    "visual-document-retrieval": ("視覺文件檢索", "multimodal"),
    "image-classification": ("影像分類", "vision"),
    "object-detection": ("物件偵測", "vision"),
    "image-segmentation": ("影像分割", "vision"),
    "depth-estimation": ("深度估計", "vision"),
    "image-feature-extraction": ("影像特徵萃取", "vision"),
    "video-classification": ("影片分類", "vision"),
    "keypoint-detection": ("關鍵點偵測", "vision"),
    "mask-generation": ("遮罩生成", "vision"),
    "text-to-image": ("文生圖", "genmedia"),
    "image-to-image": ("圖生圖 / 影像編輯", "genmedia"),
    "unconditional-image-generation": ("無條件影像生成", "genmedia"),
    "text-to-video": ("文生影片", "genmedia"),
    "image-to-video": ("圖生影片", "genmedia"),
    "image-text-to-video": ("圖文生影片", "genmedia"),
    "video-to-video": ("影片轉換", "genmedia"),
    "text-to-3d": ("文生 3D", "genmedia"),
    "image-to-3d": ("圖生 3D", "genmedia"),
    "text-to-speech": ("語音合成（TTS）", "audio"),
    "text-to-audio": ("文生音訊 / 音樂", "audio"),
    "automatic-speech-recognition": ("語音辨識（ASR）", "audio"),
    "audio-to-audio": ("音訊轉換", "audio"),
    "audio-classification": ("音訊分類", "audio"),
    "voice-activity-detection": ("語音活動偵測", "audio"),
    "reinforcement-learning": ("強化學習", "decision"),
    "robotics": ("機器人", "decision"),
    "tabular-classification": ("表格分類", "decision"),
    "tabular-regression": ("表格迴歸", "decision"),
    "time-series-forecasting": ("時間序列預測", "decision"),
    "graph-ml": ("圖機器學習", "decision"),
}
GROUPS = {
    "language": "語言",
    "multimodal": "多模態",
    "vision": "電腦視覺",
    "genmedia": "影像 / 影音生成",
    "audio": "語音 / 音訊",
    "decision": "決策 / 科學",
    "other": "其他",
}


# ────────────────────────────── 網路層 ──────────────────────────────
class FetchError(RuntimeError):
    pass


def _ssl_context() -> ssl.SSLContext:
    """優先用 certifi 的 CA（python.org 版 Python 在 macOS 常缺憑證）。"""
    try:
        import certifi  # type: ignore
        return ssl.create_default_context(cafile=certifi.where())
    except Exception:
        return ssl.create_default_context()


def http_get_json(url: str, params: Optional[Dict[str, Any]] = None, token: Optional[str] = None,
                  retries: int = 3, timeout: float = 20.0) -> Any:
    """GET JSON，含指數退避重試、429 Retry-After、SSL 憑證問題的友善錯誤訊息。"""
    if params:
        url = f"{url}?{urllib.parse.urlencode(params, doseq=True)}"
    headers = {"User-Agent": USER_AGENT, "Accept": "application/json"}
    ctx = _ssl_context()
    last_err: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        req = urllib.request.Request(url, headers=headers)
        if token:  # 用 unredirected header：若遇到轉址，token 不會被送到其他網站
            req.add_unredirected_header("Authorization", f"Bearer {token}")
        try:
            with urllib.request.urlopen(req, timeout=timeout, context=ctx) as resp:
                raw = resp.read()
                return json.loads(raw.decode("utf-8"))
        except urllib.error.HTTPError as e:
            last_err = e
            if e.code == 429 or 500 <= e.code < 600:
                wait = float(e.headers.get("Retry-After", 0) or 0) or (2 ** attempt)
                log(f"  ⚠ HTTP {e.code}，{wait:.0f} 秒後重試（{attempt}/{retries}）")
                time.sleep(min(wait, 30))
                continue
            raise FetchError(f"HTTP {e.code} {e.reason}：{url}") from e
        except urllib.error.URLError as e:
            last_err = e
            reason = getattr(e, "reason", e)
            if isinstance(reason, ssl.SSLCertVerificationError) or "CERTIFICATE_VERIFY_FAILED" in str(reason):
                raise FetchError(
                    "SSL 憑證驗證失敗。macOS 上若使用 python.org 安裝的 Python，請執行一次\n"
                    "  /Applications/Python\\ 3.*/Install\\ Certificates.command\n"
                    "或 `pip3 install certifi` 後再試。") from e
            log(f"  ⚠ 網路錯誤：{reason}（{attempt}/{retries}）")
            time.sleep(2 ** attempt)
        except (json.JSONDecodeError, UnicodeDecodeError) as e:
            raise FetchError(f"回應不是合法 JSON：{url}") from e
        except TimeoutError as e:  # py3.10+ socket.timeout 為 TimeoutError 子類
            last_err = e
            log(f"  ⚠ 逾時（{attempt}/{retries}）")
            time.sleep(2 ** attempt)
    raise FetchError(f"重試 {retries} 次仍失敗：{url}（{last_err}）")


def fetch_trending_models(limit: int, token: Optional[str]) -> List[Dict[str, Any]]:
    """主來源：/api/models?sort=trendingScore（依熱度排序）。"""
    data = http_get_json(API_MODELS, {"sort": "trendingScore", "limit": limit}, token)
    if not isinstance(data, list):
        raise FetchError("/api/models 回傳格式非預期（應為 list）")
    return data


def fetch_trending_enrichment(limit: int, token: Optional[str]) -> Dict[str, Dict[str, Any]]:
    """輔助來源：/api/trending（多了參數量、作者資訊、推論供應商）。失敗不影響主流程。"""
    try:
        data = http_get_json(API_TRENDING, {"type": "model", "limit": min(limit, 100)}, token, retries=2)
    except FetchError as e:
        log(f"  ℹ 補充資料抓取失敗，略過（{e}）")
        return {}
    items = data.get("recentlyTrending", []) if isinstance(data, dict) else []
    out: Dict[str, Dict[str, Any]] = {}
    for it in items:
        rd = (it or {}).get("repoData") or {}
        if rd.get("id"):
            out[rd["id"]] = rd
    return out


# ────────────────────────────── 解析層 ──────────────────────────────
def parse_dt(s: Optional[str]) -> Optional[datetime]:
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except ValueError:
        return None


def classify_derivative(model_id: str, tags: List[str], library: str) -> Tuple[str, Optional[str]]:
    """回傳 (衍生類型, 基礎模型)。依 HF 的 base_model:<relation>:<repo> 標籤判定。"""
    base, relation = None, None
    for t in tags:
        if not t.startswith("base_model:"):
            continue
        parts = t.split(":", 2)
        if len(parts) == 3 and parts[1] in ("quantized", "finetune", "adapter", "merge"):
            if parts[2] != model_id:
                relation, base = parts[1], parts[2]
                if relation == "quantized":
                    break
        elif len(parts) == 2 and parts[1] != model_id and base is None:
            base, relation = parts[1], relation or "derived"
    lower = {t.lower() for t in tags}
    if relation == "quantized" or library.lower() in QUANT_LIBS or ("gguf" in lower):
        return "quantized", base
    if relation is None and (lower & {"awq", "gptq", "exl2", "exl3", "bnb-4bit"}):
        return "quantized", base
    return (relation or "original"), base


def extract_params_b(raw_num: Any, model_id: str) -> Optional[float]:
    """參數量（十億）。優先用 API 的 numParameters，否則從名稱推斷（如 27B、35B-A3B）。"""
    if isinstance(raw_num, (int, float)) and raw_num > 0:
        return round(raw_num / 1e9, 2)
    m = re.search(r"(?<![\d.])(\d+(?:\.\d+)?)\s*[bB](?![a-zA-Z])", model_id.split("/")[-1])
    if m:
        try:
            return float(m.group(1))
        except ValueError:
            return None
    return None


def active_params_b(model_id: str) -> Optional[float]:
    """MoE 的啟用參數（如 35B-A3B → 3）。"""
    m = re.search(r"[-_]A(\d+(?:\.\d+)?)B", model_id.split("/")[-1])
    return float(m.group(1)) if m else None


def display_tags(tags: List[str], pipeline: str, library: str, limit: int = 6) -> List[str]:
    out = []
    for t in tags:
        tl = t.lower()
        if any(tl.startswith(p) for p in NOISE_TAG_PREFIXES):
            continue
        if tl in (pipeline, library.lower()) or len(t) > 32 or re.fullmatch(r"[a-z]{2}", tl):
            continue  # 語言代碼（en/zh…）另行彙總
        if t not in out:
            out.append(t)
        if len(out) >= limit:
            break
    return out


def normalize(raw: Dict[str, Any], enrich: Dict[str, Any], now: datetime) -> Dict[str, Any]:
    mid = raw.get("id") or raw.get("modelId") or ""
    tags = [str(t) for t in (raw.get("tags") or [])]
    pipeline = (raw.get("pipeline_tag") or enrich.get("pipeline_tag") or "") or ""
    library = raw.get("library_name") or ""
    created = parse_dt(raw.get("createdAt"))
    age_days = max((now - created).total_seconds() / 86400, 0.0) if created else None
    likes = int(raw.get("likes") or enrich.get("likes") or 0)
    downloads = int(raw.get("downloads") or enrich.get("downloads") or 0)
    trending = float(raw.get("trendingScore") or 0)
    deriv, base = classify_derivative(mid, tags, library)
    task_zh, group = TASKS.get(pipeline, (pipeline or "未標註任務", "other"))
    licenses = [t.split(":", 1)[1] for t in tags if t.startswith("license:")]
    arxiv = [t.split(":", 1)[1] for t in tags if t.startswith("arxiv:")]
    langs = [t for t in tags if re.fullmatch(r"[a-z]{2}", t)]
    author_data = enrich.get("authorData") or {}
    params_b = extract_params_b(enrich.get("numParameters"), mid)
    lower = {t.lower() for t in tags}
    return {
        "id": mid,
        "author": raw.get("author") or enrich.get("author") or (mid.split("/")[0] if "/" in mid else ""),
        "author_fullname": author_data.get("fullname"),
        "author_followers": author_data.get("followerCount"),
        "name": mid.split("/")[-1],
        "url": f"https://huggingface.co/{mid}",  # 連結一律指向官方站
        "pipeline_tag": pipeline or None,
        "task_zh": task_zh,
        "task_group": group,
        "task_group_zh": GROUPS.get(group, "其他"),
        "library": library or None,
        "likes": likes,
        "downloads": downloads,
        "trending_score": trending,
        "created_at": raw.get("createdAt"),
        "last_modified": enrich.get("lastModified"),
        "age_days": round(age_days, 2) if age_days is not None else None,
        "like_velocity": round(likes / max(age_days or 0.5, 0.5), 1),
        "params_b": params_b,
        "active_params_b": active_params_b(mid),
        "is_moe": bool(lower & {"moe", "mixture-of-experts"}) or bool(re.search(r"[-_]A\d+(\.\d+)?B", mid)),
        "license": licenses[0] if licenses else None,
        "permissive_license": bool(licenses and licenses[0].lower() in PERMISSIVE_LICENSES),
        "arxiv": arxiv[:3],
        "languages": langs[:8],
        "n_languages": len(langs),
        "inference_providers": len(enrich.get("availableInferenceProviders") or []),
        "gated": bool(enrich.get("gated")) if enrich.get("gated") not in (None, False) else False,
        "derivative": deriv,
        "derivative_zh": DERIVATIVE_LABEL.get(deriv, deriv),
        "base_model": base,
        "safety_removed": bool(lower & SAFETY_REMOVED_TAGS),
        "on_device": bool(lower & {"on-device", "edge", "edge-ai", "edge-inference", "apple-silicon", "mobile"}),
        "tags": display_tags(tags, pipeline, library),
        "all_tags": tags,
    }


# ────────────────────────────── 評分層 ──────────────────────────────
def percentile_ranks(values: List[float]) -> List[float]:
    """平均名次百分位，值域 [0, 1]；對極端值穩健（比 min-max 更不怕洗版模型）。"""
    n = len(values)
    if n <= 1:
        return [1.0] * n
    order = sorted(range(n), key=lambda i: values[i])
    ranks = [0.0] * n
    i = 0
    while i < n:
        j = i
        while j + 1 < n and values[order[j + 1]] == values[order[i]]:
            j += 1
        avg = (i + j) / 2
        for k in range(i, j + 1):
            ranks[order[k]] = avg / (n - 1)
        i = j + 1
    return ranks


def score_models(models: List[Dict[str, Any]]) -> None:
    if not models:
        return
    mom = percentile_ranks([m["trending_score"] for m in models])
    vel = percentile_ranks([m["like_velocity"] for m in models])
    pool = [m for m in models if m["derivative"] != "quantized"] or models
    task_counts = Counter(m["pipeline_tag"] or "unknown" for m in pool)
    n_pool = len(pool)
    for m, p_mom, p_vel in zip(models, mom, vel):
        age = m["age_days"] if m["age_days"] is not None else 60.0
        share = task_counts.get(m["pipeline_tag"] or "unknown", 0) / n_pool
        parts = {
            "momentum": p_mom,
            "velocity": p_vel,
            "recency": math.exp(-age / RECENCY_HALF_LIFE_DAYS),
            "originality": ORIGINALITY.get(m["derivative"], 0.4),
            "rarity": 1.0 - share if m["pipeline_tag"] else 0.3,
        }
        m["score_breakdown"] = {k: round(v, 3) for k, v in parts.items()}
        m["score"] = round(100 * sum(WEIGHTS[k] * v for k, v in parts.items()), 1)
        m["_task_share"] = share


def build_reasons(m: Dict[str, Any], velocity_p80: float) -> List[str]:
    """把分數翻譯成人話：為什麼這個模型值得今天看一眼。"""
    r: List[Tuple[int, str]] = []  # (優先序, 文字)
    age = m["age_days"]
    if m.get("is_new_entry"):
        r.append((0, "🆕 今日新進榜"))
    elif (m.get("rank_change") or 0) >= 5:
        r.append((1, f"📈 排名上升 {m['rank_change']} 名"))
    if age is not None and age <= 7:
        when = f"{max(1, round(age * 24))} 小時前" if age < 1 else f"{round(age)} 天前"
        r.append((1, f"⏱️ {when}才發布"))
    if m["like_velocity"] >= velocity_p80 and m["like_velocity"] >= 10:
        r.append((2, f"🔥 平均每天 +{m['like_velocity']:,.0f} 讚"))
    if m["pipeline_tag"] and m.get("_task_share", 1) <= 0.08:
        r.append((2, f"🧭 今日榜單少見的任務：{m['task_zh']}"))
    if m["is_moe"]:
        act = f"（啟用 {m['active_params_b']:g}B）" if m.get("active_params_b") else ""
        r.append((3, f"🧩 MoE 混合專家架構{act}"))
    if m["params_b"]:
        if m["params_b"] <= 4:
            r.append((3, f"🪶 僅 {m['params_b']:g}B 參數，適合筆電／裝置端"))
        elif m["params_b"] >= 100:
            r.append((4, f"🏔️ {m['params_b']:g}B 大型模型"))
    if m["on_device"] and not (m["params_b"] and m["params_b"] <= 4):
        r.append((3, "📱 強調裝置端推論"))
    if m["arxiv"]:
        r.append((3, f"📄 附論文 arXiv:{m['arxiv'][0]}"))
    if m["n_languages"] >= 10:
        r.append((4, f"🌏 支援 {m['n_languages']} 種語言"))
    if m["permissive_license"]:
        r.append((5, f"✅ 寬鬆授權（{m['license']}）"))
    if m["derivative"] != "original" and m["base_model"]:
        verb = {"finetune": "微調自", "adapter": "LoRA 掛載於", "merge": "合併自", "quantized": "量化轉檔自",
                "derived": "衍生自"}.get(m["derivative"], "衍生自")
        r.append((6, f"🔗 {verb} {m['base_model']}"))
    if m["safety_removed"]:
        r.append((6, "⚠️ 已移除安全對齊（abliterated / uncensored）"))
    r.sort(key=lambda x: x[0])
    return [t for _, t in r[:5]]


def select_picks(models: List[Dict[str, Any]], top: int, max_per_author: int = 2, max_per_task: int = 3) -> List[str]:
    """多樣性感知精選（貪婪法）：
    - 硬排除：量化/格式轉檔（不是新模型）、已移除安全對齊的改造版。
    - 原創性已經是評分維度之一，所以其餘一律交給分數排序決定。
    - 同作者 ≤ max_per_author、同任務 ≤ max_per_task；不足 top 時才放寬上限補滿。
    """
    eligible = [m for m in sorted(models, key=lambda m: m["score"], reverse=True)
                if m["derivative"] != "quantized" and not m["safety_removed"]]
    picks: List[str] = []
    a_cnt: Counter = Counter()
    t_cnt: Counter = Counter()
    for relax in (False, True):
        for m in eligible:
            if len(picks) >= top:
                return picks
            if m["id"] in picks:
                continue
            if not relax and (a_cnt[m["author"]] >= max_per_author or t_cnt[m["pipeline_tag"]] >= max_per_task):
                continue
            picks.append(m["id"])
            a_cnt[m["author"]] += 1
            t_cnt[m["pipeline_tag"]] += 1
    return picks


# ────────────────────────────── 歷史比較 ──────────────────────────────
def load_previous(history_dir: Path, today: str) -> Optional[Dict[str, Any]]:
    if not history_dir.exists():
        return None
    files = sorted(p for p in history_dir.glob("*.json") if p.stem < today)
    for p in reversed(files):
        try:
            return json.loads(p.read_text(encoding="utf-8"))
        except Exception:
            continue
    return None


def apply_history(models: List[Dict[str, Any]], prev: Optional[Dict[str, Any]]) -> Optional[str]:
    if not prev:
        for m in models:
            m["is_new_entry"], m["rank_prev"], m["rank_change"] = False, None, None
        return None
    prev_rank = {pm["id"]: pm.get("rank_trending") for pm in prev.get("models", [])}
    for m in models:
        pr = prev_rank.get(m["id"])
        m["rank_prev"] = pr
        m["is_new_entry"] = pr is None
        m["rank_change"] = (pr - m["rank_trending"]) if pr else None
    return prev.get("snapshot_date")


def prune_history(history_dir: Path, keep: int) -> None:
    files = sorted(history_dir.glob("*.json"))
    for p in files[:-keep] if len(files) > keep else []:
        try:
            p.unlink()
        except OSError:
            pass


# ────────────────────────────── 輸出層 ──────────────────────────────
def atomic_write(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=str(path.parent), prefix=f".{path.name}.", suffix=".tmp")
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.chmod(tmp, 0o644)  # mkstemp 預設 600，改成一般檔案權限
        os.replace(tmp, path)
    except Exception:
        try:
            os.unlink(tmp)
        except OSError:
            pass
        raise


def log(msg: str) -> None:
    if not getattr(log, "quiet", False):
        print(msg, flush=True)


def run(limit: int = 60, top: int = 12, out_dir: Path = BASE_DIR, token: Optional[str] = None,
        enrich: bool = True, raw_file: Optional[Path] = None, keep_history: int = 60) -> Dict[str, Any]:
    """完整管線。可被 server.py 以 import 方式呼叫。"""
    t0 = time.time()
    now = datetime.now(timezone.utc)
    today = now.astimezone().strftime("%Y-%m-%d")

    log(f"① 抓取 Hugging Face 熱門模型（limit={limit}）…")
    if raw_file:
        raw = json.loads(Path(raw_file).read_text(encoding="utf-8"))
        extra: Dict[str, Dict[str, Any]] = {}
        source_note = f"本機檔案 {Path(raw_file).name}"
    else:
        raw = fetch_trending_models(limit, token)
        extra = fetch_trending_enrichment(limit, token) if enrich else {}
        source_note = "Hugging Face Hub API"
    log(f"   取得 {len(raw)} 筆（補充資料 {len(extra)} 筆）")
    if not raw:
        raise FetchError("API 回傳 0 筆模型（可能是暫時性異常），為避免覆蓋舊資料，本次不寫檔")

    seen, models = set(), []
    for i, r in enumerate(raw):
        if not isinstance(r, dict) or r.get("private"):
            continue
        m = normalize(r, extra.get(r.get("id", ""), {}), now)
        if not m["id"] or m["id"] in seen:
            continue
        seen.add(m["id"])
        m["rank_trending"] = len(models) + 1
        models.append(m)

    log("② 衛生過濾與評分…")
    score_models(models)
    history_dir = out_dir / "history"
    prev_date = apply_history(models, load_previous(history_dir, today))
    vel_sorted = sorted(m["like_velocity"] for m in models)
    p80 = vel_sorted[int(0.8 * (len(vel_sorted) - 1))] if vel_sorted else 0
    for m in models:
        m["reasons"] = build_reasons(m, p80)

    log("③ 多樣性精選…")
    picks = select_picks(models, top)
    pick_rank = {pid: i + 1 for i, pid in enumerate(picks)}
    for m in models:
        m["pick_rank"] = pick_rank.get(m["id"])
        m.pop("_task_share", None)
        m.pop("all_tags", None)

    deriv_counts = Counter(m["derivative"] for m in models)
    task_counts = Counter(m["task_zh"] for m in models if m["derivative"] != "quantized")
    group_counts = Counter(m["task_group"] for m in models if m["derivative"] != "quantized")
    payload = {
        "schema_version": 1,
        "generator": f"fetch_hf.py {__version__}",
        "snapshot_date": today,
        "generated_at": now.isoformat(timespec="seconds"),
        "generated_at_local": now.astimezone().strftime("%Y-%m-%d %H:%M"),
        "source": {"name": source_note, "endpoint": f"{API_MODELS}?sort=trendingScore&limit={limit}",
                   "enrichment": f"{API_TRENDING}?type=model" if extra else None},
        "previous_snapshot": prev_date,
        "method": {
            "weights": WEIGHTS,
            "recency_half_life_days": RECENCY_HALF_LIFE_DAYS,
            "originality": ORIGINALITY,
            "pick_rules": "排除量化轉檔與移除安全對齊版本；依分數貪婪挑選，同作者 ≤2、同任務 ≤3，不足時放寬",
        },
        "stats": {
            "fetched": len(raw),
            "models": len(models),
            "picks": len(picks),
            "derivatives": dict(deriv_counts),
            "quantized_hidden_by_default": deriv_counts.get("quantized", 0),
            "task_counts": dict(task_counts.most_common()),
            "group_counts": {GROUPS[k]: v for k, v in group_counts.most_common()},
            "elapsed_sec": round(time.time() - t0, 2),
        },
        "picks": picks,
        "models": models,
    }

    log("④ 寫入檔案…")
    text = json.dumps(payload, ensure_ascii=False, indent=1)
    atomic_write(out_dir / "daily_models.json", text)
    atomic_write(out_dir / "daily_models.js",
                 "/* 由 fetch_hf.py 自動產生，請勿手動編輯 */\nwindow.DAILY_MODELS = " + text + ";\n")
    atomic_write(history_dir / f"{today}.json", text)
    prune_history(history_dir, keep_history)
    return payload


def print_summary(payload: Dict[str, Any], n: int = 12) -> None:
    by_id = {m["id"]: m for m in payload["models"]}
    st = payload["stats"]
    print(f"\n✅ 完成：{st['models']} 個模型，精選 {st['picks']} 個"
          f"（隱藏 {st['quantized_hidden_by_default']} 個量化/轉檔版本），耗時 {st['elapsed_sec']} 秒")
    print(f"   任務分布：{', '.join(f'{k} {v}' for k, v in list(st['task_counts'].items())[:6])}")
    print("\n  #  分數  任務                作者 / 模型")
    for pid in payload["picks"][:n]:
        m = by_id[pid]
        print(f" {m['pick_rank']:>2}  {m['score']:>5.1f}  {m['task_zh'][:10]:<12}  {m['id']}")
    print("\n  → 用瀏覽器開啟 index.html 查看完整儀表板\n")


def main(argv: Optional[List[str]] = None) -> int:
    ap = argparse.ArgumentParser(description="抓取 Hugging Face 熱門模型並輸出 daily_models.json / .js")
    ap.add_argument("--limit", type=int, default=60, help="抓取筆數（預設 60，建議 30–100）")
    ap.add_argument("--top", type=int, default=12, help="今日精選數量（預設 12）")
    ap.add_argument("--out-dir", type=Path, default=BASE_DIR, help="輸出資料夾（預設為本檔所在資料夾）")
    ap.add_argument("--token", default=os.environ.get("HF_TOKEN"), help="HF access token（亦可用環境變數 HF_TOKEN）")
    ap.add_argument("--no-enrich", action="store_true", help="不呼叫 /api/trending 補充資料（更快）")
    ap.add_argument("--raw-file", type=Path, help="改從本機 JSON（/api/models 格式）重算，除錯用")
    ap.add_argument("--keep-history", type=int, default=60, help="history/ 保留天數（預設 60）")
    ap.add_argument("--quiet", action="store_true", help="只輸出錯誤")
    a = ap.parse_args(argv)
    log.quiet = a.quiet  # type: ignore[attr-defined]
    if not 1 <= a.limit <= 500:
        ap.error("--limit 需介於 1–500")
    try:
        payload = run(a.limit, a.top, a.out_dir.resolve(), a.token, not a.no_enrich, a.raw_file, a.keep_history)
    except FetchError as e:
        print(f"\n❌ 抓取失敗：{e}\n   舊的 daily_models.json 未被覆蓋，儀表板仍可顯示上一次的資料。", file=sys.stderr)
        return 2
    except KeyboardInterrupt:
        print("\n已中止", file=sys.stderr)
        return 130
    except Exception as e:  # 最後防線：不讓未知錯誤毀掉舊資料
        print(f"\n❌ 未預期錯誤：{type(e).__name__}: {e}", file=sys.stderr)
        return 1
    if not a.quiet:
        print_summary(payload)
    return 0


if __name__ == "__main__":
    sys.exit(main())
