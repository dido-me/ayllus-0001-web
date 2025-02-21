export interface CreditosGroupType {
    id: number;
    documentId: string;
    nombre: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
    creditos: Credito[];
}

export interface Credito {
    id: number;
    documentId: string;
    tipo_credito: string;
    nombre_credito: string;
    descripcion: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date;
}
