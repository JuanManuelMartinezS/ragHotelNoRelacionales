import os
from flask import Flask, request, jsonify
from pymongo import MongoClient
from PIL import Image
from io import BytesIO
import numpy as np
import torch
from transformers import CLIPProcessor, CLIPModel, CLIPTokenizer, CLIPModel
from bson import ObjectId
import gridfs
from urllib.parse import quote_plus
from groq import Groq
from dotenv import load_dotenv
import os
from sklearn.metrics.pairwise import cosine_similarity
import time

load_dotenv()

# Configuration
GROQ_KEY = os.environ.get("GROQ_API_KEY")
groq_client = Groq(api_key=GROQ_KEY)
# Configuration
USER = "juanyaca2006_db_user"
PASS = "juanmanuel07"
CLUSTER = "cluster0.563va5d.mongodb.net"  # ❌ QUITA el @ del inicio
DBNAME = "Hotel"
APPNAME = "Cluster0"

# URL-encode the password
PASS_ENCODED = quote_plus(PASS)

# Construct the MONGODB_URI - USA ESTA LÍNEA
MONGODB_URI = f"mongodb+srv://{USER}:{PASS_ENCODED}@{CLUSTER}/?retryWrites=true&w=majority&appName={APPNAME}"

# Initialize Flask app
app = Flask(__name__)

# MongoDB connections
client = MongoClient(MONGODB_URI)
db_multimodal = client["multimodal_rag"]
coll_images_ref = db_multimodal["media"]

db_hotel = client["Hotel"]
coll_resenas = db_hotel["resena"]
coll_hotels = db_hotel["hotel"]

# Initialize GridFS
fs = gridfs.GridFS(db_multimodal)

print("✅ Flask app initialized.")
print(f"✅ MongoDB connections established: 'multimodal_rag' (collection: '{coll_images_ref.name}'), 'CarrosAtlas' (collections: '{coll_resenas.name}', '{coll_hotels.name}')")

# Load CLIP model
device = "cuda" if torch.cuda.is_available() else "cpu"
model_name = "openai/clip-vit-base-patch32"

clip_model = CLIPModel.from_pretrained(model_name).to(device)
clip_proc = CLIPProcessor.from_pretrained(model_name)

print(f"✅ CLIP model loaded: {model_name} | device: {device}")

# Embedding functions
def embed_images_clip(pil_images):
    """Returns normalized embeddings (N, 512) as np.float32."""
    inputs = clip_proc(images=pil_images, return_tensors="pt")
    pixel_values = inputs["pixel_values"].to(device)
    with torch.no_grad():
        img_emb = clip_model.get_image_features(pixel_values=pixel_values)
    img_emb = img_emb / img_emb.norm(p=2, dim=-1, keepdim=True)
    return img_emb.cpu().numpy().astype("float32")

def embed_texts_clip(texts):
    """Returns normalized embeddings (N, 512) as np.float32."""
    inputs = clip_proc(text=texts, return_tensors="pt", padding=True)
    input_ids = inputs["input_ids"].to(device)
    attention_mask = inputs["attention_mask"].to(device)
    with torch.no_grad():
        txt_emb = clip_model.get_text_features(input_ids=input_ids, attention_mask=attention_mask)
    txt_emb = txt_emb / txt_emb.norm(p=2, dim=-1, keepdim=True)
    return txt_emb.cpu().numpy().astype("float32")

