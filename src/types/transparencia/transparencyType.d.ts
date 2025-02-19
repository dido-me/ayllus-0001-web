export interface TransparencyType {
    id: number;
    documentId: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    imagen_de_la_cabecera: ImagenDeLaCabecera;
    contenido: Contenido[];
}

export interface Contenido {
    id: number;
    titulo: string;
    descripcion: string;
    archivos: ImagenDeLaCabecera[];
}

export interface ImagenDeLaCabecera {
    id: number;
    documentId: string;
    name: string;
    alternativeText: null;
    caption: null;
    width: number | null;
    height: number | null;
    formats: Formats | null;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: null;
    provider: string;
    provider_metadata: ProviderMetadata;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    related?: Related[];
}

export interface Formats {
    large: Large;
    small: Large;
    medium: Large;
    thumbnail: Large;
}

export interface Large {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    name: string;
    path: null;
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

export interface Related {
    __type: string;
    id: number;
    documentId: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}
