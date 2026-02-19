import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/Colors';
import { skinAnalysisService } from '../../services/skinAnalysisService';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';

interface SkinAnalysisResult {
  id: number;
  task_id: string;
  image_url: string;
  scores: Record<string, any>;
  maskUrls?: Record<string, string>;
  originalImageUrl?: string;
  resultUrl?: string;
  createdAt: string;
  metadata?: any;
}

export default function StatisticsScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<SkinAnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    try {
      console.log('[Statistics] Fetching skin analysis history...');
      const results = await skinAnalysisService.getHistory();
      console.log('[Statistics] Received results:', results?.length || 0, 'items');
      if (results && results.length > 0) {
        console.log('[Statistics] First result sample:', {
          id: results[0].id,
          hasScores: !!results[0].scores,
          scoresCount: results[0].scores ? Object.keys(results[0].scores).length : 0,
          createdAt: results[0].createdAt,
        });
      }
      setHistory(results || []);
    } catch (error: any) {
      console.error('[Statistics] Error fetching history:', error);
      console.error('[Statistics] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      // Still set empty array to show "no results" message
      setHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [user, token]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory();
  };

  const calculateOverallScore = (scores: Record<string, any>): number => {
    if (!scores || Object.keys(scores).length === 0) return 0;

    let totalScore = 0;
    let count = 0;

    Object.values(scores).forEach((scoreData: any) => {
      let score = 0;
      if (typeof scoreData === 'object' && scoreData !== null) {
        score = scoreData.ui_score || scoreData.score || scoreData.value || 0;
      } else if (typeof scoreData === 'number') {
        score = scoreData;
      }

      // Normalize score to 0-100 if needed (assuming scores might be in different ranges)
      if (score > 0) {
        // If score is already 0-100, use as is; otherwise normalize
        if (score <= 1) {
          score = score * 100;
        } else if (score > 100) {
          score = 100;
        }
        totalScore += score;
        count++;
      }
    });

    return count > 0 ? Math.round(totalScore / count) : 0;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatScoreKey = (key: string): string => {
    return key
      .replace(/_/g, ' ')
      .replace(/hd /g, '')
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getScoreValue = (scoreData: any): string => {
    if (typeof scoreData === 'object' && scoreData !== null) {
      if (scoreData.ui_score !== undefined) {
        return `${scoreData.ui_score}`;
      } else if (scoreData.score !== undefined) {
        return `${scoreData.score}`;
      } else if (scoreData.value !== undefined) {
        return String(scoreData.value);
      }
      return 'N/A';
    }
    return String(scoreData);
  };

  if (!user || !token) {
    return (
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Statistics</Text>
          <Text style={styles.headerSubtitle}>Your skin health insights</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardSubtitle}>Please login to view your statistics</Text>
          </View>
        </View>
      </ScrollView>
    );
  }

  const latestResult = history.length > 0 ? history[0] : null;
  const overallScore = latestResult ? calculateOverallScore(latestResult.scores) : 0;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Statistics</Text>
        <Text style={styles.headerSubtitle}>Your skin health insights</Text>
      </View>

      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.landing.purple} />
            <Text style={styles.loadingText}>Loading your statistics...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No Analysis History</Text>
            <Text style={styles.cardSubtitle}>
              Start by analyzing your skin on the Skin Analysis page to see your statistics here.
            </Text>
            <TouchableOpacity
              style={styles.ctaButtonWrap}
              onPress={() => router.push('/(tabs)/skin-analysis')}
              activeOpacity={0.86}
            >
              <LinearGradient
                colors={Colors.landing.gradientPurplePink}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.ctaButton}
              >
                <Text style={styles.ctaButtonText}>Go to Skin Analysis</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Overall Health Score Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Overall Health Score</Text>
              <Text style={styles.scoreValue}>{overallScore}%</Text>
              <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${overallScore}%` }]} />
              </View>
              {latestResult && (
                <Text style={styles.lastAnalysisText}>
                  Last analysis: {formatDate(latestResult.createdAt)}
                </Text>
              )}
            </View>

            {/* Analysis History */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Analysis History</Text>
              <Text style={styles.cardSubtitle}>
                {history.length} analysis{history.length !== 1 ? 'es' : ''} completed
              </Text>

              {history.map((result) => {
                const resultScore = calculateOverallScore(result.scores);
                const scoreEntries = Object.entries(result.scores || {}).slice(0, 5);

                return (
                  <TouchableOpacity
                    key={result.id}
                    style={styles.historyItem}
                    onPress={() => router.push('/(tabs)/skin-analysis')}
                  >
                    <View style={styles.historyItemHeader}>
                      <View style={styles.historyItemImageContainer}>
                        {result.originalImageUrl || result.image_url ? (
                          <Image
                            source={{ uri: result.originalImageUrl || result.image_url }}
                            style={styles.historyItemImage}
                          />
                        ) : (
                          <View style={styles.historyItemImagePlaceholder}>
                            <Text style={styles.historyItemImageIcon}>📷</Text>
                          </View>
                        )}
                      </View>
                      <View style={styles.historyItemContent}>
                        <Text style={styles.historyItemDate}>
                          {formatDate(result.createdAt)}
                        </Text>
                        <View style={styles.historyItemScoreContainer}>
                          <Text style={styles.historyItemScoreLabel}>Score:</Text>
                          <Text style={styles.historyItemScoreValue}>{resultScore}%</Text>
                        </View>
                      </View>
                    </View>

                    {scoreEntries.length > 0 && (
                      <View style={styles.historyItemScores}>
                        {scoreEntries.map(([key, value]) => (
                          <View key={key} style={styles.historyScoreChip}>
                            <Text style={styles.historyScoreChipLabel}>
                              {formatScoreKey(key)}
                            </Text>
                            <Text style={styles.historyScoreChipValue}>
                              {getScoreValue(value)}
                            </Text>
                          </View>
                        ))}
                        {Object.keys(result.scores || {}).length > 5 && (
                          <Text style={styles.moreScoresText}>
                            +{Object.keys(result.scores || {}).length - 5} more
                          </Text>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7fbff',
  },
  header: {
    paddingTop: 36,
    paddingBottom: 22,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255,255,255,.92)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.landing.cardBorder,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  headerSubtitle: {
    fontSize: 15,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  content: {
    padding: 24,
  },
  card: {
    borderRadius: 26,
    padding: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.landing.cardBorder,
    shadowColor: '#1f2430',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 28,
    elevation: 4,
    ...(Platform.OS === 'web'
      ? {
          backgroundImage: 'linear-gradient(180deg, rgba(255,255,255,.95), rgba(247,245,255,.9))',
          boxShadow: '0 14px 30px rgba(31,36,48,.10)',
        } as any
      : { backgroundColor: 'rgba(255,255,255,.92)' }),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.landing.dark,
    marginBottom: 12,
    fontFamily: Colors.landing.fontFamily,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.landing.muted,
    marginBottom: 6,
    fontFamily: Colors.landing.fontFamily,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '800',
    color: Colors.landing.purple,
    marginBottom: 14,
    fontFamily: Colors.landing.fontFamily,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: 'rgba(123,92,255,.15)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.landing.purple,
    borderRadius: 999,
  },
  lastAnalysisText: {
    fontSize: 12,
    color: Colors.landing.muted,
    marginTop: 10,
    fontFamily: Colors.landing.fontFamily,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.landing.muted,
    fontFamily: Colors.landing.fontFamily,
  },
  ctaButtonWrap: {
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 16,
    shadowColor: Colors.landing.purple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 3,
  },
  ctaButton: {
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: Colors.landing.fontFamily,
  },
  historyItem: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(123,92,255,.25)',
    backgroundColor: 'rgba(247,245,255,.6)',
  },
  historyItemHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  historyItemImageContainer: {
    width: 52,
    height: 52,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 12,
  },
  historyItemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  historyItemImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.gray.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyItemImageIcon: {
    fontSize: 24,
  },
  historyItemContent: {
    flex: 1,
    justifyContent: 'center',
  },
  historyItemDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.landing.dark,
    marginBottom: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  historyItemScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemScoreLabel: {
    fontSize: 12,
    color: Colors.landing.muted,
    marginRight: 5,
    fontFamily: Colors.landing.fontFamily,
  },
  historyItemScoreValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.landing.purple,
    fontFamily: Colors.landing.fontFamily,
  },
  historyItemScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  historyScoreChip: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,.95)',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(123,92,255,.18)',
    marginRight: 4,
    marginBottom: 4,
  },
  historyScoreChipLabel: {
    fontSize: 11,
    color: Colors.landing.muted,
    marginRight: 4,
    fontFamily: Colors.landing.fontFamily,
  },
  historyScoreChipValue: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.landing.purple,
    fontFamily: Colors.landing.fontFamily,
  },
  moreScoresText: {
    fontSize: 11,
    color: Colors.landing.muted,
    alignSelf: 'center',
    marginLeft: 8,
    fontFamily: Colors.landing.fontFamily,
  },
});
