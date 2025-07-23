# 🎧 Spotify Hybrid Recommender System

A full-fledged hybrid recommender system that combines **content-based filtering** and **collaborative filtering** techniques to recommend songs similar to the user's taste. Built with Python, deployed on Streamlit, and integrated with AWS S3 for dynamic data loading.

---

## 🚀 Features

- 🎵 **Collaborative Filtering**: Uses user listening history and cosine similarity on sparse matrices.
- 🧠 **Content-Based Filtering**: Leverages metadata like artist, genre, tempo, and more.
- 🔄 **Hybrid Mode**: Combines both methods for balanced and accurate recommendations.
- 🌐 **Deployed on Streamlit Cloud**: Interactive web app with clean UI.


---

## 🖼️ Demo

🔗 **Live App**: [Streamlit App](https://aditya2600-spotify-hybrid-recommender-system-app-nw68nq.streamlit.app)



---

## 🛠️ Tech Stack

| Tool             | Usage                          |
|------------------|--------------------------------|
| Python           | Core logic                     |
| Pandas, NumPy    | Data wrangling                 |
| SciPy, Scikit-learn | Similarity & model computation |
| Streamlit        | Frontend deployment            |
| Dask             | Scalable large CSV processing  |
| Matplotlib/Seaborn | Data visualization (EDA)     |

---

## 📁 Project Structure

```
spotify-hybrid-recommender-system/
│
├── app.py                  # Streamlit app entry point
├── collaborative.py        # Collaborative filtering logic
├── content_based.py        # Content-based recommendation logic
├── hybrid.py               # Combined recommender system
├── data/
│   ├── transformed_data.npz       # Sparse matrix (collaborative)
│   ├── track_ids.npy              # Index mapping
│   ├── collab_filtered_data.csv  # Track metadata (content-based)
│   └── … (other datasets)
├── utils/
│   ├── preprocessing.py    # Preprocessing utilities
│   └── aws_utils.py        # S3 file fetching
├── requirements.txt
└── README.md
```
---

## 📦 Installation & Running Locally


### 1. Clone the repository
```bash
git clone https://github.com/Aditya2600/SPOTIFY-HYBRID-RECOMMENDER-SYSTEM
cd spotify-hybrid-recommender-system
```


### 3. Install dependencies
```bash
pip install -r requirements.txt
```


### 5. Run Streamlit app
```bash
streamlit run app.py
```

⸻

## 🔍 Datasets Used
	•	User Listening History.csv: User-song interaction dataset.
	•	collab_filtered_data.csv: Final dataset for content-based filtering.
	•	transformed_data.npz: Sparse matrix from collaborative filtering.
	•	track_ids.npy: Index to song ID mapping.



⸻

## 🧪 Recommender Modes


### 1. 🎯 Content-Based

Uses song metadata like tempo, genre, duration, mode, etc.

from content_based import get_content_recommendations
recommendations = get_content_recommendations(song_title)

### 2. 🤝 Collaborative Filtering

Based on user behavior similarity using cosine similarity on sparse matrix.

from collaborative import get_collab_recommendations
recommendations = get_collab_recommendations(song_title)

### 3. 🔁 Hybrid

Combines both approaches with custom weights.

from hybrid import get_hybrid_recommendations
recommendations = get_hybrid_recommendations(song_title)








⸻

🧾 Credits
	•	Kaggle Million Song Dataset
	•	Scikit-learn & SciPy community
	•	Streamlit Cloud for deployment

⸻

📄 License

This project is licensed under the MIT License.

⸻

🙋‍♂️ Author

Aditya Meshram
🎓 B.Tech IT | NIT Raipur


⸻


