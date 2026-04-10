/**
 * Safely clears user session data while preserving persistent preferences
 */
export const clearUserSession = () => {
    // Keys to preserve across logins/logouts
    const preserveKeys = [
        'remembered_school_domain',
        'student_search',
        'student_session',
        'student_class',
        'student_section'
    ];

    // Capture preserved data
    const preserved: Record<string, string | null> = {};
    preserveKeys.forEach(key => {
        preserved[key] = localStorage.getItem(key);
    });

    // Clear everything
    localStorage.clear();

    // Restore preserved data
    preserveKeys.forEach(key => {
        if (preserved[key] !== null) {
            localStorage.setItem(key, preserved[key]!);
        }
    });
};
