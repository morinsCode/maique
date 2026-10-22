import { Router } from "express";
import * as roomsController from "../controllers/rooms.controller.ts";

export const roomsRouter = Router();

roomsRouter.get("/:roomId/state", roomsController.getState);
roomsRouter.post("/:roomId/requests", roomsController.submitRequest);
roomsRouter.post("/:roomId/playlist", roomsController.addToPlaylist);
roomsRouter.post("/:roomId/approve", roomsController.approveRequest);
roomsRouter.post("/:roomId/reject", roomsController.rejectRequest);
