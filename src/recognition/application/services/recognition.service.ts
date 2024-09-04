//import '@tensorflow/tfjs-node';

import { Injectable, Logger } from '@nestjs/common';
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas';
import * as fs from 'fs';
import * as path from 'path';
import axios from 'axios';
import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, loadImage } from 'canvas';
import { createWriteStream, unlink } from 'fs';

import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { uploadImageBytempFilePath } from 'src/shared/utils/loadImage.util';
import { generateUUID } from 'src/shared/utils/generators.util';
import { RegisteredFace } from 'src/recognition/domain/entities/registeredFace.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CloudinaryService } from 'src/shared/cloudinary/cloudinary.service';
import { NotificationService } from 'src/notifications/application/services/notification.service';
import { UserService } from 'src/iam/application/services/user.service';
//import { Profile } from 'src/iam/domain/entities/profile.entity';
import { STATUS } from 'src/iam/domain/constants/status.contstant';
import { FaceRecognitionGateway } from 'src/shared/websocket/websocket.gateway';
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData } as any);
const ffmpegPath = require('ffmpeg-static');

@Injectable()
export class RecognitionService {
  private readonly logger = new Logger(RecognitionService.name);
  private recognizer: faceapi.FaceMatcher | null = null;
  private labeledDescriptors: faceapi.LabeledFaceDescriptors[] = [];

