from __future__ import annotations

from functools import lru_cache
from typing import Literal
import os

import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from numpy import load
from pydantic import BaseModel, Field
from scipy.sparse import load_npz

from content_based_filtering import content_recommendation
from hybrid_recommendations import HybridRecommenderSystem


class RecommendationRequest(BaseModel):
    song_name: str = Field(..., min_length=1)
    artist_name: str = Field(..., min_length=1)
    k: int = Field(10, ge=1, le=50)
    mode: Literal["hybrid", "content"] = "hybrid"
    diversity: int = Field(5, ge=1, le=9)


@lru_cache(maxsize=1)
def load_assets():
    songs_data = pd.read_csv("data/cleaned_data.csv")
    filtered_data = pd.read_csv("data/collab_filtered_data.csv")
    transformed_data = load_npz("data/transformed_data.npz")
    transformed_hybrid_data = load_npz("data/transformed_hybrid_data.npz")
    track_ids = load("data/track_ids.npy", allow_pickle=True)
    interaction_matrix = load_npz("data/interaction_matrix.npz")

    return {
        "songs_data": songs_data,
        "filtered_data": filtered_data,
        "transformed_data": transformed_data,
        "transformed_hybrid_data": transformed_hybrid_data,
        "track_ids": track_ids,
        "interaction_matrix": interaction_matrix,
    }


def normalize_name(value: str) -> str:
    return value.strip().lower()


def get_assets():
    try:
        return load_assets()
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Missing data file: {exc.filename}",
        ) from exc


app = FastAPI(title="Spotify Hybrid Recommender API")

cors_origins = os.getenv("CORS_ALLOW_ORIGINS", "http://localhost:5173")
allowed_origins = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]
if not allowed_origins:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "ok"}


@app.post("/recommendations")
def recommendations(request: RecommendationRequest):
    assets = get_assets()

    song_name = normalize_name(request.song_name)
    artist_name = normalize_name(request.artist_name)

    if request.mode == "content":
        songs_data = assets["songs_data"]
        if not ((songs_data["name"] == song_name) & (songs_data["artist"] == artist_name)).any():
            raise HTTPException(status_code=404, detail="Song not found in content index")

        recs = content_recommendation(
            song_name=song_name,
            artist_name=artist_name,
            songs_data=songs_data,
            transformed_data=assets["transformed_data"],
            k=request.k,
        )

        recs = (
            recs.merge(
                songs_data,
                on=["name", "artist", "spotify_preview_url"],
                how="left",
            )
            .drop_duplicates()
            .reset_index(drop=True)
        )
    else:
        filtered_data = assets["filtered_data"]
        if not (
            (filtered_data["name"] == song_name)
            & (filtered_data["artist"] == artist_name)
        ).any():
            raise HTTPException(status_code=404, detail="Song not found in hybrid index")

        weight_content_based = 1 - (request.diversity / 10)
        recommender = HybridRecommenderSystem(
            number_of_recommendations=request.k,
            weight_content_based=weight_content_based,
        )
        recs = recommender.give_recommendations(
            song_name=song_name,
            artist_name=artist_name,
            songs_data=filtered_data,
            transformed_matrix=assets["transformed_hybrid_data"],
            track_ids=assets["track_ids"],
            interaction_matrix=assets["interaction_matrix"],
        )

    return recs.fillna("").to_dict(orient="records")
