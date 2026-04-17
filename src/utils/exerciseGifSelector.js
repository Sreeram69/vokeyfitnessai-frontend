export const getPersonalizedExerciseGif = (exercise) => {
  if (!exercise) return "";

  // 1. Use the API provided GIF if it exists
  if (exercise.gifUrl) return exercise.gifUrl;

  // 2. Fallback to local downloaded GIFs based on the exercise ID
  // Place your downloaded GIFs in the `public/gifs` directory named by ID (e.g., public/gifs/0001.gif)
  if (exercise.id) return `/gifs/${exercise.id}.gif`;

  return "";
};

export const getExerciseThumbnail = (exercise) => {
  return "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop";
};