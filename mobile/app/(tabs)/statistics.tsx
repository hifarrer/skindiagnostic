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
} from 'react-native';
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
      const results = await skinAnalysisService.getHistory();
      setHistory(results || []);
    } catch (error: any) {
      console.error('Error fetching history:', error);
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
            <ActivityIndicator size="large" color={Colors.primary.orange} />
            <Text style={styles.loadingText}>Loading your statistics...</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>No Analysis History</Text>
            <Text style={styles.cardSubtitle}>
              Start by analyzing your skin on the Skin Analysis page to see your statistics here.
            </Text>
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => router.push('/(tabs)/skin-analysis')}
            >
              <Text style={styles.ctaButtonText}>Go to Skin Analysis</Text>
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
    backgroundColor: Colors.background.lightBlue,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.darkBlue,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.gray.dark,
  },
  content: {
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  cardSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary.orange,
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: Colors.gray.light,
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.green,
    borderRadius: 5,
  },
  lastAnalysisText: {
    fontSize: 12,
    color: Colors.gray.dark,
    marginTop: 10,
    fontStyle: 'italic',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: Colors.gray.dark,
  },
  ctaButton: {
    backgroundColor: Colors.primary.orange,
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyItem: {
    backgroundColor: Colors.background.lightBlue,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Colors.gray.light,
  },
  historyItemHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  historyItemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 15,
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  historyItemScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItemScoreLabel: {
    fontSize: 12,
    color: Colors.gray.dark,
    marginRight: 5,
  },
  historyItemScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary.orange,
  },
  historyItemScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  historyScoreChip: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray.light,
    marginRight: 6,
    marginBottom: 6,
  },
  historyScoreChipLabel: {
    fontSize: 11,
    color: Colors.gray.dark,
    marginRight: 4,
  },
  historyScoreChipValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Colors.primary.orange,
  },
  moreScoresText: {
    fontSize: 11,
    color: Colors.gray.dark,
    fontStyle: 'italic',
    alignSelf: 'center',
    marginLeft: 8,
  },
});
