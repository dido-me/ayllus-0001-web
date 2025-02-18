export interface DataOficina {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    Contenido: Contenido[];
  }

export interface Contenido {
    __component: string;
    id: number;
    Ayacucho: Oficina;
    Pichari: Oficina;
    Kimniri: Oficina;
  }

export interface Oficina {
    id: number;
    nombre: string;
    link_maps: string;
    direccion: string;
    foto: Foto;
  }

export interface Foto {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string | null;
    caption: string | null;
    width: number;
    height: number;
    formats: Formats;
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
    thumbnail: Thumbnail;
  }

export interface Thumbnail {
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
