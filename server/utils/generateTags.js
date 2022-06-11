const generateTags = (categories) => {
  if (!categories) return '';

  if (typeof categories === 'string') {
    return `#${categories.replace(/\s/g, '_')}`;
  }

  if (Array.isArray(categories)) {
    return categories.map(category => generateTags(category)).join(', ');
  }
};

export default generateTags;
