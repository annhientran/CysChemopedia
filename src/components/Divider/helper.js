// Replaces all spaces inside given string
// with `&nbsp;` (non-breaking spaces)
export const formatTitle = title => {
  return title.replace(/\s+/g, '\u00A0');
};
