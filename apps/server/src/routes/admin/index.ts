import { Router } from "express";
import dashboardRouter from "./dashboard";
import ordersRouter from "./orders";
import customRequestsRouter from "./custom-requests";
import productsRouter from "./products";
import customersRouter from "./customers";
import collectionsRouter from "./collections";
import categoriesRouter from "./categories";
import carouselRouter from "./carousel";
import homepageSectionsRouter from "./homepage-sections";
import reviewsRouter from "./reviews";
import tasksRouter from "./tasks";
import teamRouter from "../team";

const router = Router();

router.use(dashboardRouter);
router.use(ordersRouter);
router.use(customRequestsRouter);
router.use(productsRouter);
router.use(customersRouter);
router.use(collectionsRouter);
router.use(categoriesRouter);
router.use(carouselRouter);
router.use(homepageSectionsRouter);
router.use(reviewsRouter);
router.use(tasksRouter);
router.use("/team", teamRouter);

export default router;