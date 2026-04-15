const path = require('path');
const fs = require('fs');
const supabase = require('../config/supabase');

/**
 * Upload file to Supabase Storage
 * @param {Object} file - Multer file object
 * @param {string} bucket - Storage bucket name
 * @param {string} folder - Folder path inside bucket
 * @returns {string|null} Public URL of uploaded file
 */
const uploadToSupabase = async (file, bucket = 'resumes', folder = '') => {
  if (!supabase) {
    console.warn('⚠️ Supabase not configured. Returning local path.');
    return `/uploads/${file.filename}`;
  }

  const filePath = folder ? `${folder}/${file.filename}` : file.filename;
  const fileBuffer = fs.readFileSync(file.path);

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(filePath, fileBuffer, {
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

  // Clean up local file after successful upload
  fs.unlinkSync(file.path);

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
