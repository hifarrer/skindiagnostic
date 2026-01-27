import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../constants/Colors';

const RoutineSteps = [
  { id: 'cleanser', label: 'Cleanser', completed: true, icon: '🧴' },
  { id: 'moisturizer', label: 'Moisturizer', completed: true, icon: '🧴' },
  { id: 'treatment', label: 'Treatment', completed: false, count: 3, icon: '➕' },
];

export default function RoutineScreen() {
  const personalisationPercentage = 60;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Daily Routines</Text>
          <TouchableOpacity>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Scan your daily products</Text>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLine} />
          {RoutineSteps.map((step, index) => (
            <View key={step.id} style={styles.stepContainer}>
              <View style={styles.stepCircle}>
                {step.completed ? (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                ) : (
                  <Text style={styles.stepCount}>{step.count}</Text>
                )}
              </View>
              <Text style={styles.stepLabel}>{step.label}</Text>
              <View style={styles.productCard}>
                <Text style={styles.productIcon}>{step.icon}</Text>
                {!step.completed && (
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.content}>
        {/* Personalisation Gauge */}
        <View style={styles.card}>
          <View style={styles.gaugeHeader}>
            <Text style={styles.cardTitle}>60% Personalisation of your daily routine</Text>
            <TouchableOpacity>
              <Text style={styles.helpIcon}>?</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.gaugeContainer}>
            <View style={styles.gaugeWrapper}>
              <View style={styles.gaugeSemiCircle}>
                <View style={styles.gaugeBackgroundArc} />
                <View 
                  style={[
                    styles.gaugeFillArc, 
                    { 
                      transform: [{ rotate: `${-90 + (personalisationPercentage * 1.8)}deg` }] 
                    }
                  ]} 
                />
              </View>
              <Text style={styles.gaugePercentage}>{personalisationPercentage}%</Text>
            </View>
          </View>
        </View>

        {/* Today's Plan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Plan</Text>
            <Text style={styles.lockIcon}>🔒</Text>
          </View>

          <TouchableOpacity style={styles.planCard}>
            <View style={styles.planIconContainer}>
              <Text style={styles.planIcon}>👤</Text>
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planTitle}>AM routine</Text>
              <Text style={styles.planSubtitle}>3 products</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.planCard}>
            <View style={styles.planIconContainer}>
              <Text style={styles.planIcon}>⏰</Text>
            </View>
            <View style={styles.planContent}>
              <Text style={styles.planTitle}>PM routine</Text>
              <Text style={styles.planSubtitle}>4 products</Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Skin School */}
        <TouchableOpacity style={styles.card}>
          <View style={styles.skinSchoolContent}>
            <View style={styles.skinSchoolIconContainer}>
              <Text style={styles.skinSchoolIcon}>🔍</Text>
            </View>
            <View style={styles.skinSchoolText}>
              <Text style={styles.skinSchoolTitle}>Skin School</Text>
              <Text style={styles.skinSchoolSubtitle}>
                Expert Teachings from our Dermatologist
              </Text>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </View>
        </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeIcon: {
    fontSize: 24,
    color: Colors.gray.dark,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
    marginBottom: 30,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    position: 'relative',
    paddingHorizontal: 10,
  },
  progressLine: {
    position: 'absolute',
    top: 20,
    left: '15%',
    right: '15%',
    height: 3,
    backgroundColor: Colors.background.lightBlue,
    zIndex: 0,
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    zIndex: 1,
  },
  stepCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  stepLabel: {
    fontSize: 12,
    color: Colors.text.primary,
    marginBottom: 10,
    fontWeight: '500',
  },
  productCard: {
    width: 80,
    height: 80,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray.medium,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  productIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  addPhotoText: {
    fontSize: 10,
    color: Colors.gray.dark,
    textAlign: 'center',
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
  gaugeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    flex: 1,
  },
  helpIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.gray.light,
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 14,
    color: Colors.gray.dark,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  gaugeWrapper: {
    width: 200,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  gaugeSemiCircle: {
    width: 200,
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  gaugeBackgroundArc: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: Colors.gray.light,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    top: 100,
  },
  gaugeFillArc: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 12,
    borderColor: Colors.primary.orange,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    top: 100,
    left: 0,
    transformOrigin: 'center bottom',
  },
  gaugePercentage: {
    position: 'absolute',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    top: 30,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginRight: 8,
  },
  lockIcon: {
    fontSize: 16,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.background.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  planIcon: {
    fontSize: 24,
  },
  planContent: {
    flex: 1,
  },
  planTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  planSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
  arrowIcon: {
    fontSize: 20,
    color: Colors.gray.dark,
  },
  skinSchoolContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skinSchoolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background.lightBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  skinSchoolIcon: {
    fontSize: 28,
  },
  skinSchoolText: {
    flex: 1,
  },
  skinSchoolTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 5,
  },
  skinSchoolSubtitle: {
    fontSize: 14,
    color: Colors.gray.dark,
  },
});
