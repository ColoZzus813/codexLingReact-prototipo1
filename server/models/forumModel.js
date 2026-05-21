import { readDatabase, writeDatabase } from "../config/database.js";

function nextTopicId(topics) {
  return topics.length > 0 ? Math.max(...topics.map((topic) => topic.id)) + 1 : 1;
}

function nextCommentId(comments) {
  return comments.length > 0 ? Math.max(...comments.map((comment) => comment.id)) + 1 : 1;
}

function findUser(database, userId) {
  return database.users.find((user) => user.id === userId);
}

export async function listForumTopics() {
  const database = await readDatabase();
  return database.forumTopics || [];
}

export async function getForumTopicById(topicId) {
  const database = await readDatabase();
  const topics = database.forumTopics || [];
  return topics.find((topic) => topic.id === topicId) || null;
}

export async function createForumTopic(userId, title, body) {
  const database = await readDatabase();
  const user = findUser(database, userId);

  if (!user) {
    return { error: "USER_NOT_FOUND" };
  }

  const now = new Date().toISOString();
  const topics = database.forumTopics || [];
  const topic = {
    id: nextTopicId(topics),
    title: String(title || "").trim(),
    body: String(body || "").trim(),
    authorId: user.id,
    authorName: user.name,
    createdAt: now,
    updatedAt: now,
    comments: []
  };

  topics.push(topic);
  database.forumTopics = topics;
  await writeDatabase(database);

  return { topic };
}

export async function createForumComment(userId, topicId, message) {
  const database = await readDatabase();
  const user = findUser(database, userId);

  if (!user) {
    return { error: "USER_NOT_FOUND" };
  }

  const topics = database.forumTopics || [];
  const topic = topics.find((currentTopic) => currentTopic.id === topicId);

  if (!topic) {
    return { error: "TOPIC_NOT_FOUND" };
  }

  const now = new Date().toISOString();
  const comment = {
    id: nextCommentId(topic.comments || []),
    authorId: user.id,
    authorName: user.name,
    message: String(message || "").trim(),
    createdAt: now
  };

  topic.comments = topic.comments || [];
  topic.comments.push(comment);
  topic.updatedAt = now;
  database.forumTopics = topics;

  await writeDatabase(database);

  return { topic, comment };
}

export async function updateForumTopic(topicId, updates) {
  const database = await readDatabase();
  const topics = database.forumTopics || [];
  const index = topics.findIndex((topic) => topic.id === topicId);

  if (index === -1) {
    return null;
  }

  const topic = {
    ...topics[index],
    ...updates,
    title: typeof updates.title === "string" ? updates.title.trim() : topics[index].title,
    body: typeof updates.body === "string" ? updates.body.trim() : topics[index].body,
    updatedAt: new Date().toISOString()
  };

  topics[index] = topic;
  database.forumTopics = topics;

  await writeDatabase(database);
  return topic;
}

export async function deleteForumTopic(topicId) {
  const database = await readDatabase();
  const topics = database.forumTopics || [];
  const index = topics.findIndex((topic) => topic.id === topicId);

  if (index === -1) {
    return false;
  }

  topics.splice(index, 1);
  database.forumTopics = topics;

  await writeDatabase(database);
  return true;
}

export async function deleteForumComment(topicId, commentId) {
  const database = await readDatabase();
  const topics = database.forumTopics || [];
  const topic = topics.find((currentTopic) => currentTopic.id === topicId);

  if (!topic) {
    return { error: "TOPIC_NOT_FOUND" };
  }

  const comments = topic.comments || [];
  const commentIndex = comments.findIndex((comment) => comment.id === commentId);

  if (commentIndex === -1) {
    return { error: "COMMENT_NOT_FOUND" };
  }

  comments.splice(commentIndex, 1);
  topic.comments = comments;
  topic.updatedAt = new Date().toISOString();
  database.forumTopics = topics;

  await writeDatabase(database);
  return { topic };
}
