import { useState } from 'react';
import Swal from 'sweetalert2';
import { validateFile } from '../utils/fileValidation';

export const useFileUpload = (uploadFn) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (selectedFile) => {
    try {
      // Validate file before upload
      validateFile(selectedFile);
      
      setLoading(true);
      setError(null);
      
      const result = await uploadFn(selectedFile);
      setFile(selectedFile);
      
      Swal.fire({
        icon: 'success',
        title: 'Upload Successful',
        text: 'File uploaded successfully!',
        timer: 2000,
        showConfirmButton: false
      });
      
      return result;
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload file';
      setError(errorMessage);
      
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: errorMessage,
        confirmButtonColor: '#2563eb'
      });
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setError(null);
  };

  return { file, loading, error, upload, clear };
};