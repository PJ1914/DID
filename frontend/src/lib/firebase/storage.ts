import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTask,
} from "firebase/storage"
import { storage, FIREBASE_ENABLED } from "./config"

// Storage paths
export const STORAGE_PATHS = {
  CERTIFICATES: "certificates",
  PROFILE_IMAGES: "profile-images",
  INSTITUTION_LOGOS: "institution-logos",
} as const

/**
 * Upload a certificate PDF to Firebase Storage
 * @param file - The PDF file to upload
 * @param certificateHash - The blockchain hash to use as filename
 * @returns Promise with the download URL
 */
export const uploadCertificatePDF = async (
  file: File,
  certificateHash: string
): Promise<string> => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  const fileName = `${certificateHash}.pdf`
  const storageRef = ref(storage, `${STORAGE_PATHS.CERTIFICATES}/${fileName}`)

  await uploadBytes(storageRef, file, {
    contentType: "application/pdf",
  })

  return await getDownloadURL(storageRef)
}

/**
 * Upload a certificate image to Firebase Storage
 * @param file - The image file to upload
 * @param certificateHash - The blockchain hash to use as filename
 * @returns Promise with the download URL
 */
export const uploadCertificateImage = async (
  file: File,
  certificateHash: string
): Promise<string> => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  const extension = file.name.split(".").pop()
  const fileName = `${certificateHash}.${extension}`
  const storageRef = ref(storage, `${STORAGE_PATHS.CERTIFICATES}/${fileName}`)

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  })

  return await getDownloadURL(storageRef)
}

/**
 * Upload a file with progress tracking
 * @param file - The file to upload
 * @param path - Storage path
 * @param onProgress - Progress callback (0-100)
 * @returns Promise with the download URL
 */
export const uploadFileWithProgress = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): { uploadTask: UploadTask; promise: Promise<string> } => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  const promise = new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        onProgress?.(progress)
      },
      (error) => {
        reject(error)
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        resolve(downloadURL)
      }
    )
  })

  return { uploadTask, promise }
}

/**
 * Delete a file from Firebase Storage
 * @param fileUrl - The download URL of the file
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  if (!FIREBASE_ENABLED || !storage) {
    return
  }
  try {
    const fileRef = ref(storage, fileUrl)
    await deleteObject(fileRef)
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}

/**
 * Upload profile image
 * @param file - The image file
 * @param userId - User ID for the filename
 * @returns Promise with the download URL
 */
export const uploadProfileImage = async (file: File, userId: string): Promise<string> => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  const extension = file.name.split(".").pop()
  const fileName = `${userId}.${extension}`
  const storageRef = ref(storage, `${STORAGE_PATHS.PROFILE_IMAGES}/${fileName}`)

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  })

  return await getDownloadURL(storageRef)
}

/**
 * Download a certificate file from Firebase Storage
 * @param certificateHash - The blockchain hash used as filename
 * @returns Promise with the download URL
 */
export const getCertificateDownloadURL = async (
  certificateHash: string
): Promise<string> => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  
  // Try both .pdf and common image formats
  const extensions = ['pdf', 'png', 'jpg', 'jpeg']
  
  for (const ext of extensions) {
    try {
      const fileName = `${certificateHash}.${ext}`
      const storageRef = ref(storage, `${STORAGE_PATHS.CERTIFICATES}/${fileName}`)
      const url = await getDownloadURL(storageRef)
      return url
    } catch (error) {
      // Try next extension
      continue
    }
  }
  
  throw new Error("Certificate file not found in storage")
}

/**
 * Upload institution logo
 * @param file - The logo file
 * @param institutionId - Institution ID for the filename
 * @returns Promise with the download URL
 */
export const uploadInstitutionLogo = async (
  file: File,
  institutionId: string
): Promise<string> => {
  if (!FIREBASE_ENABLED || !storage) {
    throw new Error("Firebase Storage not configured")
  }
  const extension = file.name.split(".").pop()
  const fileName = `${institutionId}.${extension}`
  const storageRef = ref(storage, `${STORAGE_PATHS.INSTITUTION_LOGOS}/${fileName}`)

  await uploadBytes(storageRef, file, {
    contentType: file.type,
  })

  return await getDownloadURL(storageRef)
}

/**
 * Validate file size and type
 * @param file - The file to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @param allowedTypes - Array of allowed MIME types
 * @returns Validation result
 */
export const validateFile = (
  file: File,
  maxSizeMB: number,
  allowedTypes: string[]
): { valid: boolean; error?: string } => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB` }
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} not allowed` }
  }

  return { valid: true }
}
