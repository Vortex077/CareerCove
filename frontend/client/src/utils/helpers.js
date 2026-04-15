/**
 * Format date to readable string
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format date with time
 */
export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get status badge color class
 */
export const getStatusColor = (status) => {
  const colors = {
    APPLIED: 'status-applied',
    SHORTLISTED: 'status-shortlisted',
    SELECTED: 'status-selected',
    REJECTED: 'status-rejected',
  };
  return colors[status] || 'status-default';
};

/**
 * Check if deadline has passed
 */
export const isDeadlinePassed = (deadline) => {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
};

/**
 * Extract error message from API response
 */
export const getErrorMessage = (error) => {
  return error?.response?.data?.message || error?.message || 'Something went wrong';
};
