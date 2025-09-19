"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageLayout from "@/components/PageLayout";
import AuthGuard from "@/components/AuthGuard";
import { authService } from "@/services/authService";
import styles from "./ranking.module.scss";

// Tipado del usuario en el ranking
interface UserRank {
  id: string;
  first_name: string;
  last_name: string;
  specialty?: string;
  aura: number;
  rank: number;
}

export default function Ranking() {
  const router = useRouter();
  const [ranking, setRanking] = useState<UserRank[]>([]);
  const [userRank, setUserRank] = useState<UserRank | null>(null);
  const [search, setSearch] = useState<string>("");

  // Función de debounce para evitar fetch en cada letra
  const debounce = (fn: Function, delay: number) => {
    let timer: NodeJS.Timeout;
    return (...args: any) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  };

  const fetchRanking = async (searchTerm: string) => {
    try {
      const data = await authService.getRanking(searchTerm);
      setRanking(data.ranking);
      setUserRank(data.user_rank || null);
    } catch (err) {
      console.error(err);
    }
  };

  // Debounced version de fetchRanking
  const debouncedFetch = useCallback(debounce(fetchRanking, 400), []);

  useEffect(() => {
    debouncedFetch(search);
  }, [search, debouncedFetch]);

  // Filtrado local de ranking
  const filteredRanking = ranking.filter((user) =>
    `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Redirige al perfil del usuario
  const goToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <AuthGuard>
      <Sidebar />
      <PageLayout title="Ranking">
        <div className={styles.rankingContainer}>
          {userRank && (
            <div className={styles.userStats}>
              <h3>Your Current Rank</h3>
              <div className={styles.currentUserCard}>
                <span className={styles.userName}>
                  {userRank.first_name} {userRank.last_name}
                </span>
                <span className={styles.userSpecialty}>
                  {userRank.specialty || "No definida"}
                </span>
                <div className={styles.rankDisplay}>
                  <span className={styles.rankNumber}>#{userRank.rank}</span>
                  <span className={styles.rankPoints}>
                    {userRank.aura} aura
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Buscar alumno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className={styles.leaderboard}>
            <h3>Global Leaderboard</h3>
            <div className={styles.leaderboardList}>
              {filteredRanking.map((user) => (
                <div
                  key={user.id}
                  className={`${styles.leaderboardItem} ${
                    userRank && user.id === userRank.id
                      ? styles.currentUser
                      : ""
                  }`}
                  onClick={() => goToProfile(user.id)}
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.userRank}>
                    <span className={styles.rankText}>#{user.rank}</span>
                  </div>
                  <span className={styles.userName}>
                    {user.first_name} {user.last_name}
                  </span>
                  <span className={styles.userPoints}>{user.aura} aura</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    </AuthGuard>
  );
}
