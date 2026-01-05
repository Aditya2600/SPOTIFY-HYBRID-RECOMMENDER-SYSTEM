# 🎧 Spotify Hybrid Recommender System

A full-stack hybrid recommender system that combines **content-based filtering** and **collaborative filtering** to suggest songs aligned with user preferences. Built with Python and Streamlit, integrated with AWS for scalable deployment and dynamic data access.

---

## 🚀 Features

- 🎵 **Collaborative Filtering**: Uses user listening history and cosine similarity on sparse matrices.
- 🧠 **Content-Based Filtering**: Leverages metadata like artist, genre, tempo, and more.
- 🔄 **Hybrid Mode**: Combines both methods for balanced and accurate recommendations.
- ☁️ **Cloud Deployment** — Deployed on Streamlit Cloud and AWS EC2 using a CI/CD pipeline.


---

## 🖼️ Demo

🔗 **Live App**: [Streamlit App](https://aditya2600-spotify-hybrid-recommender-system-app-nw68nq.streamlit.app)


---
## 🎛️ Frontend Demo (React)

![Frontend Demo](assets/demo_ui.png)


---

## 🛠️ Tech Stack

| Tool                | Purpose                             |
|---------------------|-------------------------------------|
| Python              | Core development language           |
| Pandas, NumPy       | Data processing & manipulation      |
| Scikit-learn, SciPy | Similarity calculations             |
| Dask                | Parallel computation on large data  |
| Streamlit           | Web UI                              |
| AWS EC2/S3/ECR      | Deployment, storage, and images     |
| Docker              | Containerization                    |
| GitHub Actions      | CI/CD automation                    |

---

## 📁 Project Structure

```
spotify-hybrid-recommender-system/
│
├── app.py                         # Streamlit entry point
├── collaborative.py               # Collaborative filtering logic
├── content_based.py               # Content-based filtering logic
├── hybrid.py                      # Hybrid recommender
├── data/
│   ├── transformed_data.npz       # Collaborative sparse matrix
│   ├── track_ids.npy              # Index-to-ID mapping
│   ├── collab_filtered_data.csv  # Metadata for content-based filtering
├── utils/
│   ├── preprocessing.py           # Data cleaning functions
│   └── aws_utils.py               # S3 integration
├── deploy/
│   └── scripts/                   # EC2 Docker startup and setup
├── notebooks/                     # EDA and model tuning
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

### ✅ Sample inputs (Streamlit)
Use these exact lowercase values to test the app locally:

- `mr. brightside` — `the killers`
- `wonderwall` — `oasis`
- `come as you are` — `nirvana`
- `take me out` — `franz ferdinand`
- `creep` — `radiohead`

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

---
---

🖥️ **Streamlit UI Preview**

### 🎛️ User Input Interface

Users can enter a song name and artist name, choose the number of recommendations, and select the diversity level for hybrid mode.

![User Input Interface](assets/user_input_screenshot.png)

---

### 🎧 Recommendation Output

After clicking “Get Recommendations”, the app displays:

- 🎵 Currently Playing song  
- 🎶 Next Up tracks with audio previews  
- 📊 A diversity breakdown bar chart  

![Recommendation Output](assets/recommendation_output_screenshot.png)

---

These UI snapshots demonstrate real-time interaction and personalized music recommendations using content-based or hybrid logic.

---
## Free Deployment (Render + Vercel)

This repo includes config files for a free-tier setup:
- Render API: `render.yaml`
- Vercel frontend: `vercel.json`

### Render (API)
1. Create a new Render Blueprint from this repo.
2. Once deployed, copy the API URL (example: `https://your-service.onrender.com`).
3. In Render, set `CORS_ALLOW_ORIGINS` to your frontend URL.

### Vercel (Frontend)
1. Import the repo in Vercel (it reads `vercel.json`).
2. If prompted for a root directory, set it to `frontend`.
3. Add `VITE_API_URL` and set it to your Render API URL.

---
## ☁️ Deployment Overview

This project is deployed using a fully automated CI/CD pipeline on AWS. The infrastructure and flow include:

- 🚀 **CI/CD via GitHub Actions** – Automates build, test, and deployment steps.
- 📦 **Dockerized Application** – The app is containerized using Docker for consistency across environments.
- 🐳 **Amazon ECR (Elastic Container Registry)** – Stores and manages the Docker image.
- 📁 **Amazon S3** – Hosts the deployment bundle (`appspec.yml`, shell scripts, etc.) used by CodeDeploy.
- 🤖 **AWS CodeDeploy** – Handles the automated deployment process to the EC2 instance.
- 💻 **EC2 Instance (Ubuntu)** – Runs the production-ready Streamlit app.

> 💡 The deployment is production-grade, enabling seamless updates with each `git push`.

---
## ☁️ Deployment Snapshots

<p align="center">
  <img src="assets/deployment-complete.png" width="600" alt="CodeDeploy Success"/>
  <img src="assets/streamlit-on-ec2.png" width="600" alt="App Running on EC2"/>
</p>

### ✅ CI/CD Log Snapshot

<p align="center">
  <img src="assets/github-actions-success.png" width="600" alt="CI/CD Success"/>
</p>

---

## 🪣 S3 Bucket Configuration

This project uses an S3 bucket to store deployment artifacts like deployment.zip used in AWS CodeDeploy.
![S3 bucket](assets/S3_bucket.png)

## 🐳 Amazon ECR – Docker Image

This project uses Amazon Elastic Container Registry (ECR) to store and manage Docker images for deployment on EC2 via AWS CodeDeploy.
![ECR Image pushed](assets/ECR_Image_pushed.png)

## 🔐 IAM Roles Overview

To enable secure and automated deployment of the Spotify Hybrid Recommender System on AWS, the following IAM roles were configured:

![IAM Roles Summary](assets/iam-roles-summary.png)

### Key Roles

- **codedeploy-service-role**: Grants AWS CodeDeploy permission to manage deployments across EC2 instances and interact with Auto Scaling.
- **ec2_codedeploy_role**: Allows EC2 instances to access S3 buckets and pull application bundles during deployment.
- **ec2_ecr_role3**: Grants EC2 permission to pull Docker images from Amazon ECR securely.
- **AWSServiceRoleForAutoScaling**: Auto-assigned role to manage Auto Scaling operations during blue/green deployments.
- **AWSServiceRoleForElasticLoadBalancing**: Used for managing load balancer configurations.
- **AWSServiceRoleForSupport / TrustedAdvisor**: Default AWS service-linked roles that enhance infrastructure monitoring.

> 🔒 These roles ensure that deployment workflows via GitHub Actions, CodeDeploy, and Docker containers on EC2 operate securely and with least-privilege access.
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
