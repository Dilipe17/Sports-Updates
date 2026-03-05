import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  COLORS,
  SPACING,
  FONT_SIZE,
  FONT_WEIGHT,
  BORDER_RADIUS,
} from '../../../shared/theme.js';
import { sendChatMessage } from '../../../shared/api.js';
import { SPORT_CATEGORIES } from '../../../shared/theme.js';

const SPORT_FILTERS = [
  { id: 'all', label: 'All', icon: '🏅' },
  ...SPORT_CATEGORIES,
];

let messageIdCounter = 0;
function nextId() {
  messageIdCounter += 1;
  return `msg-${messageIdCounter}`;
}

const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'ai',
  text: "Hi! I'm your AI sports assistant. Ask me about live scores, recent news, standings, or anything sports-related. I pull live data from ESPN to keep you up to date!",
};

export default function ChatScreen() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const flatListRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg = { id: nextId(), role: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    setTimeout(scrollToBottom, 100);

    try {
      const { reply } = await sendChatMessage(text, selectedSport);
      const aiMsg = { id: nextId(), role: 'ai', text: reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errMsg = {
        id: nextId(),
        role: 'ai',
        text: "Sorry, I'm having trouble connecting right now. Make sure the Lambda endpoint is deployed (see lambda/chat/DEPLOY.md).",
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }, [inputText, isLoading, selectedSport, scrollToBottom]);

  const renderMessage = useCallback(({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAI]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAI,
            item.isError && styles.bubbleError,
          ]}
        >
          <Text style={[styles.bubbleText, item.isError && styles.errorText]}>
            {item.text}
          </Text>
        </View>
      </View>
    );
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Sport filter */}
      <View style={styles.filterRow}>
        <FlatList
          data={SPORT_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedSport === item.id && styles.filterChipActive,
              ]}
              onPress={() => setSelectedSport(item.id)}
              activeOpacity={0.75}
            >
              <Text style={styles.filterIcon}>{item.icon}</Text>
              <Text
                style={[
                  styles.filterLabel,
                  selectedSport === item.id && styles.filterLabelActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Message list */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={scrollToBottom}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing indicator */}
      {isLoading && (
        <View style={styles.typingRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🤖</Text>
          </View>
          <View style={[styles.bubble, styles.bubbleAI, styles.typingBubble]}>
            <ActivityIndicator size="small" color={COLORS.textMuted} />
          </View>
        </View>
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ask about scores, news, standings…"
          placeholderTextColor={COLORS.textMuted}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          editable={!isLoading}
          multiline={false}
        />
        <TouchableOpacity
          style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading || !inputText.trim()}
          activeOpacity={0.8}
        >
          <Text style={styles.sendIcon}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },

  // ── Sport filter bar ──
  filterRow: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    marginRight: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  filterIcon: {
    fontSize: FONT_SIZE.md,
    marginRight: 4,
  },
  filterLabel: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    fontWeight: FONT_WEIGHT.medium,
  },
  filterLabelActive: {
    color: COLORS.text,
    fontWeight: FONT_WEIGHT.bold,
  },

  // ── Messages ──
  messageList: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    alignItems: 'flex-end',
  },
  rowUser: {
    justifyContent: 'flex-end',
  },
  rowAI: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    maxWidth: '78%',
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  bubbleUser: {
    backgroundColor: COLORS.accent,
    borderBottomRightRadius: BORDER_RADIUS.sm,
  },
  bubbleAI: {
    backgroundColor: COLORS.surface,
    borderBottomLeftRadius: BORDER_RADIUS.sm,
  },
  bubbleError: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  bubbleText: {
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    lineHeight: 21,
  },
  errorText: {
    color: COLORS.warning,
  },

  // ── Typing indicator ──
  typingRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  typingBubble: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },

  // ── Input bar ──
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.secondary,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: Platform.OS === 'ios' ? SPACING.sm : SPACING.xs,
    color: COLORS.text,
    fontSize: FONT_SIZE.md,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.surfaceLight,
  },
  sendIcon: {
    color: COLORS.text,
    fontSize: FONT_SIZE.lg,
    fontWeight: FONT_WEIGHT.bold,
  },
});
