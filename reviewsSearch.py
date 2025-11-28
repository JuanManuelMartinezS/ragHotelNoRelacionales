from flask import Flask, request, jsonify
from io import BytesIO
from PIL import Image
from server import embed_images_clip, embed_texts_clip
import vector_search_helper

# Assuming 'app', 'coll_resenas', 'embed_texts_clip', 'embed_images_clip', 'vector_search_helper' are already defined.

@app.route('/api/reviews/search/by-text', methods=['GET'])
def search_reviews_by_text():
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    results = vector_search_helper(
        collection=coll_resenas,
        embedding_field="comentario_embedding",
        query_embedding=query_embedding,
        k=10 # Default K, can be adjusted or passed as param
    )

    comments = [doc.get('comentario') for doc in results if doc.get('comentario')]
    return jsonify(comments)

@app.route('/api/reviews/search/by-text/<hotel_id>', methods=['GET'])
def search_reviews_by_text_and_hotel(hotel_id):
    query_text = request.args.get('query', '')
    if not query_text:
        return jsonify({"error": "Query text is required."}), 400

    query_embedding = embed_texts_clip([query_text])[0].tolist()
    
    # Convert hotel_id to ObjectId if it's stored as such, otherwise use as string
    # For this example, assuming hotel_id in 'resenas' is stored as a string or can be directly matched.
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
    
    # Convert hotel_id to ObjectId if it's stored as such, otherwise use as string
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

print("✅ Review search API endpoints defined.")