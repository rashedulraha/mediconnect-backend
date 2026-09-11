import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";

import { uploadCloudinary } from "../../lib/claudinary";
import { prisma } from "../../lib/prisma";

const uploadProfileImg = async (buffer: Buffer, userId: string) => {
  //*  current user
  const currentUser = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      imagePublicId: true,
      imageUrl: true,
    },
  });

  const cloudinaryResult = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      const uploadStream = uploadCloudinary.uploader.upload_stream(
        {
          resource_type: "image",
        },
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse | undefined,
        ) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error("Cloudinary upload failed"));
          }

          resolve(result);
        },
      );

      uploadStream.end(buffer);
    },
  );

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      imageUrl: cloudinaryResult.secure_url,
      imagePublicId: cloudinaryResult.public_id,
    },
    omit: {
      password: true,
    },
  });

  // deletion current user img in cloudinary db
  if (currentUser?.imagePublicId) {
    try {
      await uploadCloudinary.uploader.destroy(currentUser?.imagePublicId, {
        invalidate: true,
      });
    } catch (error) {
      const e = error as Error;
      throw new Error(e.message);
    }
  }

  return updatedUser;
};

export const userService = {
  uploadProfileImg,
};
