const unCapitalizeFirstLetter = (string) => {
  return string.charAt[0].toUpperCase + string.slice(1);
};

const getPostParams = (postURL) => {
  const decoded = decodeURIComponent(postURL);
  const postId = decoded.slice(decoded.length - 24, decoded.length);
  const postTitle = decoded.slice(0, decoded.indexOf(postId) - 1);

  return { postId, postTitle };
};

module.exports = { getPostParams, unCapitalizeFirstLetter };
