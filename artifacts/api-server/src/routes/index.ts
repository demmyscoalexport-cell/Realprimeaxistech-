import { Router, type IRouter } from "express";
import healthRouter from "./health";
import homeRouter from "./home";
import articlesRouter from "./articles";
import categoriesRouter from "./categories";
import authorsRouter from "./authors";
import reviewsRouter from "./reviews";
import videosRouter from "./videos";
import newslettersRouter from "./newsletters";
import podcastRouter from "./podcast";

const router: IRouter = Router();

router.use(healthRouter);
router.use(homeRouter);
router.use(articlesRouter);
router.use(categoriesRouter);
router.use(authorsRouter);
router.use(reviewsRouter);
router.use(videosRouter);
router.use(newslettersRouter);
router.use(podcastRouter);

export default router;
