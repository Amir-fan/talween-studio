'use server';

import { dbAdmin } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

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
  const bucket = getStorage().bucket();
  const file = bucket.file(`stories/${storyId}/page_${pageIndex + 1}.png`);
  
  const base64Data = imageDataUri.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');

  await file.save(buffer, {
    metadata: {
      contentType: 'image/png',
    },
  });

  // Make the file public and get the URL
  await file.makePublic();
  return file.publicUrl();
}

export async function saveStoryAction(
  storyData: StoryDataForSave,
  heroName: string,
  location: string,
  userId: string,
): Promise<{ success: boolean; error?: string; storyId?: string }> {
  if (!userId) {
    return { success: false, error: 'User not authenticated.' };
  }
  
  try {
    const storyTitle = storyData.title || `مغامرة ${heroName} في ${location}`;

    // 1. Create a document reference with a new ID in the 'stories' collection
    const storyRef = dbAdmin.collection('stories').doc();
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
    await storyRef.set({
      title: storyTitle,
      heroName,
      location,
      thumbnailUrl: firstImageUrl,
      createdAt: FieldValue.serverTimestamp(),
      userId: userId, // Associate story with the user
    });

    // 4. Add each page as a separate document in the 'pages' subcollection
    const pagesCollectionRef = storyRef.collection('pages');
    const batch = dbAdmin.batch();
    pagesWithImageUrls.forEach((page, index) => {
      const pageRef = pagesCollectionRef.doc(`page_${index + 1}`);
      batch.set(pageRef, {
          ...page,
          pageNumber: index + 1
      });
    });
    await batch.commit();

    return { success: true, storyId: storyId };
  } catch (error) {
    console.error('Failed to save story:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية حفظ القصة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
