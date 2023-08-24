// Function that replaces a given string pattern in a string with a given replacement
const replaceString = (str: string, pattern: string, replacement: string) => {
  return str.replace(pattern, replacement);
};
// function that replaces all patterns with a string while the patterns are given as an key value object
export const replaceAll = (str: string, patterns: { [key: string]: string; }) => {
  let result = str;
  for (const [ pattern, value ] of Object.entries(patterns)) {
    result = replaceString(result, `$${ pattern }$`, value);
  }
  return result;
};