# Vector search helper
def vector_search_helper(
    collection,
    embedding_field,
    query_embedding,
    k=5,
    filters=None,
    search_index="vector_index",
    use_native_vector_search=True
):
    """
    Constructs and executes a MongoDB aggregation pipeline for vector searches.
    """
    pipeline = []

    if use_native_vector_search:
        vector_search_stage = {
            "$vectorSearch": {
                "index": search_index,
                "path": embedding_field,
                "queryVector": query_embedding,
                "numCandidates": 200,
                "limit": k,
                "similarity": "cosine"
            }
        }
        pipeline.append(vector_search_stage)
        pipeline.append({"$addFields": {"score": {"$meta": "vectorSearchScore"}}})

        if filters:
            processed_filters = {}
            for key, value in filters.items():
                if key == "tags":
                    processed_filters[key] = {"$in": value if isinstance(value, list) else [value]}
                else:
                    processed_filters[key] = value
            pipeline.append({"$match": processed_filters})
    else:
        search_stage = {
            "$search": {
                "index": search_index,
                "knnBeta": {
                    "path": embedding_field,
                    "vector": query_embedding,
                    "k": k
                }
            }
        }
        if filters:
            must_clauses = []
            for key, value in filters.items():
                if key == "tags":
                    if isinstance(value, list):
                        must_clauses.extend([{"equals": {"path": key, "value": v}} for v in value])
                    else:
                        must_clauses.append({"equals": {"path": key, "value": value}})
                else:
                    must_clauses.append({"equals": {"path": key, "value": value}})
            search_stage["$search"]["filter"] = {"must": must_clauses}
        pipeline.append(search_stage)
        pipeline.append({"$addFields": {"score": {"$meta": "searchScore"}}})

    pipeline.append({
        "$project": {
            "_id": 1,
            "title": 1,
            "category": 1,
            "tags": 1,
            "caption": 1,
            "image_file_id": 1,
            "hotel_id": 1,
            "comentario": 1,
            "score": 1
        }
    })
    pipeline.append({"$limit": k})

    return list(collection.aggregate(pipeline))

print("✅ Vector search helper function defined.")

# Generic query function
def execute_query(database_name, collection_name, query={}, projection=None, limit=0, username=None, password=None):
    """
    Execute a generic MongoDB query.
    
    Args:
        database_name (str): Name of the database
        collection_name (str): Name of the collection
        query (dict): MongoDB query filter (default: {} for all documents)
        projection (dict): Fields to include/exclude (default: None for all fields)
        limit (int): Maximum number of documents to return (default: 0 for no limit)
        username (str): Optional MongoDB username (uses global client if not provided)
        password (str): Optional MongoDB password (required if username is provided)
    
    Returns:
        list: List of documents matching the query
    
    Example:
        # Using global credentials
        results = execute_query("Hotel", "hotel")
        
        # Using custom credentials
        results = execute_query("Hotel", "hotel", {}, None, 0, "myuser", "mypass")
        
        # Get specific hotel by name
        results = execute_query("Hotel", "hotel", {"name": "Hotel Example"})
        
        # Get reviews with projection and limit
        results = execute_query("Hotel", "resena", 
                               {"rating": {"$gte": 4}}, 
                               {"comentario": 1, "rating": 1}, 
                               limit=10)
    """
    try:
        # Use custom credentials if provided
        if username and password:
            password_encoded = quote_plus(password)
            custom_uri = f"mongodb+srv://{username}:{password_encoded}@{CLUSTER}/?retryWrites=true&w=majority&appName={APPNAME}"
            custom_client = MongoClient(custom_uri)
            db = custom_client[database_name]
        else:
            # Use global client with default credentials
            db = client[database_name]
        
        collection = db[collection_name]
        
        if projection:
            cursor = collection.find(query, projection)
        else:
            cursor = collection.find(query)
        
        if limit > 0:
            cursor = cursor.limit(limit)
        
        results = list(cursor)
        
        # Close custom client if it was created
        if username and password:
            custom_client.close()
        
        return results
    except Exception as e:
        print(f"❌ Error executing query: {e}")
        return []

print("✅ Generic query function defined.")

# Helper function to get hotel name
def get_hotel_name_from_id(hotel_id_val):
    if not hotel_id_val:
        return "N/A"
    
    try:
        hotel_doc = coll_hotels.find_one({"_id": ObjectId(hotel_id_val)}, {"name": 1})
        if hotel_doc:
            return hotel_doc.get("name", "Unknown Hotel")
    except:
        pass

    hotel_doc = coll_hotels.find_one({"hotel_id": hotel_id_val}, {"name": 1})
    if hotel_doc:
        return hotel_doc.get("name", "Unknown Hotel")
        
    return "Unknown Hotel"

