import { Router } from "express";
import { jwtRequired } from '@app/middlewares/global_middleware';

import AvailabilityController  from "@app/controllers/availability_controller";

const router = Router();

router.get("/hours/:productId/:date", jwtRequired, AvailabilityController.getAvailableHours);
router.get("/:productId", jwtRequired, AvailabilityController.getAvailableDates);

export default router;
