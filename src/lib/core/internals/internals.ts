const DOLLAR_CHAR_CODE = 36;

export function removeDollarAtTheEnd(name: string | symbol): string {
  if (typeof name !== 'string') {
    name = name.toString();
  }
  const lastCharIndex = name.length - 1;
  const dollarAtTheEnd = name.charCodeAt(lastCharIndex) === DOLLAR_CHAR_CODE;
  return dollarAtTheEnd ? name.slice(0, lastCharIndex) : name;
}

export function getPropsArray(selectorOrFeature: string, paths: string[]): string[] {
  if (paths.length) {
    return [selectorOrFeature, ...paths];
  }
  return selectorOrFeature.split('.');
}

export function compliantPropGetter(paths: string[]): (x: any) => any {
  const copyOfPaths = [...paths];
  return obj => copyOfPaths.reduce((acc: any, part: string) => acc && acc[part], obj);
}

export const META_KEY = 'NGXS_META';
