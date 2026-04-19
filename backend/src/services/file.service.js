const supabase = require('../config/supabase');
const path = require('path');

/**
 * Upload file to Supabase Storage
 * @param {Object} file - Multer file object
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path inside bucket
 * @returns {string|null} Public URL of uploaded file
 */
const uploadToSupabase = async (file, bucket = 'resumes', folder = '') => {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. This will fail in production.');
    throw new Error('Storage service unavailable');
  }

  // Generate unique filename since memoryStorage doesn't provide one
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const filename = `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`;
  const filePath = folder ? `${folder}/${filename}` : filename;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error('❌ Supabase upload error:', error.message);
    throw new Error('File upload failed');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return urlData.publicUrl;
};

/**
 * Delete file from Supabase Storage
 */
const deleteFromSupabase = async (fileUrl, bucket = 'resumes') => {
  if (!supabase || !fileUrl) return;

  // Extract path from URL
  const urlParts = fileUrl.split(`/storage/v1/object/public/${bucket}/`);
  if (urlParts.length < 2) return;

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(bucket)
    .remove([filePath]);

  if (error) {
    console.error('❌ Supabase delete error:', error.message);
  }
};

module.exports = {
  uploadToSupabase,
  deleteFromSupabase,
};
