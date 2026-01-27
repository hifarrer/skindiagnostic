import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export default function ProgressScreen() {
  const [selectedYear, setSelectedYear] = useState(2022);
  const [selectedMonth, setSelectedMonth] = useState(3); // APR (0-indexed: 3)
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('monthly');

  const insights = [
    {
      label: 'Skin feeling',
      description: 'Mostly dehydrated',
      change: { value: 23, direction: 'up' },
      april: 90,
      march: 67,
    },
    {
      label: 'Your feeling',
      description: 'Mostly meeh',
      change: { value: 3, direction: 'down' },
      april: 47,
      march: 50,
    },
    {
      label: 'Routines',
      description: '10/30 days done',
      change: null,
      april: 78,
      march: 78,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'daily' && styles.tabActive]}
            onPress={() => setActiveTab('daily')}
          >
            <Text style={[styles.tabText, activeTab === 'daily' && styles.tabTextActive]}>
              Daily progress
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'monthly' && styles.tabActive]}
            onPress={() => setActiveTab('monthly')}
          >
            <Text style={[styles.tabText, activeTab === 'monthly' && styles.tabTextActive]}>
              Monthly progress
            </Text>
            {activeTab === 'monthly' && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        </View>

        {/* Year Navigation */}
        <View style={styles.yearContainer}>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear - 1)}>
            <Text style={styles.yearArrow}>←</Text>
          </TouchableOpacity>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <TouchableOpacity onPress={() => setSelectedYear(selectedYear + 1)}>
            <Text style={styles.yearArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
          {MONTHS.map((month, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.monthPill,
                selectedMonth === index && styles.monthPillActive,
              ]}
              onPress={() => setSelectedMonth(index)}
            >
              <Text
                style={[
                  styles.monthText,
                  selectedMonth === index && styles.monthTextActive,
                ]}
              >
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.content}>
        {/* Total Score Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your total score</Text>
          <Text style={styles.scoreText}>Perfect 9%</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: '9%' }]} />
          </View>
          <Text style={styles.disclaimerText}>
            You haven't completed enough activities. Your results may be different from the reality.
          </Text>
        </View>

        {/* Your Insights Card */}
        <View style={styles.card}>
          <View style={styles.insightsHeader}>
            <View style={styles.insightsTitleRow}>
              <Text style={styles.cardTitle}>Your insights</Text>
              <Text style={styles.starIcon}>⭐</Text>
            </View>
            <Text style={styles.insightsSubtitle}>See how your skin changing</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </View>

          {insights.map((insight, index) => (
            <View key={index} style={styles.insightItem}>
              <View style={styles.insightHeader}>
                <View>
                  <Text style={styles.insightLabel}>{insight.label}</Text>
                  <Text style={styles.insightDescription}>{insight.description}</Text>
                </View>
                {insight.change && (
                  <View style={styles.changeContainer}>
                    {insight.change.direction === 'up' ? (
                      <Text style={styles.changeUp}>↑ {insight.change.value}%</Text>
                    ) : (
                      <Text style={styles.changeDown}>↓ {insight.change.value}%</Text>
                    )}
                  </View>
                )}
                {!insight.change && (
                  <Text style={styles.noChange}>No changes</Text>
                )}
              </View>

              <View style={styles.monthComparison}>
                <View style={styles.monthData}>
                  <Text style={styles.monthLabel}>April</Text>
                  <View style={styles.monthProgressBarContainer}>
                    <View
                      style={[
                        styles.monthProgressBar,
                        {
                          width: `${insight.april}%`,
                          backgroundColor:
                            insight.label === 'Skin feeling'
                              ? Colors.accent.green
                              : insight.label === 'Your feeling'
                              ? Colors.accent.red
                              : Colors.accent.yellow,
                        },
                      ]}
                    />
                  </View>
                </View>
                <View style={styles.monthData}>
                  <Text style={styles.monthLabel}>March</Text>
                  <View style={styles.monthProgressBarContainer}>
                    <View
                      style={[
                        styles.monthProgressBar,
                        {
                          width: `${insight.march}%`,
                          backgroundColor: Colors.primary.orange,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: Colors.white,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    marginRight: 30,
    paddingBottom: 10,
  },
  tabActive: {
    position: 'relative',
  },
  tabText: {
    fontSize: 16,
    color: Colors.gray.dark,
    fontWeight: '500',
  },
  tabTextActive: {
    color: Colors.text.darkBlue,
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary.orange,
  },
  yearContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  yearArrow: {
    fontSize: 20,
    color: Colors.text.darkBlue,
    paddingHorizontal: 15,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.darkBlue,
    minWidth: 60,
    textAlign: 'center',
  },
  monthScroll: {
    paddingHorizontal: 10,
  },
  monthPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    backgroundColor: 'transparent',
  },
  monthPillActive: {
    backgroundColor: Colors.primary.orange,
  },
  monthText: {
    fontSize: 14,
    color: Colors.gray.dark,
    fontWeight: '500',
  },
  monthTextActive: {
    color: Colors.white,
    fontWeight: '600',
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
    marginBottom: 10,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.gray.light,
    borderRadius: 4,
    marginBottom: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.green,
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 12,
    color: Colors.gray.dark,
    fontStyle: 'italic',
  },
  insightsHeader: {
    marginBottom: 20,
  },
  insightsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  starIcon: {
    fontSize: 18,
    marginLeft: 8,
  },
  insightsSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 5,
  },
  arrowIcon: {
    fontSize: 20,
    color: Colors.gray.dark,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  insightItem: {
    marginBottom: 25,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.light,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  insightLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  insightDescription: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeUp: {
    fontSize: 14,
    color: Colors.accent.green,
    fontWeight: '600',
  },
  changeDown: {
    fontSize: 14,
    color: Colors.accent.red,
    fontWeight: '600',
  },
  noChange: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  monthComparison: {
    gap: 10,
  },
  monthData: {
    marginBottom: 10,
  },
  monthLabel: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 5,
    fontWeight: '500',
  },
  monthProgressBarContainer: {
    height: 6,
    backgroundColor: Colors.gray.light,
    borderRadius: 3,
    overflow: 'hidden',
  },
  monthProgressBar: {
    height: '100%',
    borderRadius: 3,
  },
});
