export function validateEmbeddingVectors(
  vectors: unknown,
  expectedCount: number,
  dimensions: number,
  provider: string,
): number[][] {
  if (!Array.isArray(vectors) || vectors.length !== expectedCount) {
    throw new Error(`${provider} returned ${Array.isArray(vectors) ? vectors.length : 0} embeddings; expected ${expectedCount}`);
  }

  return vectors.map((vector, index) => {
    if (!Array.isArray(vector) || vector.length !== dimensions) {
      throw new Error(`${provider} embedding ${index} has ${Array.isArray(vector) ? vector.length : 0} dimensions; expected ${dimensions}`);
    }
    const values = vector.map((value) => Number(value));
    if (values.some((value) => !Number.isFinite(value))) {
      throw new Error(`${provider} embedding ${index} contains a non-finite value`);
    }
    return values;
  });
}
