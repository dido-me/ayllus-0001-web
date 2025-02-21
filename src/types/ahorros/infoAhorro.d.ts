export interface InfoAhorroType {
    id: number;
    documentId: string;
    tipo_ahorro: string;
    descripcion: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    slug: string;
    nombre_ahorro: string;
    imagen_de_la_cabecera: ImagenDeLaCabecera;
    contenido: Contenido[];
    grupo_ahorro: GrupoAhorro;
}

export interface Contenido {
    id: number;
    titulo: string;
    contenido: string[];
}

export interface GrupoAhorro {
    id: number;
    documentId: string;
    nombre: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}

export interface ImagenDeLaCabecera {
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
