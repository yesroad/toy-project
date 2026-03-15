// 쿠팡 파트너스 API 응답 타입

export interface CoupangLinkResponse {
  url: string;
  keyword: string;
}

// 쿠팡 파트너스 실제 API 응답 구조 (2단계 실시간 조회 시 사용)
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
