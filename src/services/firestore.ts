// firestore.ts - Cloud sync service using Firebase Firestore
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  onSnapshot,
  Unsubscribe,
  writeBatch
} from "firebase/firestore";
import { auth } from "./firebase";
import { SearchRecord, UserSettings, SearchEngine } from "../types";

// Initialize Firestore
const db = getFirestore();

// Collection names
const RECORDS_COLLECTION = "searchRecords";
const SETTINGS_COLLECTION = "userSettings";

// Helper to get user-specific document paths
const getUserRecordsCollection = (userId: string) => 
  collection(db, "users", userId, RECORDS_COLLECTION);

const getUserSettingsDoc = (userId: string) => 
  doc(db, "users", userId, SETTINGS_COLLECTION, "preferences");

// ==================== SEARCH RECORDS ====================

/**
 * Save a single search record to Firestore
 */
export async function saveRecord(record: SearchRecord): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const recordRef = doc(getUserRecordsCollection(user.uid), record.id);
    await setDoc(recordRef, {
      ...record,
      userId: user.uid,
      syncedAt: Date.now(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error saving record:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Save multiple records in a batch (more efficient for bulk operations)
 */
export async function saveRecordsBatch(records: SearchRecord[]): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const batch = writeBatch(db);
    const userRecordsRef = getUserRecordsCollection(user.uid);

    records.forEach(record => {
      const recordRef = doc(userRecordsRef, record.id);
      batch.set(recordRef, {
        ...record,
        userId: user.uid,
        syncedAt: Date.now(),
      });
    });

    await batch.commit();
    return { success: true };
  } catch (error: any) {
    console.error("Error saving records batch:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get all search records for the current user
 */
export async function getRecords(): Promise<{ success: boolean; data?: SearchRecord[]; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const recordsQuery = query(
      getUserRecordsCollection(user.uid),
      orderBy("updatedAt", "desc")
    );
    
    const snapshot = await getDocs(recordsQuery);
    const records: SearchRecord[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      records.push({
        id: data.id,
        title: data.title,
        engine: data.engine,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        notes: data.notes,
        searches: data.searches || [],
      });
    });

    return { success: true, data: records };
  } catch (error: any) {
    console.error("Error getting records:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time updates for search records
 */
export function subscribeToRecords(
  callback: (records: SearchRecord[]) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const user = auth.currentUser;
  if (!user) {
    onError?.(new Error("User not authenticated"));
    return () => {};
  }

  const recordsQuery = query(
    getUserRecordsCollection(user.uid),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(
    recordsQuery,
    (snapshot) => {
      const records: SearchRecord[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        records.push({
          id: data.id,
          title: data.title,
          engine: data.engine,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          notes: data.notes,
          searches: data.searches || [],
        });
      });
      callback(records);
    },
    (error) => {
      console.error("Error in records subscription:", error);
      onError?.(error);
    }
  );
}

/**
 * Delete a search record
 */
export async function deleteRecord(recordId: string): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const recordRef = doc(getUserRecordsCollection(user.uid), recordId);
    await deleteDoc(recordRef);
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting record:", error);
    return { success: false, error: error.message };
  }
}

// ==================== USER SETTINGS ====================

/**
 * Save user settings to Firestore
 */
export async function saveSettings(settings: UserSettings): Promise<{ success: boolean; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const settingsRef = getUserSettingsDoc(user.uid);
    await setDoc(settingsRef, {
      ...settings,
      userId: user.uid,
      syncedAt: Date.now(),
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error saving settings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get user settings from Firestore
 */
export async function getSettings(): Promise<{ success: boolean; data?: UserSettings; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  try {
    const settingsRef = getUserSettingsDoc(user.uid);
    const snapshot = await getDoc(settingsRef);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        success: true,
        data: {
          appendedPhrase: data.appendedPhrase,
          isPrefix: data.isPrefix,
          engine: data.engine,
        },
      };
    }
    
    // Return default settings if none exist
    return {
      success: true,
      data: {
        appendedPhrase: "metaphysical properties of",
        isPrefix: true,
        engine: SearchEngine.GOOGLE,
      },
    };
  } catch (error: any) {
    console.error("Error getting settings:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Subscribe to real-time updates for settings
 */
export function subscribeToSettings(
  callback: (settings: UserSettings) => void,
  onError?: (error: Error) => void
): Unsubscribe {
  const user = auth.currentUser;
  if (!user) {
    onError?.(new Error("User not authenticated"));
    return () => {};
  }

  const settingsRef = getUserSettingsDoc(user.uid);

  return onSnapshot(
    settingsRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          appendedPhrase: data.appendedPhrase,
          isPrefix: data.isPrefix,
          engine: data.engine,
        });
      }
    },
    (error) => {
      console.error("Error in settings subscription:", error);
      onError?.(error);
    }
  );
}

// ==================== MIGRATION HELPERS ====================

/**
 * Migrate data from localStorage to Firestore (one-time operation)
 */
export async function migrateFromLocalStorage(): Promise<{ 
  success: boolean; 
  migratedRecords: number;
  migratedSettings: boolean;
  error?: string 
}> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, migratedRecords: 0, migratedSettings: false, error: "User not authenticated" };
  }

  let migratedRecords = 0;
  let migratedSettings = false;

  try {
    // Migrate records
    const savedRecords = localStorage.getItem('cys_records');
    if (savedRecords) {
      const records: SearchRecord[] = JSON.parse(savedRecords);
      if (records.length > 0) {
        const result = await saveRecordsBatch(records);
        if (result.success) {
          migratedRecords = records.length;
          // Clear localStorage after successful migration
          localStorage.removeItem('cys_records');
        }
      }
    }

    // Migrate settings
    const savedSettings = localStorage.getItem('cys_settings');
    if (savedSettings) {
      const settings: UserSettings = JSON.parse(savedSettings);
      const result = await saveSettings(settings);
      if (result.success) {
        migratedSettings = true;
        localStorage.removeItem('cys_settings');
      }
    }

    return { success: true, migratedRecords, migratedSettings };
  } catch (error: any) {
    console.error("Error during migration:", error);
    return { success: false, migratedRecords, migratedSettings, error: error.message };
  }
}

/**
 * Check if localStorage has data that needs migration
 */
export function hasLocalStorageData(): boolean {
  const records = localStorage.getItem('cys_records');
  const settings = localStorage.getItem('cys_settings');
  return !!(records || settings);
}

export { db };