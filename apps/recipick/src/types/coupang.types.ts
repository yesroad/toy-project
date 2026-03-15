// 쿠팡 파트너스 API 타입

export interface CoupangLinkRequest {
  keyword: string;
}

export interface CoupangLinkResponse {
  url: string;
  keyword: string;
}

// 쿠팡 파트너스 API 응답 (실제 API 구조)
export interface CoupangProduct {
  productId: number;
  productName: string;
  productPrice: number;
  productUrl: string;
  productImage: string;
  shopName: string;
}

export interface CoupangApiResponse {
  rCode: string;
  rMessage: string;
  data: CoupangProduct[];
}