# ===== REVIEW SEARCH ENDPOINTS =====


@app.route('/api/reviews/search/by-text', methods=['POST'])
def search_reviews_by_text():
    # Obtener datos del body
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Request body is required."}), 400
    
    query_text = data.get('query', '')
    min_score = float(data.get('min_score', 0.5))  # Umbral de similitud
    k = int(data.get('k', 4))  # Buscar más para compensar duplicados
    
    print(f"\n🔍 [REVIEW SEARCH] Query text: '{query_text}'")
    print(f"   - Min score threshold: {min_score}")
    print(f"   - K (before dedup): {k}")
    
    if not query_text:
        return jsonify({"error": "Query text is required in body."}), 400

    # Generate embedding
    print(f"🧠 Generating embedding for query...")
    query_embedding = embed_texts_clip([query_text])[0].tolist()
    print(f"✅ Embedding generated: shape={len(query_embedding)}, sample={query_embedding[:5]}")
    
    # Perform vector search
    print(f"🔎 Searching in collection: {coll_resenas.name}")
    print(f"   - Field: comentario_embedding")
    print(f"   - K: {k}")
    
    try:
        # 🔍 Verificar qué índice existe en MongoDB Atlas
        print(f"🔎 Intentando búsqueda con índice 'vector_index_1'...")
        
        results = vector_search_helper(
            collection=coll_resenas,
            embedding_field="comentario_embedding",
            query_embedding=query_embedding,
            k=k,
            search_index="vector_index"  # 🔥 Asegúrate que este nombre coincida
        )
        print(f"📊 Vector search returned {len(results)} documents")
        
        if not results:
            print("⚠️  No results found from vector search")
            doc_count = coll_resenas.count_documents({})
            print(f"ℹ️  Total documents in collection: {doc_count}")
            
            sample_doc = coll_resenas.find_one({"comentario_embedding": {"$exists": True}})
            if sample_doc:
                print(f"✅ Found document with comentario_embedding field")
            else:
                print(f"❌ No documents found with 'comentario_embedding' field")
            
            return jsonify([])
    
    except Exception as e:
        print(f"❌ Error during vector search: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Search failed: {str(e)}"}), 500

    # Process results: remove duplicates and filter by score
    seen_comments = set()
    unique_results = []
    
    for doc in results:
        comentario = doc.get('comentario')
        score = doc.get('score', 0)
        
        # Skip if no comment or below threshold
        if not comentario or score < min_score:
            continue
        
        # Skip duplicates (normalize text for comparison)
        comentario_normalized = comentario.strip().lower()
        if comentario_normalized in seen_comments:
            print(f"⚠️  Skipping duplicate comment (score: {score:.3f})")
            continue
        
        seen_comments.add(comentario_normalized)
        
        # Get hotel name if hotel_id exists
        hotel_name = "Unknown Hotel"
        if doc.get('hotel_id'):
            hotel_name = get_hotel_name_from_id(doc.get('hotel_id'))
        
        unique_results.append({
            "comentario": comentario,
            "score": round(score, 4),
            "hotel_name": hotel_name,
            "hotel_id": str(doc.get('hotel_id', '')),
            "_id": str(doc.get('_id', ''))
        })
    
    print(f"💬 Extracted {len(unique_results)} unique comments from {len(results)} results")
    print(f"   - Duplicates removed: {len(results) - len(unique_results)}")
    print(f"   - Score range: {min([r['score'] for r in unique_results]) if unique_results else 0:.3f} - {max([r['score'] for r in unique_results]) if unique_results else 0:.3f}")
    
    # Limit to top 10 unique results
    unique_results = unique_results[:10]
    
    return jsonify(unique_results)
