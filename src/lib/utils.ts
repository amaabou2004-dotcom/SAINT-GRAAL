import { auth } from '../firebase';
import { OperationType, FirestoreErrorInfo } from '../types';

export const handleFirestoreError = (error: unknown, operationType: OperationType | string, path: string | null) => {
  const opType = operationType as OperationType;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType: opType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  
  // User friendly mapping
  let userMessage = "Une erreur est survenue avec la base de données.";
  if (errInfo.error.includes("permission-denied")) {
    userMessage = "Accès refusé. Vous n'avez pas les permissions nécessaires pour cette action.";
  } else if (errInfo.error.includes("quota-exceeded")) {
    userMessage = "Quota dépassé. Veuillez réessayer plus tard.";
  } else if (errInfo.error.includes("not-found")) {
    userMessage = "Élément introuvable dans la base de données.";
  }
  
  throw new Error(JSON.stringify({ ...errInfo, userMessage }));
};

/**
 * Compresses an image from a base64 string or File.
 * Useful for keeping base64 strings under the 1MB Firestore limit.
 */
export const compressImage = async (imageInput: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = imageInput;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject("Could not get canvas context");
      
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG with given quality
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.onerror = (err) => reject(err);
  });
};
