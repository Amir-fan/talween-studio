'use server';

import {
  generateColoringPageFromText,
  GenerateColoringPageFromTextInput,
} from '@/ai/flows/generate-coloring-page-from-text';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';

export async function generateImageAction(
  values: GenerateColoringPageFromTextInput
): Promise<{
  success: boolean;
  data?: { coloringPageDataUri: string };
  error?: string;
}> {
  try {
    const result = await generateColoringPageFromText(values);
    return { success: true, data: result };
  } catch (error) {
    console.error('Image generation failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية إنشاء الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}

interface SaveImageToLibraryInput {
    imageDataUri: string;
    description: string;
}

export async function saveImageToLibraryAction(
  input: SaveImageToLibraryInput
): Promise<{ success: boolean; error?: string; docId?: string }> {
  try {
    // 1. Upload image to Firebase Storage
    const storageRef = ref(storage, `creations/${Date.now()}.png`);
    const uploadResult = await uploadString(storageRef, input.imageDataUri.split(',')[1], 'base64', {
      contentType: 'image/png'
    });
    const imageUrl = await getDownloadURL(uploadResult.ref);

    // 2. Save metadata to Firestore
    const docRef = await addDoc(collection(db, 'creations'), {
      description: input.description,
      imageUrl: imageUrl,
      createdAt: new Date(),
    });
    
    return { success: true, docId: docRef.id };
  } catch (error) {
    console.error('Failed to save image:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'فشلت عملية حفظ الصورة. الرجاء المحاولة مرة أخرى.';
    return { success: false, error: errorMessage };
  }
}
