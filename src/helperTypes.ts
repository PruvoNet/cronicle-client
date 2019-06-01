'use strict';

export type RecursivePartial<T> = {
  [P in keyof T]?:
  T[P] extends Array<infer U> ? Array<RecursivePartial<U>> :
    T[P] extends object ? RecursivePartial<T[P]> :
      T[P];
};

type PluginNameType<Plugin, Plugins> = Plugin extends keyof Plugins ? Plugin : never;

export type IPluginNames<Plugins> =  {
  [k in keyof Plugins]: PluginNameType<k, Plugins>;
};

export enum NumberedBoolean {
  FALSE = 0,
  TRUE = 1,
}
