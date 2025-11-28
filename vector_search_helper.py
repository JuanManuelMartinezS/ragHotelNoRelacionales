import gridfs # Needed for GridFS operations, assuming it's imported globally.

# Initialize GridFS for the multimodal_rag database
fs = gridfs.GridFS(db_multimodal)

def vector_search_helper(
    collection,
    embedding_field,
    query_embedding,
    k=5,
    filters=None,
    search_index="vector_index", # Default index name, update if needed
    use_native_vector_search=True # Flag to choose between $vectorSearch and $search/knnBeta
):
    """
    Constructs and executes a MongoDB aggregation pipeline for vector searches.

    Args:
        collection (pymongo.collection.Collection): The MongoDB collection to search.
        embedding_field (str): The name of the field containing the embeddings in the documents.
        query_embedding (list): The vector to search for.
        k (int): The number of results to return.
        filters (dict, optional): A dictionary for additional filtering criteria (e.g., {'category': 'books'}).
                                  For 'tags', it can be a string or a list of strings.
        search_index (str): The name of the Atlas Search index.
        use_native_vector_search (bool): If True, uses $vectorSearch. Otherwise, uses $search with knnBeta.

    Returns:
        list: A list of documents matching the search criteria.
    """
    pipeline = []

    if use_native_vector_search:
        # Use $vectorSearch (preferred if supported by MongoDB Atlas cluster)
        vector_search_stage = {
            "$vectorSearch": {
                "index": search_index,
                "path": embedding_field,
                "queryVector": query_embedding,
                "numCandidates": 200, # Can be tuned based on dataset size and recall needs
                "limit": k,
                "similarity": "cosine" # Assuming cosine similarity as used in notebook
            }
        }
        pipeline.append(vector_search_stage)
        pipeline.append({"$addFields": {"score": {"$meta": "vectorSearchScore"}}})

        # Apply filters as a separate $match stage (post-vector search)
        if filters:
            processed_filters = {}
            for key, value in filters.items():
                if key == "tags":
                    # If 'tags' filter is provided, use $in operator for flexibility
                    processed_filters[key] = {"$in": value if isinstance(value, list) else [value]}
                else:
                    processed_filters[key] = value
            pipeline.append({"$match": processed_filters})

    else:
        # Fallback to Atlas Search knnBeta for older clusters or specific requirements
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
                    # For knnBeta filter, if value is a list, create multiple equals clauses
                    if isinstance(value, list):
                        must_clauses.extend([{"equals": {"path": key, "value": v}} for v in value])
                    else:
                        must_clauses.append({"equals": {"path": key, "value": value}});
                else:
                    must_clauses.append({"equals": {"path": key, "value": value}});
            search_stage["$search"]["filter"] = {"must": must_clauses}
        pipeline.append(search_stage)
        pipeline.append({"$addFields": {"score": {"$meta": "searchScore"}}})

    # Project only the necessary fields
    pipeline.append({
        "$project": {
            "_id": 1,
            "title": 1,
            "category": 1,
            "tags": 1,
            "caption": 1, # Include caption as it might be useful
            "image_file_id": 1,
            "score": 1
        }
    })
    # Ensure final limit is applied, especially if filters reduce the number of results below k after vector search
    pipeline.append({"$limit": k})

    # Execute the pipeline and return results
    return list(collection.aggregate(pipeline))

print("✅ Vector search helper function defined.")