import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import citiesRouter from "./cities";
import activitiesRouter from "./activities";
import tripsRouter from "./trips";
import stopsRouter from "./stops";
import checklistRouter from "./checklist";
import notesRouter from "./notes";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(citiesRouter);
router.use(activitiesRouter);
router.use(tripsRouter);
router.use(stopsRouter);
router.use(checklistRouter);
router.use(notesRouter);
router.use(analyticsRouter);

export default router;
