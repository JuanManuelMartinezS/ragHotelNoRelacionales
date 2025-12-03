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
coll_images_ref = db_multimodal["images_ref"]

db_hotel = client["Hotel"]
coll_resenas = db_hotel["resena"]
coll_hotels = db_hotel["hotel"]

# Initialize GridFS
fs = gridfs.GridFS(db_multimodal)

print("✅ Flask app initialized.")
print(f"✅ MongoDB connections established: 'multimodal_rag' (collection: '{coll_images_ref.name}'), 'Hotel' (collections: '{coll_resenas.name}', '{coll_hotels.name}')")

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
        hotel_doc = coll_hotels.find_one({"_id": ObjectId(hotel_id_val)}, {"nombre": 1})
        if hotel_doc:
            return hotel_doc.get("nombre", "Unknown Hotel")
    except:
        pass

    hotel_doc = coll_hotels.find_one({"idHotel": hotel_id_val}, {"nombre": 1})
    if hotel_doc:
        return hotel_doc.get("nombre", "Unknown Hotel")
        
    return "Unknown Hotel"

# Helper function to get image from GridFS
def get_image_from_gridfs(file_id):
    """Retrieve image from GridFS and return as PIL Image."""
    try:
        grid_out = fs.get(ObjectId(file_id))
        image_data = grid_out.read()
        return Image.open(BytesIO(image_data)).convert("RGB")
    except Exception as e:
        print(f"Error retrieving image {file_id}: {e}")
        return None

# Helper function to convert image to base64
def image_to_base64(pil_image):
    """Convert PIL Image to base64 string."""
    buffered = BytesIO()
    pil_image.save(buffered, format="JPEG")
    import base64
    return base64.b64encode(buffered.getvalue()).decode()




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
            {"role": "system", "content": "Eres un asistente para un sistema de hoteles, que responde usando únicamente los documentos proporcionados."},
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



# =========================================================
# ========== Endpoints multimodales para hoteles ==========
# =========================================================

# 1. Imagen a Imagen - Buscar imágenes de hoteles similares a una imagen subida
# 1. Imagen a Imagen - Buscar imágenes de hoteles similares a una imagen subida
@app.route('/api/hotel/images/by-image', methods=['POST'])
def search_hotel_images_by_image():
    total_start = time.time()
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    img = Image.open(BytesIO(file.read())).convert("RGB")
    
    # Embedding de la imagen
    t0 = time.time()
    query_embedding = embed_images_clip([img])[0].tolist()
    embedding_time = time.time() - t0
    
    # 🔍 DEBUGGING: Verificar colección
    total_docs = coll_images_ref.count_documents({})
    docs_with_embedding = coll_images_ref.count_documents({"image_embedding": {"$exists": True}})
    docs_with_images = coll_images_ref.count_documents({"image_file_id": {"$exists": True}})
    
    print(f"📊 Total documents in images_ref: {total_docs}")
    print(f"📊 Documents with image_embedding: {docs_with_embedding}")
    print(f"📊 Documents with image_file_id: {docs_with_images}")
    
    # Vector search en images_ref
    t1 = time.time()
    try:
        top_docs = vector_search_helper(
            collection=coll_images_ref,
            embedding_field="image_embedding",
            query_embedding=query_embedding,
            k=10,
            search_index="vector_index_img"
        )
        print(f"✅ Vector search returned {len(top_docs)} documents")
    except Exception as e:
        print(f"❌ Vector search error: {e}")
        # Fallback: búsqueda simple
        top_docs = list(coll_images_ref.find({"image_embedding": {"$exists": True}}).limit(10))
        print(f"⚠️ Using fallback query, returned {len(top_docs)} documents")
    
    search_time = time.time() - t1
    
    # Si no hay resultados, retornar información útil
    if not top_docs:
        return jsonify({
            "results": [],
            "warning": "No se encontraron imágenes similares",
            "debug_info": {
                "total_documents": total_docs,
                "documents_with_embeddings": docs_with_embedding,
                "documents_with_images": docs_with_images,
                "possible_causes": [
                    "La colección images_ref está vacía",
                    "No existen embeddings en los documentos",
                    "El índice vectorial no está configurado correctamente",
                    "Las imágenes no están almacenadas en GridFS"
                ],
                "solution": "Ejecuta el script de procesamiento de imágenes para generar embeddings"
            },
            "metricas": {
                "embedding_ms": round(embedding_time * 1000, 2),
                "vector_search_ms": round(search_time * 1000, 2),
                "processing_ms": 0,
                "total_ms": round((time.time() - total_start) * 1000, 2)
            }
        }), 200
    
    # Recuperar imágenes y nombres de hoteles
    t2 = time.time()
    results = []
    for doc in top_docs:
        hotel_name = get_hotel_name_from_id(doc.get("id_hotel"))
        img_data = get_image_from_gridfs(doc.get("image_file_id"))
        
        result = {
            "_id": str(doc["_id"]),
            "hotel_name": hotel_name,
            "hotel_id": str(doc.get("id_hotel")),
            "score": doc.get("score", 0),
            "title": doc.get("title", "")
        }
        
        if img_data:
            result["image_base64"] = image_to_base64(img_data)
        else:
            result["image_base64"] = None
            print(f"⚠️ Could not retrieve image for file_id: {doc.get('image_file_id')}")
        
        results.append(result)
    
    processing_time = time.time() - t2
    total_time = time.time() - total_start
    
    return jsonify({
        "results": results,
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "processing_ms": round(processing_time * 1000, 2),
            "total_ms": round(total_time * 1000, 2)
        }
    })
