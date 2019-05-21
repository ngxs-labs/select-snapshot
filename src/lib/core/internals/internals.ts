import { ɵm as NgxsConfig } from '@ngxs/store';

const DOLLAR_CHAR_CODE = 36;

export function removeDollarAtTheEnd(name: string): string {
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

function compliantPropGetter(paths: string[]): (x: any) => any {
  const copyOfPaths = [...paths];
  return obj => copyOfPaths.reduce((acc: any, part: string) => acc && acc[part], obj);
}

function fastPropGetter(paths: string[]): (x: any) => any {
  const segments = paths;
  let seg = 'store.' + segments[0];
  let i = 0;
  const l = segments.length;

  let expr = seg;
  while (++i < l) {
    expr = expr + ' && ' + (seg = seg + '.' + segments[i]);
  }

  const fn = new Function('store', 'return ' + expr + ';');

  return <(x: any) => any>fn;
}

export function propGetter(paths: string[], config: NgxsConfig) {
  if (config && config.compatibility && config.compatibility.strictContentSecurityPolicy) {
    return compliantPropGetter(paths);
  } else {
    return fastPropGetter(paths);
  }
}

export const META_KEY = 'NGXS_META';
