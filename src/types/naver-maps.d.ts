export {};

declare global {
  interface Window {
    naver: any;
    navermap_authFailure: () => void;
  }
}
