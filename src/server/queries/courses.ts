import { db } from "@/server/db";

import { StudentGame, User } from "@/server/db/schema";
import { GameTypeI, LeaderBoardI } from "@/types/Course";
import { and, eq, desc, sql, isNotNull } from "drizzle-orm";
import { isSameDay, subDays } from "date-fns";

export const recordStudentSection = async (data: {
  StudentId: string;
  GameId: string;
  Score: string;
  GameTitle: string;
  GameType: string;
  MissedQuestions: string;
  StartedOn: string;
  CompletedOn: string;
  Stars: number;
}) => {
  const today = new Date();
  const yesterday = subDays(today, 1);

  // Fetch the latest game by this student
  const lastGame = await db.query.StudentGame.findFirst({
    where: eq(StudentGame.StudentId, data.StudentId),
    orderBy: [desc(StudentGame.StartedOn)],
  });

  let newStreak = 1;

  if (lastGame) {
    const lastDate = new Date(lastGame.StartedOn);

    if (isSameDay(lastDate, today)) {
      newStreak = lastGame.CurrentStreak ?? 1; // already counted today
    } else if (isSameDay(lastDate, yesterday)) {
      newStreak = (lastGame.CurrentStreak ?? 0) + 1;
    }
  }

  const result = await db
    .insert(StudentGame)
    .values({
      ...data,
      CurrentStreak: newStreak,
    })
    .returning({
      Id: StudentGame.Id,
    });

  return result;
};

export const getGameTypes = async (): Promise<GameTypeI[]> => {
  const GameTypes = await db.query.GameType.findMany({
    columns: {
      Id: true,
      Name: true,
      gameFormat: true,
      Subject: true,
      AIGenerated: true,
    },
  });
  return GameTypes.map((gt) => ({
    ...gt,
    gameFormat: gt.gameFormat ?? "",
  }));
};


export const getStudentGame = async (data: {
  studentId: string;
  GameId: string;
}) => {
  const result = await db.query.StudentGame.findMany({
    where: (StudentGame, { eq, and }) =>
      and(
        eq(StudentGame.StudentId, data.studentId),
        eq(StudentGame.GameId, data.GameId)
      ),
  });
  return result;
};

export const GetLeaderBoard = async ({
  userId,
  GameId,
  range,
}: {
  userId: string | null;
  GameId: string;
  range: string;
}) => {
  // Validate inputs
  if (!GameId || typeof GameId !== "string") {
    throw new Error("Invalid GameId provided");
  }

  // Basic UUID validation
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(GameId)) {
    throw new Error(`Invalid UUID format for GameId: ${GameId}`);
  }
  // Date range filtering
  let dateFilter = sql`TRUE`;
  const now = new Date();

  if (range === "today") {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    dateFilter = sql`${StudentGame.CompletedOn} >= ${startOfDay}`;
  } else if (range === "week") {
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    startOfWeek.setHours(0, 0, 0, 0);
    dateFilter = sql`${StudentGame.CompletedOn} >= ${startOfWeek}`;
  }

  // Create aggregated user stats
  const userStats = await db
    .select({
      id: User.Id,
      name: User.FullName,
      profilePicture: User.ImageUrl,
      totalScore: sql<number>`SUM(COALESCE(${StudentGame.Score}, 0))`.as(
        "totalScore"
      ),
      totalPoints: sql<number>`SUM(COALESCE(${StudentGame.Stars}, 0))`.as(
        "totalPoints"
      ),
      gamesPlayed: sql<number>`COUNT(*)`.as("gamesPlayed"),
      averageScore: sql<number>`AVG(COALESCE(${StudentGame.Score}, 0))`.as(
        "averageScore"
      ),
      lastCompletedOn: sql<string>`MAX(${StudentGame.CompletedOn})`.as(
        "lastCompletedOn"
      ),
    })
    .from(StudentGame)
    .innerJoin(User, eq(StudentGame.StudentId, User.Id))
    .where(
      and(
        eq(StudentGame.GameId, GameId),
        isNotNull(StudentGame.CompletedOn),
        dateFilter
      )
    )
    .groupBy(User.Id, User.FullName, User.ImageUrl);

  // Add ranking and sort
  const rankedUsers = userStats
    .map((user) => ({
      ...user,
      rank: 0, // Will be set after sorting
    }))
    .sort((a, b) => {
      // Primary sort: totalPoints (stars) descending
      if (b.totalPoints !== a.totalPoints) {
        return b.totalPoints - a.totalPoints;
      }
      // Secondary sort: totalScore descending
      return b.averageScore - a.averageScore;
    })
    .map((user, index) => ({
      ...user,
      rank: index + 1,
    }));

  // Get top 10 users
  const top10Users = rankedUsers.slice(0, 10);

  let userRank: number | null = null;
  let userData: LeaderBoardI | null = null;

  // If userId is provided, find user's data and rank
  if (userId) {
    const userIndex = rankedUsers.findIndex((user) => user.id === userId);
    if (userIndex !== -1) {
      const user = rankedUsers[userIndex];
      userRank = user.rank;
      userData = {
        id: user.id,
        name: user.name,
        score: user.totalScore,
        completedOn: user.lastCompletedOn || "",
        profilePicture:
          user.profilePicture ||
          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
            user.name
          )}`,
        totalPoints: user.totalPoints,
        gamesPlayed: user.gamesPlayed,
        averageScore: user.averageScore,
        rank: user.rank,
      };
    }
  }

  // Process leaderboard results
  const leaderboard = top10Users.map((user) => ({
    id: user.id,
    name: user.name,
    score: user.totalScore,
    completedOn: user.lastCompletedOn || "",
    profilePicture:
      user.profilePicture ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
        user.name
      )}`,
    totalPoints: user.totalPoints,
    gamesPlayed: user.gamesPlayed,
    averageScore: user.averageScore,
    rank: user.rank,
  }));

  // If user exists but is not in top 10, add them to the end of leaderboard
  if (userData && userRank && userRank > 10) {
    leaderboard.push(userData);
  }

  return {
    leaderboard,
    userRank,
    userData,
  };
};
