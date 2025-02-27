export interface InfoCreditoType {
    id: number;
    documentId: string;
    nombre_credito: string;
    descripcion: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    slug: string;
    contenido: Contenido[];
    grupo_credito: GrupoCredito;
    imagen_de_la_cabecera: ImagenDe;
    imagen_de_contenido: ImagenDe;
}

export interface Contenido {
    id: number;
    titulo: string;
    contenido: string[];
}

export interface GrupoCredito {
    id: number;
    documentId: string;
    nombre: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}

export interface ImagenDe {
    id: number;
    documentId: string;
    name: string;
    alternativeText: null;
    caption: null;
    width: number;
    height: number;
    formats: Formats;
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