# 2. Texto a Imagen - Buscar imágenes de hoteles usando descripción de texto
@app.route('/api/hotel/images/by-text', methods=['POST'])
def search_hotel_images_by_text():
    total_start = time.time()
    
    data = request.get_json()
    query_text = data.get('query', '')
    
    if not query_text:
        return jsonify({"error": "No query text provided"}), 400
    
    # Embedding del texto
    t0 = time.time()
    query_embedding = embed_texts_clip([query_text])[0].tolist()
    embedding_time = time.time() - t0
    
    # Vector search en images_ref
    t1 = time.time()
    top_docs = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=10,
        search_index="vector_index"
    )
    search_time = time.time() - t1
    
    # Recuperar imágenes y nombres de hoteles
    t2 = time.time()
    results = []
    for doc in top_docs:
        hotel_name = get_hotel_name_from_id(doc.get("id_hotel"))
        img_data = get_image_from_gridfs(doc.get("image_file_id"))
        
        result = {
            "_id": str(doc["_id"]),
            "hotel_name": hotel_name,
            "hotel_id": str(doc.get("id_hotel")),
            "score": doc.get("score", 0),
            "title": doc.get("title", "")
        }
        
        if img_data:
            result["image_base64"] = image_to_base64(img_data)
        
        results.append(result)
    
    processing_time = time.time() - t2
    total_time = time.time() - total_start
    
    return jsonify({
        "query": query_text,
        "results": results,
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "processing_ms": round(processing_time * 1000, 2),
            "total_ms": round(total_time * 1000, 2)
        }
    })

