import { AuthRequest } from "@app/middlewares/global_middleware";
import { Response } from "express";
import uploadService from "@app/services/upload_services";
import Queue from "@app/jobs/lib/queue";

class UploadController {

  async uploadUserProfileImage(req: AuthRequest, res: Response) {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    try {
      await Queue.add("uploadUserProfileImage", {
        localFilePath: req.file.path,
        userId: req.userId!,
      }, { priority: 3 });

      return res.status(202).json({ message: "Upload da imagem de perfil agendado com sucesso." });
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: error.message || "Internal Server Error" });
    }
  }
}

export default new UploadController();
