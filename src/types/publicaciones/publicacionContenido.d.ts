export interface PublicacionContenidoType {
    id: number;
    documentId: string;
    titulo: string;
    descripcion_de_la_card: string;
    contenido: Contenido[];
    publicacion_destacado: boolean;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    imagen_de_la_cabecera: Image;
    imagen_card: Image;
}

export interface Contenido {
    type: string;
    level?: number;
    children: ContenidoChild[];
    image?: Image;
    format?: string;
}

export interface ContenidoChild {
    text?: string;
    type: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
    code?: boolean;
    url?: string;
    children?: ChildChild[];
}

export interface ChildChild {
    text: string;
    type: string;
}

export interface Image {
    ext: string;
    url: string;
    hash: string;
    mime: string;
    name: string;
    size: number;
    width: number;
    height: number;
    caption: null;
    formats: Formats;
    provider: string;
    createdAt: Date;
    updatedAt: Date;
    previewUrl: null;
    alternativeText: null | string;
    provider_metadata: ProviderMetadata;
    id?: number;
    documentId?: string;
    publishedAt?: Date;
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
