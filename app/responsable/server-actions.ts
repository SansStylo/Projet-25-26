'use server';

import { getFilteredDataByClasses } from './responsable-actions';

export async function fetchFilteredData(classIds: number[]) {
  try {
    return await getFilteredDataByClasses(classIds);
  } catch (error) {
    console.error("Erreur [fetchFilteredData]:", error);
    return { success: false, error: "Erreur lors du chargement des données." };
  }
}
