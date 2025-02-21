export interface AhorrosGroupType {
    id: number;
    documentId: string;
    nombre: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    ahorros: Ahorro[];
}

export interface Ahorro {
    id: number;
    documentId: string;
    tipo_ahorro: string;
    descripcion: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    slug: string;
    nombre_ahorro: string;
}