  private async loadModels() {
    const modelPath = path.resolve(__dirname, '../../../../public/models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelPath);
  }
  constructor(
    @InjectRepository(RegisteredFace)
    private readonly registeredFaceRepository: Repository<RegisteredFace>,
    private readonly userService: UserService,
    //private readonly profileRepository: Repository<Profile>,
    private readonly notificationService: NotificationService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly gateway: FaceRecognitionGateway,
  ) {
    ffmpeg.setFfmpegPath(ffmpegPath);
    this.loadModels()
      .then((_) => {
        console.log('Models loaded');
      })
      .catch((error) => {
        console.error('Error loading models: ', error);
      });
  }

  async getAll() {
    return this.registeredFaceRepository.find();
  }

  async getImageBuffer(imageUrl: string): Promise<Buffer> {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  }

  async addFaceToModel(
    userId: number,
    name: string,
    //imageBuffer: Buffer | null,
    frontalimageBuffer: Buffer | null,
    rightProfileBuffer: Buffer | null,
    leftProfileBuffer: Buffer | null,
    fromAboveBuffer: Buffer | null,
  ) {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) throw new Error('User not found');

      const buffers = [
        frontalimageBuffer,
        rightProfileBuffer,
        leftProfileBuffer,
        fromAboveBuffer,
      ];
      const loadAndDetect = async (buffer: Buffer | null) => {
        if (buffer) {
          const image: any = await loadImage(buffer);
          const detections = await faceapi
            .detectAllFaces(image)
            .withFaceLandmarks()
            .withFaceDescriptors();
          return detections.length > 0 ? detections[0].descriptor : null;
        }
        return null;
      };

      const descriptors = await Promise.all(buffers.map(loadAndDetect));
      const validDescriptors = descriptors.filter(
        (desc) => desc !== null,
      ) as Float32Array[];

      if (validDescriptors.length > 0) {
        const existingDescriptorIndex = this.labeledDescriptors.findIndex(
          (desc) => desc.label === userId.toString(),
        );

        if (existingDescriptorIndex !== -1) {
          this.labeledDescriptors[existingDescriptorIndex].descriptors.push(
            ...validDescriptors,
          );
        } else {
          const labeledFaceDescriptors = new faceapi.LabeledFaceDescriptors(
            userId.toString(),
            validDescriptors,
          );

          this.labeledDescriptors.push(labeledFaceDescriptors);
        }
        this.recognizer = new faceapi.FaceMatcher(this.labeledDescriptors);

        await this.registeredFaceRepository.update(
          {
            id: user.face.id,
          },
          {
            labeledDescriptors: JSON.stringify(this.labeledDescriptors),
          },
        );
      }
      return this.recognizer ? this.recognizer.labeledDescriptors : [];
    } catch (error) {
      console.log('Error adding face: ', error);
      throw new Error('Error adding face');
    }
  }

  /*
    frontal?.buffer ?? null,
      rightProfile?.buffer ?? null,
      leftProfile?.buffer ?? null,
      fromAbove?.buffer ?? null,
  */

  async saveFace(
    name: string,
    //imageBuffer: Buffer | null,
    frontalimageBuffer: Buffer | null,
    rightProfileBuffer: Buffer | null,
    leftProfileBuffer: Buffer | null,
    fromAboveBuffer: Buffer | null,

    userID: number,
  ) {
    try {
      //if (!imageBuffer) throw new Error('No image buffer provided');
      if (!name) throw new Error('No name provided');
      const user = await this.userService.getUserById(userID);
      if (!user) throw new Error('User not found');

      let imageUrl = '';
      let logoID = '';
      // if (imageBuffer) {
      //   const tempFilePath = join(tmpdir(), name);
      //   writeFileSync(tempFilePath, imageBuffer);

      //   logoID = generateUUID();
      //   imageUrl = await this.cloudinaryService.uploadFile({
      //     tempFilePath,
      //     logoID,
      //   });
      // }

      const status = !imageUrl ? STATUS.unverified : STATUS.verified;

      const auxRegisteredFace = {
        name,
        imageId: logoID ?? '',
        imageUrl: imageUrl ? imageUrl : '',
        labeledDescriptors: '',
        frontalFace: '',
        rightProfileFace: '',
        leftProfileFace: '',
        fromAboveFace: '',
        status: status,
      };

      /*
       frontalFace: string;
        @Column('longtext')
        rightProfileFace: string;

      @Column('longtext')
      leftProfileFace: string;

      @Column('longtext')
      fromAboveFace: string;
      */
      const registeredFace = this.registeredFaceRepository.create({
        ...auxRegisteredFace,
      });

      registeredFace.user = user;

      await this.registeredFaceRepository.save(registeredFace);

      const labeledDescriptors = await this.addFaceToModel(
        userID,
        name,
        //imageBuffer,
        frontalimageBuffer,
        rightProfileBuffer,
        leftProfileBuffer,
        fromAboveBuffer,
      );

      let profile = user.profile;

      if (labeledDescriptors.length > 0) {
        await this.userService.updateProfile(user.profile.id, {
          imageUrl: imageUrl,
          imageId: logoID,
          status: STATUS.verified,
        });
      }
      registeredFace.user.profile = profile;

      return registeredFace;
    } catch (error) {
      console.error('Error saving face: ', error);
      throw new Error('Error saving face');
    }
  }

  async recognizeFace(imageBuffer: Buffer) {
    try {
      // Paso 1: Obtener usuarios de la base de datos
      const faces = await this.registeredFaceRepository.find();

      // Paso 2: Cargar labeledDescriptors en FaceMatcher
      if (!this.recognizer) {
        const labeledFaceDescriptors = faces.map((face) => {
          // Convertir el string labeledDescriptors a JSON
          const labeledDescriptorsJson = JSON.parse(face.labeledDescriptors);
          const modifiedDescriptors = labeledDescriptorsJson.map(
            (descriptorObj) => {
              const descriptors = descriptorObj.descriptors.map(
                (descriptor) => new Float32Array(descriptor),
              );
              return {
                ...descriptorObj,
                descriptors: descriptors,
              };
            },
          );
          // Aquí se corrige la referencia a `descriptors` para que apunte a los descriptores modificados correctamente
          return new faceapi.LabeledFaceDescriptors(
            face.id.toString(),
            modifiedDescriptors.flatMap(
              (descriptorObj) => descriptorObj.descriptors,
            ),
          );
        });
        this.recognizer = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
      }

      // Cargar imagen y detectar rostros
      const image: any = await canvas.loadImage(imageBuffer);
      const detections = await faceapi
        .detectAllFaces(image)
        .withFaceLandmarks()
        .withFaceDescriptors();

      if (detections.length > 0) {
        // Paso 3: Realizar la detección y comparación
        const bestMatch = this.recognizer.findBestMatch(
          detections[0].descriptor,
        );

        // Paso 4: Devolver el resultado
        if (bestMatch) {
          const matchedUser = faces.find(
            (face) => face.id.toString() === bestMatch.label,
          );
          return matchedUser; // O cualquier información relevante del usuario
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async processAndRecordStream(streamURL: string): Promise<void> {
    try {
      ffmpeg(streamURL)
        .inputOptions(['-rtsp_transport', 'tcp'])
        .outputOptions(['-t 5', '-vf', 'fps=1/5'])
        .on('start', (commandLine) => {
          this.logger.log(`Spawned Ffmpeg with command: ${commandLine}`);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`An error occurred: ${err.message}`);
          this.logger.error(`ffmpeg stdout: ${stdout}`);
          this.logger.error(`ffmpeg stderr: ${stderr}`);
        })
        .on('end', async () => {
          this.logger.log('Processing finished!');
          const image = await loadImage(join(__dirname, 'frame.jpg'));
          const canvas = createCanvas(image.width, image.height);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const predictions: any = await this.recognizeFace(canvas.toBuffer());
          if (!predictions || predictions?.label === 'unknown') {
            this.notificationService.create({
              type: 'Not Verified',
              message: 'An unknown face was detected on the camera stream',
              timestamp: new Date(),
            });
            console.log('Unknown face detected!');
          } else {
            this.notificationService.create({
              type: 'Verified',
              message: `A face was detected on the camera stream: ${predictions?.name}`,
              timestamp: new Date(),
            });

            console.log(`Recognized face: ${predictions?.name}`);
          }
          unlink(join(__dirname, 'frame.jpg'), (err) => {
            if (err) console.error(err);
          });
        })
        .save(join(__dirname, 'frame.jpg'));
    } catch (error) {
      this.logger.error(`Failed to stream video: ${error.message}`);
    }
  }
  async getStream(streamURL: string): Promise<void> {
    try {
      ffmpeg(streamURL)
        .inputOptions(['-rtsp_transport', 'tcp'])
        .outputOptions('-t 5')
        .on('start', (commandLine) => {
          this.logger.log(`Spawned Ffmpeg with command: ${commandLine}`);
        })
        .on('error', (err, stdout, stderr) => {
          this.logger.error(`An error occurred: ${err.message}`);
          this.logger.error(`ffmpeg stdout: ${stdout}`);
          this.logger.error(`ffmpeg stderr: ${stderr}`);
        })
        .on('end', () => {
          this.logger.log('Processing finished!');
        })
        .save('testing.mp4');
    } catch (error) {
      this.logger.error(`Failed to stream video: ${error.message}`);
    }
  }

  async processVideo(streamURL: string): Promise<void> {
    try {
      ffmpeg(streamURL)
        .outputOptions('-f', 'image2pipe')
        .outputOptions('-vcodec', 'mjpeg')
        .outputOptions('-vf', 'fps=0.5')
        .on('start', (commandLine) => {
          this.logger.log(`Spawned Ffmpeg with command: ${commandLine}`);
        })
        .pipe()
        .on('data', async (chunk) => {
          const img = new Image();

          img.onload = async () => {
            const cnvs: any = createCanvas(img.width, img.height);
            const ctx = cnvs.getContext('2d');
            ctx.drawImage(img, 0, 0, img.width, img.height);

            console.time('detection');
            const detections = await faceapi
              .detectAllFaces(cnvs)
              .withFaceLandmarks()
              .withFaceDescriptors();
            console.timeEnd('detection');

            detections.length
              ? console.log('Face detected')
              : console.log('No face detected');
            //this.gateway.sendDetectionResult(detections);
          };

          img.onerror = (err) => {
            console.error('Error loading image:', err.message);
          };

          const base64Data = chunk.toString('base64');
          img.src = `data:image/jpeg;base64,${base64Data}`;
        })
        .on('error', (err) => {
          console.error('Error processing video:', err);
        });
    } catch (error) {
      console.error('Error processing video:', error.message);
    }
  }
}
