import { ApiError } from "../utils/ApiError.js";
import {
  listForumTopics,
  getForumTopicById,
  createForumTopic,
  createForumComment
} from "../models/forumModel.js";

export async function getTopics(req, res, next) {
  try {
    const topics = await listForumTopics();
    const response = topics.map((topic) => ({
      id: topic.id,
      title: topic.title,
      authorName: topic.authorName,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      commentCount: (topic.comments || []).length,
      preview: String(topic.body || "").slice(0, 220)
    }));

    res.json({ data: response });
  } catch (error) {
    next(error);
  }
}

export async function getTopic(req, res, next) {
  try {
    const topicId = Number(req.params.topicId);

    if (!Number.isInteger(topicId) || topicId <= 0) {
      throw new ApiError(400, "El id del tema debe ser un numero entero positivo.");
    }

    const topic = await getForumTopicById(topicId);

    if (!topic) {
      throw new ApiError(404, "Tema no encontrado.");
    }

    res.json({ data: topic });
  } catch (error) {
    next(error);
  }
}

export async function postTopic(req, res, next) {
  try {
    const { userId, title, message } = req.body;

    if (!userId || !title || !message) {
      throw new ApiError(400, "Debe proporcionar usuario, titulo y mensaje para crear un tema.");
    }

    const result = await createForumTopic(Number(userId), title, message);

    if (result.error === "USER_NOT_FOUND") {
      throw new ApiError(401, "Debe iniciar sesion con un usuario valido.");
    }

    res.status(201).json({ message: "Tema creado correctamente.", data: result.topic });
  } catch (error) {
    next(error);
  }
}

export async function postComment(req, res, next) {
  try {
    const topicId = Number(req.params.topicId);
    const { userId, message } = req.body;

    if (!Number.isInteger(topicId) || topicId <= 0) {
      throw new ApiError(400, "El id del tema debe ser un numero entero positivo.");
    }

    if (!userId || !message) {
      throw new ApiError(400, "Debe proporcionar usuario y mensaje para comentar.");
    }

    const result = await createForumComment(Number(userId), topicId, message);

    if (result.error === "USER_NOT_FOUND") {
      throw new ApiError(401, "Debe iniciar sesion con un usuario valido.");
    }

    if (result.error === "TOPIC_NOT_FOUND") {
      throw new ApiError(404, "Tema no encontrado.");
    }

    res.status(201).json({ message: "Comentario agregado correctamente.", data: result.topic });
  } catch (error) {
    next(error);
  }
}
