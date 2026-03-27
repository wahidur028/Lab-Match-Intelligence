import { Router, type IRouter } from "express";
import analyzeRouter from "./analyze";
import sessionsRouter from "./sessions";
import scrapeRouter from "./scrape";
import parseCvRouter from "./parse-cv";

const router: IRouter = Router();

router.use("/matcher", parseCvRouter);
router.use("/matcher", scrapeRouter);
router.use("/matcher", analyzeRouter);
router.use("/matcher", sessionsRouter);

export default router;
