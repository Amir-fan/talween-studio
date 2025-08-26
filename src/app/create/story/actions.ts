'use server';

import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { CreateStoryAndColoringPagesOutput } from '@/ai/flows/create-story-and-coloring-pages';

async function uploadImage(imageDataUri: string, storyId: string, pageIndex: number): Promise<string> {
  const storageRef = ref(storage, `stories/${storyId}/page_${pageIndex + 1}.png`);
  // The data URI needs to be stripped of its prefix before uploading
  const uploadResult = await uploadString(storageRef, imageDataUri.split(',')[1], 'base64', {
      contentType: 'image/png'
  });
  const downloadUrl = await getDownloadURL(uploadResult.ref);
  return downloadUrl;
}

export async function saveStoryAction(
  storyData: CreateStoryAndColoringPagesOutput,
  heroName: string,
  location: string,
): Promise<{ success: boolean; error?: string; storyId?: string }> {
  try {
    const storyTitle = `مغامرة ${heroName} في ${location}`;

    // First, create a document in Firestore to get a story ID
    const storyRef = await addDoc(collection(db, 'stories'), {
      title: storyTitle,
      heroName,
      location,
      createdAt: new Date(),
      pages: [], // Will be populated later
    });

    const storyId = storyRef.id;

    // Now, upload images to Storage and collect their URLs
    const pagesWithImageUrls = await Promise.all(
      storyData.pages.map(async (page, index) => {
        const imageUrl = await uploadImage(page.imageDataUri, storyId, index);
        return {
          text: page.text,
          imageUrl: imageUrl, // Store the public URL
        };
      })
    );

    // Update the Firestore document with the final page data
    await addDoc(collection(db, `stories/${storyId}/pages`), ...pagesWithImageUrls.map(p => ({text: p.text, imageUrl: p.imageUrl})))

    return { success: true, storyId: storyId };
  } catch (error) {
    console.error('Failed to save story:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية حفظ القصة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
