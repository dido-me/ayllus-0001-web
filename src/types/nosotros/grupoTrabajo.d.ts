export interface GroupWorkType {
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
    nombre_oficina: string;
    puestos_oficina_superior: PuestosOficina[];
    puestos_oficina: PuestosOficina[] | null;
}

export interface PuestosOficina {
    id: number;
    puesto: string;
    nombre_colaborador: string;
    fotografia: ImagenDeLaCabecera;
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
