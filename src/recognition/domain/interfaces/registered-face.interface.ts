export interface RegisteredFaceResponse {
  id: number;
  name: string;
  imageUrl: string;
  imageId: string;
  labeledDescriptors?: string;
}
