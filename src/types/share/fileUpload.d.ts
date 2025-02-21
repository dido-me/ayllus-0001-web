export interface FileUploadType {
    id: number;
    documentId: string;
    name: string;
    alternativeText: null;
    caption: null;
    width: null;
    height: null;
    formats: null;
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

export interface ProviderMetadata {
    public_id: string;
    resource_type: string;
}
