import { Router } from "express";
import uploadController from "@app/controllers/upload_controller";
import { uploadImages } from "@app/middlewares/upload_middlewares";
import { jwtRequired } from "@app/middlewares/global_middleware";

const uploadRoutes = Router();

uploadRoutes.post("/imageUser", jwtRequired, uploadImages.single("image"), uploadController.uploadUserProfileImage);

export default uploadRoutes;
