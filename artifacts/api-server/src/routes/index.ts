import { Router, type IRouter } from "express";
import healthRouter from "./health";
import matcherRouter from "./matcher";

const router: IRouter = Router();

router.use(healthRouter);
router.use(matcherRouter);

export default router;
