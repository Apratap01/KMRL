import { s3 } from "../routes/docs.routes";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import axios from "axios";
import fs from "fs";

export async function getSignedDownloadUrl(bucket, key) {
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export async function downloadFileFromSignedUrl(signedUrl, destPath) {
  const writer = fs.createWriteStream(destPath);
  const response = await axios({
    url: signedUrl,
    method: "GET",
    responseType: "stream",
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => resolve(destPath));
    writer.on("error", reject);
  });
}