# 3. Imagen a Texto - Describir hoteles similares a una imagen usando LLM
@app.route('/api/hotel/description/by-image', methods=['POST'])
def describe_hotels_by_image():
    total_start = time.time()
    
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    img = Image.open(BytesIO(file.read())).convert("RGB")
    
    # Embedding de la imagen
    t0 = time.time()
    query_embedding = embed_images_clip([img])[0].tolist()
    embedding_time = time.time() - t0
    
    # Vector search en images_ref
    t1 = time.time()
    top_docs = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=5,
        search_index="vector_index_img"
    )
    search_time = time.time() - t1
    
    # Obtener información de hoteles
    t2 = time.time()
    hotel_info = []
    for doc in top_docs:
        hotel_name = get_hotel_name_from_id(doc.get("id_hotel"))
        hotel_info.append(f"Hotel: {hotel_name}, Imagen: {doc.get('title', 'N/A')}")
    
    # Generar respuesta con LLM
    hotel_list = "\n".join([f"{i+1}. {info}" for i, info in enumerate(hotel_info)])
    
    prompt = f"""
    Basándote en estas imágenes de hoteles encontradas:
    
    {hotel_list}
    
    Describe qué tipo de hoteles son similares a la imagen proporcionada.
    Menciona los nombres de los hoteles y sus características probables.
    """
    
    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Eres un asistente experto en hoteles que describe propiedades basándote en búsquedas visuales."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    
    respuesta = completion.choices[0].message.content
    llm_time = time.time() - t2
    
    total_time = time.time() - total_start
    
    return jsonify({
        "descripcion": respuesta,
        "hoteles_encontrados": [
            {
                "_id": str(doc["_id"]),
                "hotel_name": get_hotel_name_from_id(doc.get("id_hotel")),
                "hotel_id": str(doc.get("id_hotel")),
                "score": doc.get("score", 0)
            }
            for doc in top_docs
        ],
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "llm_ms": round(llm_time * 1000, 2),
            "total_ms": round(total_time * 1000, 2)
        }
    })

# 4. Texto a Texto - Buscar información de hoteles por descripción textual
@app.route('/api/hotel/description/by-text', methods=['POST'])
def describe_hotels_by_text():
    total_start = time.time()
    
    data = request.get_json()
    query_text = data.get('query', '')
    
    if not query_text:
        return jsonify({"error": "No query text provided"}), 400
    
    # Embedding del texto
    t0 = time.time()
    query_embedding = embed_texts_clip([query_text])[0].tolist()
    embedding_time = time.time() - t0
    
    # Vector search en images_ref
    t1 = time.time()
    top_docs = vector_search_helper(
        collection=coll_images_ref,
        embedding_field="image_embedding",
        query_embedding=query_embedding,
        k=5,
        search_index="vector_index"
    )
    search_time = time.time() - t1
    
    # Obtener información detallada de hoteles
    t2 = time.time()
    hotel_details = []
    seen_hotels = set()
    
    for doc in top_docs:
        hotel_id = doc.get("id_hotel")
        if hotel_id not in seen_hotels:
            seen_hotels.add(hotel_id)
            try:
                hotel_doc = coll_hotels.find_one({"_id": ObjectId(hotel_id)})
                if hotel_doc:
                    hotel_details.append({
                        "nombre": hotel_doc.get("nombre", "N/A"),
                        "ciudad": hotel_doc.get("ciudad", "N/A"),
                        "direccion": hotel_doc.get("direccion", "N/A"),
                        "estrellas": hotel_doc.get("numeroEstrelllas", "N/A"),
                        "capacidad": hotel_doc.get("capacidad", "N/A")
                    })
            except:
                pass
    
    # Generar respuesta con LLM
    hotel_info_text = "\n".join([
        f"{i+1}. {h['nombre']} - {h['estrellas']} estrellas en {h['ciudad']}, capacidad: {h['capacidad']} personas"
        for i, h in enumerate(hotel_details)
    ])
    
    prompt = f"""
    El usuario pregunta: "{query_text}"
    
    Basándote en estos hoteles encontrados:
    {hotel_info_text}
    
    Responde la pregunta del usuario de forma natural y útil, mencionando los hoteles relevantes.
    """
    
    completion = groq_client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Eres un asistente experto en hoteles que ayuda a los usuarios a encontrar información relevante."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )
    
    respuesta = completion.choices[0].message.content
    llm_time = time.time() - t2
    
    total_time = time.time() - total_start
    
    return jsonify({
        "query": query_text,
        "respuesta": respuesta,
        "hoteles_encontrados": hotel_details,
        "metricas": {
            "embedding_ms": round(embedding_time * 1000, 2),
            "vector_search_ms": round(search_time * 1000, 2),
            "llm_ms": round(llm_time * 1000, 2),
            "total_ms": round(total_time * 1000, 2)
        }
    })

print("✅ Hotel multimodal search endpoints defined.")
# Run the Flask app
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)