@app.route('/api/reviews/search/by-text/<hotel_id>', methods=['GET'])
def search_reviews_by_text_and_hotel(hotel_id):
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    filters = {"hotel_id": hotel_id}

    results = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )

    comments = [doc.get('comentario') for doc in results if doc.get('comentario')]
    return jsonify(comments)

@app.route('/api/reviews/search/by-image', methods=['POST'])
def search_reviews_by_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400
    
    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    results = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10
    )

    comments = [doc.get('comentario') for doc in results if doc.get('comentario')]
    return jsonify(comments)

@app.route('/api/reviews/search/by-image/<hotel_id>', methods=['POST'])
def search_reviews_by_image_and_hotel(hotel_id):
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    filters = {"hotel_id": hotel_id}

    results = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )

    comments = [doc.get('comentario') for doc in results if doc.get('comentario')]
    return jsonify(comments)


print("✅ Generic query API endpoint defined.")
print("✅ CRUD endpoints (insert, update, delete) defined.")

# ===== HOTEL IMAGE SEARCH ENDPOINTS =====

@app.route('/api/hotels/search/by-text', methods=['GET'])
def search_hotels_by_text():
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    
    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10
    )

    processed_results = []
    for img_doc in image_results:
        hotel_id_from_image = img_doc.get("hotel_id")
        hotel_name = get_hotel_name_from_id(hotel_id_from_image)
        
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_from_image) if hotel_id_from_image else None,
            "hotel_name": hotel_name
        })
        
    return jsonify(processed_results)

@app.route('/api/hotels/search/by-text/<hotel_id_param>', methods=['GET'])
def search_hotels_by_text_and_hotel(hotel_id_param):
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    filters = {"hotel_id": hotel_id_param}

    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )

    hotel_name = get_hotel_name_from_id(hotel_id_param)

    processed_results = []
    for img_doc in image_results:
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_param) if hotel_id_param else None,
            "hotel_name": hotel_name
        })
        
    return jsonify(processed_results)

@app.route('/api/hotels/search/by-image', methods=['POST'])
def search_hotels_by_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    
    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10
    )

    processed_results = []
    for img_doc in image_results:
        hotel_id_from_image = img_doc.get("hotel_id")
        hotel_name = get_hotel_name_from_id(hotel_id_from_image)
        
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_from_image) if hotel_id_from_image else None,
            "hotel_name": hotel_name
        })

    return jsonify(processed_results)

@app.route('/api/hotels/search/by-image/<hotel_id_param>', methods=['POST'])
def search_hotels_by_image_and_hotel(hotel_id_param):
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided."}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file."}), 400

    try:
        img = Image.open(BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image file: {e}"}), 400

    query_embedding = embed_images_clip([img])[0].tolist()
    filters = {"hotel_id": hotel_id_param}

    image_results = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10,
        filters=filters
    )
    
    hotel_name = get_hotel_name_from_id(hotel_id_param)

    processed_results = []
    for img_doc in image_results:
        processed_results.append({
            "image_title": img_doc.get("title"),
            "image_category": img_doc.get("category"),
            "image_tags": img_doc.get("tags"),
            "image_caption": img_doc.get("caption"),
            "search_score": img_doc.get("score"),
            "hotel_id": str(hotel_id_param) if hotel_id_param else None,
            "hotel_name": hotel_name
        })

    return jsonify(processed_results)


# =========================================================
# =============== LLM 01/12/25 ============================
# =========================================================

# =========================================================
#  ============ Endpoint RAG por texto ====================
# =========================================================
clip_tokenizer = CLIPTokenizer.from_pretrained("openai/clip-vit-base-patch32")
clip_model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")

def clip_truncate_text(text, max_tokens=75):
    # Tokenizamos para saber cuántos tokens tiene
    tokens = clip_tokenizer(
        text,
        truncation=True,
        max_length=max_tokens,
        return_tensors="pt",
        add_special_tokens=True
    )

    # Reconstruimos el texto truncado a partir de los tokens
    ids = tokens["input_ids"][0]
    trunc_text = clip_tokenizer.decode(ids, skip_special_tokens=True)

    return trunc_text
