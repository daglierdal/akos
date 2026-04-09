/* eslint-disable @typescript-eslint/no-explicit-any */
declare module "@react-pdf/renderer" {
  export const Document: any;
  export const Image: any;
  export const Page: any;
  export const StyleSheet: {
    create: <T>(styles: T) => T;
  };
  export const Text: any;
  export const View: any;
  export const pdf: (document: unknown) => {
    toBuffer: () => Promise<NodeJS.ReadableStream>;
  };

  export type DocumentProps = Record<string, unknown>;
}
