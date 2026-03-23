import { Router, type IRouter } from "express";
import analyzeRouter from "./analyze";
import sessionsRouter from "./sessions";

const router: IRouter = Router();

router.use("/matcher", analyzeRouter);
router.use("/matcher", sessionsRouter);

export default router;
