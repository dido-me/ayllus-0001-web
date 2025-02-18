export interface Banner {
    id: number;
    descripcion: string | null;
    nombre_banner: string;
    link_redireccionar: string | null;
    banner: BannerDetails;
  }

export interface BannerDetails {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number | null;
    height: number | null;
    formats: Formats | null;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string | null;
    provider: string;
    provider_metadata: ProviderMetadata;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  }

export interface Formats {
    large?: ImageFormat;
    medium?: ImageFormat;
    small?: ImageFormat;
    thumbnail?: ImageFormat;
  }

export interface ImageFormat {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    name: string;
    path: string | null;
    size: number;
    width: number;
    height: number;
    sizeInBytes: number;
    provider_metadata: ProviderMetadata;
  }

export interface ProviderMetadata {
    public_id: string;
    resource_type: string;
  }

export interface Contenido {
    __component: string;
    id: number;
    Banners: Banner[];
  }

export interface RootCarousel {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Contenido: Contenido[];
  }
