export const normalizeApiError = async (response: Response) => {
  try {
    const json = await response.json();
    return json;
  } catch {
    return {
      success: false,
      error: "UNKNOWN_ERROR",
      message: "Something went wrong. Please try again later.",
    };
  }
};
