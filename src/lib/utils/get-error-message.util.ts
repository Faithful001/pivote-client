export function getErrorMessage(error: any): string {
  // return (
  return (
    error?.response?.data?.message ||
    error?.data?.message ||
    error?.message ||
    error?.title ||
    error?.response?.title ||
    error?.data?.title ||
    "An unexpected error occurred"
  );
}
