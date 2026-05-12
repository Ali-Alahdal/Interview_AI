/**
 * AppContext — Global state management for InterviewAI Platform
 * Design: Modern Dark SaaS / Deep Space Intelligence
 *
 * Manages:
 * - Authentication state (user, role, token)
 * - Current course selection
 * - Interview session state
 * - Report data
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
// ─── Mock Data ────────────────────────────────────────────────────────────────
// Mocks removed as part of backend integration.
// Temporarily exporting empty arrays to prevent import errors before all components are refactored.
export const MOCK_COURSES = [];
export const MOCK_QUESTIONS = {};

// ─── Context ──────────────────────────────────────────────────────────────────
const AppContext = createContext(null);
const STORAGE_KEY = "interviewai_auth";
export function AppProvider({ children }) {
    const [state, setState] = useState(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (parsed.user) {
                    return {
                        user: parsed.user,
                        isAuthenticated: true,
                        selectedCourse: null,
                        interviewAnswers: [],
                        reportData: null,
                    };
                }
            }
        }
        catch {
            // ignore
        }
        return {
            user: null,
            isAuthenticated: false,
            selectedCourse: null,
            interviewAnswers: [],
            reportData: null,
        };
    });
    useEffect(() => {
        if (state.isAuthenticated && state.user) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: state.user }));
        }
        else {
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [state.isAuthenticated, state.user]);
    const login = useCallback((user) => {
        setState(prev => ({ ...prev, user, isAuthenticated: true }));
    }, []);
    const logout = useCallback(() => {
        setState({
            user: null,
            isAuthenticated: false,
            selectedCourse: null,
            interviewAnswers: [],
            reportData: null,
        });
    }, []);
    const selectCourse = useCallback((course) => {
        setState(prev => ({ ...prev, selectedCourse: course, interviewAnswers: [] }));
    }, []);
    const addAnswer = useCallback((answer) => {
        setState(prev => ({
            ...prev,
            interviewAnswers: [...prev.interviewAnswers.filter(a => a.questionId !== answer.questionId), answer],
        }));
    }, []);
    const clearAnswers = useCallback(() => {
        setState(prev => ({ ...prev, interviewAnswers: [] }));
    }, []);
    const setReportData = useCallback((data) => {
        setState(prev => ({ ...prev, reportData: data }));
    }, []);
    return (<AppContext.Provider value={{ ...state, login, logout, selectCourse, addAnswer, clearAnswers, setReportData }}>
      {children}
    </AppContext.Provider>);
}
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx)
        throw new Error("useApp must be used within AppProvider");
    return ctx;
}
