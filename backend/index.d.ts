declare const UE: any;

declare module 'puppeteer-chromium-resolver' {
  import * as Puppeteer from 'puppeteer-core';

  interface RevisionInfo {
    puppeteer: typeof Puppeteer
    executablePath: string
    revision: string
    folderPath: string
    url: string
    local: string
    product: any
  }

  function PCR(option: object): RevisionInfo
  namespace PCR {
    function getStats(): any
  }

  export  =  PCR;
}

