import type {
  AdhkarCategory,
  Dhikr,
  SavedDhikr,
  DhikrCount,
  AdhkarBroadTag,
  AdhkarSeedData,
  SuperCategory,
  SuperCategorySection,
} from '../../types/adhkar';

class AdhkarDatabaseService {
  async initialize(): Promise<void> {}
  async needsReseed(): Promise<boolean> { return false; }
  async updateDataVersion(): Promise<void> {}
  async getAllCategories(): Promise<AdhkarCategory[]> { return []; }
  async getCategoriesByTag(_tag: AdhkarBroadTag): Promise<AdhkarCategory[]> { return []; }
  async getAdhkarInCategory(_categoryId: string): Promise<Dhikr[]> { return []; }
  async getAdhkarByCategoryIds(_categoryIds: string[]): Promise<Dhikr[]> { return []; }
  async getDhikr(_id: string): Promise<Dhikr | null> { return null; }
  async toggleSaved(_dhikrId: string): Promise<boolean> { return false; }
  async getSaved(): Promise<SavedDhikr[]> { return []; }
  async getDhikrCount(_dhikrId: string): Promise<DhikrCount | null> { return null; }
  async updateDhikrCount(_dhikrId: string, _count: number): Promise<void> {}
  async getAllSuperCategories(): Promise<SuperCategory[]> { return []; }
  async getSuperCategoriesBySection(_section: SuperCategorySection): Promise<SuperCategory[]> { return []; }
  async seedDatabase(_data: AdhkarSeedData): Promise<void> {}
}

export const adhkarDatabaseService = new AdhkarDatabaseService();
export default adhkarDatabaseService;
