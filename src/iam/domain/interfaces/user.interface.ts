import { ProfileResponse } from './profile.interface';
import { RegisteredFaceResponse } from '../../../recognition/domain/interfaces/registered-face.interface';

export interface UserResponse {
  id: number;
  email: string;
  userName: string;
  roles: string[];
  token?: string;
  profile?: ProfileResponse;
  registeredFace?: RegisteredFaceResponse;
}
