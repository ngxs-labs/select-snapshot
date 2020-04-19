import { defineSelectSnapshotProperties } from '../internals/select-snapshot';

export function SelectSnapshot(selectorOrFeature?: any, ...paths: string[]) {
  return (type: any, name: string) => {
    defineSelectSnapshotProperties(selectorOrFeature, paths, type, name);
  };
}
