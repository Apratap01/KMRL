from google import genai

client = genai.Client(api_key="AIzaSyCTj6vYty58bVNfwi0mL9ZK0f6b1Jes78E")

result = client.models.embed_content(
        model="gemini-embedding-001",
        contents="What is the meaning of life?")

embedding_vector = result.embeddings[0].values

# print(result.embeddings)
# print("Embedding vector:", embedding_vector)

# Print the dimension
print("Embedding dimension:", len(embedding_vector))
