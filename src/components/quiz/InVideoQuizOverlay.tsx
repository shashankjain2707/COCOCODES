/**
 * In-Video Quiz Overlay Component
 * Displays interactive quizzes that pause the video for engagement
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../styles/theme';
import { GlassCard } from '../common/GlassCard';
import { QuizQuestion } from '../../types/video';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface InVideoQuizOverlayProps {
  quiz: QuizQuestion;
  onComplete: (quizId: string, selectedAnswer: number, correct: boolean) => void;
  onSkip: () => void;
}

export const InVideoQuizOverlay: React.FC<InVideoQuizOverlayProps> = ({
  quiz,
  onComplete,
  onSkip,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [slideAnimation] = useState(new Animated.Value(0));

  // Animation for quiz appearance
  useEffect(() => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  /**
   * Handle option selection
   */
  const handleOptionSelect = (optionIndex: number) => {
    if (showResult) return;
    setSelectedOption(optionIndex);
  };

  /**
   * Submit quiz answer
   */
  const handleSubmit = () => {
    if (selectedOption === null) return;

    const correct = selectedOption === quiz.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    // Auto-continue after showing result
    setTimeout(() => {
      const timeSpent = (Date.now() - startTime) / 1000;
      onComplete(quiz.id, selectedOption, correct);
    }, 2500);
  };

  /**
   * Skip quiz
   */
  const handleSkip = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onSkip();
    });
  };

  /**
   * Get option style based on state
   */
  const getOptionStyle = (index: number) => {
    if (!showResult) {
      if (selectedOption === index) {
        return [styles.option, styles.optionSelected];
      }
      return styles.option;
    } else {
      if (index === quiz.correctAnswer) {
        return [styles.option, styles.optionCorrect];
      } else if (selectedOption === index && selectedOption !== quiz.correctAnswer) {
        return [styles.option, styles.optionIncorrect];
      } else {
        return [styles.option, styles.optionFaded];
      }
    }
  };

  /**
   * Get option icon
   */
  const getOptionIcon = (index: number) => {
    if (!showResult) {
      return selectedOption === index ? 'radiobox-marked' : 'radiobox-blank';
    }
    
    if (index === quiz.correctAnswer) {
      return 'check-circle';
    } else if (selectedOption === index && selectedOption !== quiz.correctAnswer) {
      return 'close-circle';
    }
    
    return 'radiobox-blank';
  };

  /**
   * Get option icon color
   */
  const getOptionIconColor = (index: number) => {
    if (!showResult) {
      return selectedOption === index ? theme.colors.primary : theme.colors.textSecondary;
    }
    
    if (index === quiz.correctAnswer) {
      return theme.colors.success;
    } else if (selectedOption === index && selectedOption !== quiz.correctAnswer) {
      return theme.colors.error;
    }
    
    return theme.colors.textSecondary;
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: slideAnimation,
              transform: [
                {
                  translateY: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <GlassCard style={styles.quizCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <MaterialCommunityIcons
                  name="lightbulb-on"
                  size={24}
                  color={theme.colors.primary}
                />
                <Text style={styles.headerTitle}>Quick Check</Text>
              </View>
              
              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <MaterialCommunityIcons
                  name="close"
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Quiz Difficulty Badge */}
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyText}>
                {quiz.difficulty.toUpperCase()}
              </Text>
            </View>

            {/* Question */}
            <Text style={styles.question}>{quiz.question}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {quiz.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleOptionSelect(index)}
                  style={getOptionStyle(index)}
                  disabled={showResult}
                >
                  <MaterialCommunityIcons
                    name={getOptionIcon(index)}
                    size={20}
                    color={getOptionIconColor(index)}
                    style={styles.optionIcon}
                  />
                  <Text style={[
                    styles.optionText,
                    showResult && index === quiz.correctAnswer && styles.optionTextCorrect,
                    showResult && selectedOption === index && selectedOption !== quiz.correctAnswer && styles.optionTextIncorrect,
                  ]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Result Section */}
            {showResult ? (
              <View style={styles.resultContainer}>
                <View style={[
                  styles.resultHeader,
                  { backgroundColor: isCorrect ? theme.colors.success : theme.colors.error }
                ]}>
                  <MaterialCommunityIcons
                    name={isCorrect ? 'check-circle-outline' : 'close-circle-outline'}
                    size={20}
                    color="white"
                  />
                  <Text style={styles.resultText}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </Text>
                </View>
                
                <Text style={styles.explanation}>
                  {quiz.explanation}
                </Text>
                
                <View style={styles.resultFooter}>
                  <Text style={styles.continueText}>
                    Continuing video in a moment...
                  </Text>
                </View>
              </View>
            ) : (
              /* Submit Button */
              <TouchableOpacity
                onPress={handleSubmit}
                style={[
                  styles.submitButton,
                  selectedOption === null && styles.submitButtonDisabled
                ]}
                disabled={selectedOption === null}
              >
                <LinearGradient
                  colors={selectedOption !== null 
                    ? [theme.colors.primary, theme.colors.secondary]
                    : [theme.colors.surface, theme.colors.surface]
                  }
                  style={styles.submitGradient}
                >
                  <Text style={[
                    styles.submitText,
                    selectedOption === null && styles.submitTextDisabled
                  ]}>
                    Submit Answer
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            )}

            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                Quiz {quiz.keyTopic ? `• ${quiz.keyTopic}` : ''}
              </Text>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
  },
  quizCard: {
    padding: 24,
    margin: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600' as any,
    marginLeft: 8,
  },
  skipButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  difficultyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  difficultyText: {
    color: 'white',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: '700' as any,
  },
  question: {
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.md,
    fontWeight: '500' as any,
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  optionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: theme.colors.primary,
  },
  optionCorrect: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: theme.colors.success,
  },
  optionIncorrect: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: theme.colors.error,
  },
  optionFaded: {
    opacity: 0.5,
  },
  optionIcon: {
    marginRight: 12,
  },
  optionText: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
  },
  optionTextCorrect: {
    color: theme.colors.success,
    fontWeight: '500' as any,
  },
  optionTextIncorrect: {
    color: theme.colors.error,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitGradient: {
    padding: 16,
    alignItems: 'center',
  },
  submitText: {
    color: 'white',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600' as any,
  },
  submitTextDisabled: {
    color: theme.colors.textSecondary,
  },
  resultContainer: {
    marginBottom: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resultText: {
    color: 'white',
    fontSize: theme.typography.fontSize.md,
    fontWeight: '600' as any,
    marginLeft: 8,
  },
  explanation: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.sm,
    lineHeight: 20,
    marginBottom: 12,
  },
  resultFooter: {
    alignItems: 'center',
  },
  continueText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
    fontStyle: 'italic',
  },
  progressContainer: {
    alignItems: 'center',
  },
  progressText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.fontSize.xs,
  },
});

export default InVideoQuizOverlay;