def precision_score_rag(response_text, docs):
    # Truncado real por tokens
    textos_docs = [clip_truncate_text(doc.get("comentario", "")) for doc in docs]
    resp_truncada = clip_truncate_text(response_text)

    textos = textos_docs + [resp_truncada]

    embeddings = embed_texts_clip(textos)

    emb_docs = embeddings[:-1]
    emb_resp = embeddings[-1].reshape(1, -1)

    similitudes = cosine_similarity(emb_docs, emb_resp).flatten()

    return float(similitudes.mean())


# Crea un pipeline de HuggingFace para generación

def generate_rag_response_groq(query_text, docs):
    """
    Genera respuesta usando Groq Llama-3.1.
    """
    cuerpo_docs = "\n".join(
        [f"{i+1}. {doc.get('comentario', '')}" for i, doc in enumerate(docs)]
    )

    prompt = f"""
    Responde la pregunta de forma clara usando ÚNICAMENTE estos documentos:

    Documentos:
    {cuerpo_docs}

    Pregunta:
    {query_text}

    da una respuesta de forma natural
    """

    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Eres un asistente experto que responde basándose solo en los documentos."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1
    )

    return completion.choices[0].message.content

@app.route('/api/rag/reviews/by-text', methods=['POST'])
def rag_reviews_by_text_groq():
    total_start = time.time()

    data = request.get_json()
    query_text = data.get('query', '')

    if not query_text:
        return jsonify({"error": "Query is required."}), 400

    # 1️⃣ Embedding
    t0 = time.time()
    query_embedding = embed_texts_clip([query_text])[0].tolist()
    embedding_time = time.time() - t0

    # 2️⃣ Vector search top-10
    t1 = time.time()
    top_docs = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10
    )
    search_time = time.time() - t1

    # 3️⃣ Respuesta Groq
    t2 = time.time()
    respuesta = generate_rag_response_groq(query_text, top_docs)
    llm_time = time.time() - t2

    # 4️⃣ Precisión semántica
    precision = precision_score_rag(respuesta, top_docs)

    total_time = time.time() - total_start

    return jsonify({
        "respuesta": respuesta,
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "llm_ms": round(llm_time * 1000, 2),
            "precision_score": round(precision, 4),
            "total_ms": round(total_time * 1000, 2)
        },
        "documentos_usados": [
            {"_id": str(doc["_id"]), "comentario": doc.get("comentario")}
            for doc in top_docs
        ]
    })
    
# =========================================================    
# ================ Endpoint RAG por imagen ================
# =========================================================
@app.route('/api/rag/reviews/by-image', methods=['POST'])
def rag_reviews_by_image_groq():
    total_start = time.time()

    if 'image' not in request.files:
        return jsonify({"error": "No image provided."}), 400

    file = request.files['image']
    img = Image.open(BytesIO(file.read())).convert("RGB")

    # 1️⃣ Embedding imagen
    t0 = time.time()
    query_embedding = embed_images_clip([img])[0].tolist()
    embedding_time = time.time() - t0

    # 2️⃣ Vector search
    t1 = time.time()
    top_docs = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10
    )
    search_time = time.time() - t1

    # 3️⃣ Respuesta Groq
    t2 = time.time()
    prompt_base = "Describe la imagen utilizando solo reseñas similares."
    respuesta = generate_rag_response_groq(prompt_base, top_docs)
    llm_time = time.time() - t2

    # 4️⃣ Precisión semántica
    precision = precision_score_rag(respuesta, top_docs)

    total_time = time.time() - total_start

    return jsonify({
        "respuesta": respuesta,
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "llm_ms": round(llm_time * 1000, 2),
            "precision_score": round(precision, 4),
            "total_ms": round(total_time * 1000, 2)
        },
        "documentos_usados": [
            {"_id": str(doc["_id"]), "comentario": doc.get("comentario")}
            for doc in top_docs
        ]
    })



print("✅ Hotel image search API endpoints defined.")

# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)