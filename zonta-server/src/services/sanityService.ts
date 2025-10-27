// src/services/sanityService.ts
import { sanityClient } from "@utils/sanityClient";
import type { BaseDocument } from "@utils/types";

export { sanityClient };

/**
 * Fetch all documents of a given type.
 */
export async function fetchDocuments<T extends BaseDocument>(type: string): Promise<T[]> {
  try {
    console.log(`🧠 [SanityService] Fetching documents of type "${type}"`);
    const query = `*[_type == "${type}"] | order(_createdAt desc)`;
    const result = await sanityClient.fetch(query);
    console.log(`✅ [SanityService] Retrieved ${result.length} ${type}(s)`);
    return result as T[];
  } catch (err: any) {
    console.error(`❌ [SanityService] Failed to fetch documents (${type}):`, err.message || err);
    return []; // Always return array to avoid breaking .json()
  }
}

/**
 * Fetch a single document by ID.
 */
export async function fetchDocumentById<T extends BaseDocument>(id: string): Promise<T | null> {
  try {
    console.log(`🧠 [SanityService] Fetching document by ID: ${id}`);
    const result = await sanityClient.getDocument(id);
    if (!result) console.warn(`⚠️ [SanityService] Document not found: ${id}`);
    return (result as T) || null;
  } catch (err: any) {
    console.error(`❌ [SanityService] fetchDocumentById error:`, err.message || err);
    return null;
  }
}

/**
 * Create a new Sanity document.
 */
export async function createDocument<T extends BaseDocument>(type: string, data: Partial<T>): Promise<T> {
  try {
    console.log(`🧠 [SanityService] Creating new ${type} document...`);
    const newDoc = await sanityClient.create({ _type: type, ...data } as any);
    console.log(`✅ [SanityService] Created ${type} with ID: ${newDoc._id}`);
    return newDoc as T;
  } catch (err: any) {
    console.error(`❌ [SanityService] createDocument error:`, err.message || err);
    throw new Error(`Failed to create ${type} document`);
  }
}

/**
 * Update an existing document by ID.
 */
export async function updateDocument<T extends BaseDocument>(id: string, data: Partial<T>): Promise<T> {
  try {
    console.log(`🧠 [SanityService] Updating document ${id}`);
    const updatedDoc = await sanityClient.patch(id).set(data).commit();
    console.log(`✅ [SanityService] Updated document ${id}`);
    return updatedDoc as T;
  } catch (err: any) {
    console.error(`❌ [SanityService] updateDocument error:`, err.message || err);
    throw new Error(`Failed to update document ${id}`);
  }
}

/**
 * Delete a document by ID.
 */
export async function deleteDocument(id: string): Promise<void> {
  try {
    console.log(`🧠 [SanityService] Deleting document ${id}`);
    await sanityClient.delete(id);
    console.log(`✅ [SanityService] Deleted document ${id}`);
  } catch (err: any) {
    console.error(`❌ [SanityService] deleteDocument error:`, err.message || err);
    throw new Error(`Failed to delete document ${id}`);
  }
}