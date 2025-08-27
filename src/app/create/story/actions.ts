'use server';

import { db, storage } from '@/lib/firebase';
import { collection, doc, setDoc, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

// This is a helper type and does not need to be exported
interface StoryPageForSave {
  text: string;
  imageDataUri: string;
}

// This is a helper type and does not need to be exported
interface StoryDataForSave {
    title: string;
    pages: StoryPageForSave[];
}


async function uploadImage(imageDataUri: string, storyId: string, pageIndex: number): Promise<string> {
  const storageRef = ref(storage, `stories/${storyId}/page_${pageIndex + 1}.png`);
  // Ensure we are passing only the base64 part of the data URI
  const base64Data = imageDataUri.includes(',') ? imageDataUri.split(',')[1] : imageDataUri;
  const uploadResult = await uploadString(storageRef, base64Data, 'base64', {
      contentType: 'image/png'
  });
  return await getDownloadURL(uploadResult.ref);
}

export async function saveStoryAction(
  storyData: StoryDataForSave,
  heroName: string,
  location: string,
): Promise<{ success: boolean; error?: string; storyId?: string }> {
  try {
    const storyTitle = storyData.title || `مغامرة ${heroName} في ${location}`;

    // 1. Create a document reference with a new ID in the 'stories' collection
    const storyRef = doc(collection(db, 'stories'));
    const storyId = storyRef.id;

    // 2. Upload images and collect their public URLs
    const pagesWithImageUrls = await Promise.all(
      storyData.pages.map(async (page, index) => {
        const imageUrl = await uploadImage(page.imageDataUri, storyId, index);
        return {
          text: page.text,
          imageUrl: imageUrl, // Store the public URL
        };
      })
    );
    
    const firstImageUrl = pagesWithImageUrls.length > 0 ? pagesWithImageUrls[0].imageUrl : '';

    // 3. Set the main story document data
    await setDoc(storyRef, {
      title: storyTitle,
      heroName,
      location,
      thumbnailUrl: firstImageUrl,
      createdAt: new Date(),
    });

    // 4. Add each page as a separate document in the 'pages' subcollection
    const pagesCollectionRef = collection(db, 'stories', storyId, 'pages');
    for (const page of pagesWithImageUrls) {
        await addDoc(pagesCollectionRef, page);
    }

    return { success: true, storyId: storyId };
  } catch (error) {
    console.error('Failed to save story:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية حفظ القصة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
