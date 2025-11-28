import os
from flask import Flask, request, jsonify
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import numpy as np
import torch
from transformers import CLIPProcessor, CLIPModel
from bson import ObjectId

# Set the MONGODB_URI environment variable from previously defined value in the notebook
USER    = "juanyaca2006"
PASS    = "juanmanuel07"
CLUSTER = "cluster0.yio9o9m.mongodb.net"
DBNAME  = "multimodal_rag"
APPNAME = "colab-demo"

# URL-encode the password
from urllib.parse import quote_plus
PASS_ENCODED = quote_plus(PASS)

# Construct the MONGODB_URI
MONGODB_URI_VALUE = f"mongodb+srv://{USER}:{PASS_ENCODED}@{CLUSTER}/{DBNAME}?retryWrites=true&w=majority&appName={APPNAME}"
os.environ["MONGODB_URI"] = MONGODB_URI_VALUE


# 2. Initialize the Flask application
app = Flask(__name__)

# 3. Retrieve the MONGODB_URI from environment variables
MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise ValueError("MONGODB_URI environment variable not set.")

# 4. Create a MongoClient instance
client = MongoClient(MONGODB_URI)

# 5. Access the multimodal_rag database and its media collection
db_multimodal = client["multimodal_rag"]
coll_images_ref = db_multimodal["media"]

# 6. Access the Hotel database and its resenas and hotel collections
db_hotel = client["CarrosAtlas"] # Assuming 'CarrosAtlas' is the 'Hotel' DB as per previous notebook cells
coll_resenas = db_hotel["resenas"]
coll_hotels = db_hotel["hotel"]

# 7. Print a confirmation message
print("✅ Flask app initialized.")
print(f"✅ MongoDB connections established: 'multimodal_rag' (collection: '{coll_images_ref.name}'), 'CarrosAtlas' (collections: '{coll_resenas.name}', '{coll_hotels.name}')")

# 8. Determine the appropriate device for model execution
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "openai/clip-vit-base-patch32"

# 9. Load the CLIP model and processor
clip_model = CLIPModel.from_pretrained(model_name).to(device)
clip_proc = CLIPProcessor.from_pretrained(model_name)

# 10. Define the embed_images_clip function
def embed_images_clip(pil_images):
    """Retorna embeddings (N, 512) normalizados (np.float32)."""
    inputs = clip_proc(images=pil_images, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(device)
    with torch.no_grad():
        img_emb = clip_model.get_image_features(pixel_values=pixel_values)
    img_emb = img_emb / img_emb.norm(p=2, dim=-1, keepdim=True)
    return img_emb.cpu().numpy().astype("float32")

# 11. Define the embed_texts_clip function
def embed_texts_clip(texts):
    """Retorna embeddings (N, 512) normalizados (np.float32)."""
    inputs = clip_proc(text=texts, return_tensors="pt", padding=True)
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    with torch.no_grad():
        txt_emb = clip_model.get_text_features(input_ids=input_ids, attention_mask=attention_mask)
    txt_emb = txt_emb / txt_emb.norm(p=2, dim=-1, keepdim=True)
    return txt_emb.cpu().numpy().astype("float32")

# 12. Print a confirmation message that the CLIP model has been loaded
print(f"✅ CLIP model loaded: {model_name} | device: {device}")

# 13. Store the embedding functions in a dictionary
embedding_functions = {
    "image": embed_images_clip,
    "text": embed_texts_clip
}