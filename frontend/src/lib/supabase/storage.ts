import { supabase } from "./client";

/**
 * Generate a user-specific folder name from user information
 * Priority: "Last, First" format > full name > email
 */
export function generateUserFolderName(
  name?: string | null,
  email?: string | null,
  userId?: string
): string {
  let folderName: string;

  if (name && name !== "Unknown") {
    // Try to split name into first and last
    const nameParts = name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      const firstName = nameParts[0];
      const lastName = nameParts[nameParts.length - 1];
      folderName = `${lastName}, ${firstName}`;
    } else {
      folderName = name;
    }
  } else if (email) {
    // Use email as folder name
    folderName = email;
  } else {
    // Fallback to userId
    folderName = userId || "unknown";
  }

  // Sanitize folder name (remove invalid characters)
  return folderName.replace(/[/\\?%*:|"<>]/g, "_");
}

/**
 * Upload a resume file to user-specific folder in Supabase Storage
 */
export async function uploadResume(
  file: File,
  folderName: string
): Promise<{ fileName: string; error: Error | null }> {
  try {
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[/\\?%*:|"<>]/g, "_");
    const fileName = `${folderName}/${timestamp}_${sanitizedFileName}`;

    const { error } = await supabase.storage
      .from("resumes")
      .upload(fileName, file);

    if (error) {
      return { fileName: "", error };
    }

    return { fileName, error: null };
  } catch (error) {
    return { fileName: "", error: error as Error };
  }
}

/**
 * List all resumes for a specific user folder
 */
export async function listUserResumes(
  folderName: string
): Promise<{ files: any[]; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .list(folderName, {
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      return { files: [], error };
    }

    return { files: data || [], error: null };
  } catch (error) {
    return { files: [], error: error as Error };
  }
}

/**
 * Download a resume file from Supabase Storage
 */
export async function downloadResume(
  filePath: string
): Promise<{ data: Blob | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.storage
      .from("resumes")
      .download(filePath);

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}

/**
 * Get public URL for a resume file
 */
export function getResumePublicUrl(filePath: string): string {
  const { data } = supabase.storage.from("resumes").getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Delete a resume file from Supabase Storage
 */
export async function deleteResume(
  filePath: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.storage.from("resumes").remove([filePath]);

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}
