import { Router } from "express";
import {
  getTopics,
  getTopic,
  postTopic,
  postComment
} from "../controllers/forumController.js";

const router = Router();

router.get("/topics", getTopics);
router.get("/topics/:topicId", getTopic);
router.post("/topics", postTopic);
router.post("/topics/:topicId/comments", postComment);

export default router;
