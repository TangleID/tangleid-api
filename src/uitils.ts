export const generateSeed = (length = 81) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
  let buffer = '';
  for (let i = 0; i < length; i++) {
    buffer += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return buffer;
};

export const parseJson = (json: string): any => {
  if (typeof json !== "string") {
    return null;
  }

  try {
    const parsed = JSON.parse(json);
    return parsed;
  } catch (error) {
    return null;
  }
};
