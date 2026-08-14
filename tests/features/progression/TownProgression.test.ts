import { TownManagerUseCase } from '../../../src/features/progression/application/TownManagerUseCase';
import { ApplyProgressionUseCase } from '../../../src/features/progression/application/ApplyProgressionUseCase';
import { TownData, INITIAL_TOWN_DATA } from '../../../src/features/progression/domain/TownData';
import { Unit } from '../../../src/features/combat/domain/Unit';
import { WeaponType } from '../../../src/features/combat/domain/WeaponType';

describe('Meta-Progression Core Logic', () => {
  let townData: TownData;

  beforeEach(() => {
    townData = JSON.parse(JSON.stringify(INITIAL_TOWN_DATA));
  });

  describe('TownManagerUseCase', () => {
    it('should allow adding gold', () => {
      const manager = new TownManagerUseCase(townData);
      manager.addGold(100);
      expect(manager.getTownData().gold).toBe(100);
    });

    it('should allow buying upgrades if sufficient gold', () => {
      const manager = new TownManagerUseCase(townData);
      manager.addGold(TownManagerUseCase.UPGRADE_COSTS.maxHp + 10);

      const success = manager.buyUpgrade('maxHp');

      expect(success).toBe(true);
      expect(manager.getTownData().gold).toBe(10);
      expect(manager.getTownData().upgrades.maxHp).toBe(TownManagerUseCase.UPGRADE_VALUES.maxHp);
    });

    it('should prevent buying upgrades if insufficient gold', () => {
      const manager = new TownManagerUseCase(townData);
      manager.addGold(TownManagerUseCase.UPGRADE_COSTS.attack - 10);

      const success = manager.buyUpgrade('attack');

      expect(success).toBe(false);
      expect(manager.getTownData().upgrades.attack).toBe(0);
    });

    it('should allow storing up to MAX_STORAGE items', () => {
      const manager = new TownManagerUseCase(townData);
      for (let i = 0; i < TownManagerUseCase.MAX_STORAGE; i++) {
        expect(manager.storeItem(`item_${i}`)).toBe(true);
      }
      expect(manager.storeItem('extra_item')).toBe(false); // Should fail
      expect(manager.getTownData().storedItems.length).toBe(TownManagerUseCase.MAX_STORAGE);
    });

    it('should allow withdrawing an item', () => {
      const manager = new TownManagerUseCase(townData);
      manager.storeItem('rare_sword');

      const success = manager.withdrawItem('rare_sword');

      expect(success).toBe(true);
      expect(manager.getTownData().storedItems.length).toBe(0);
    });
  });

  describe('ApplyProgressionUseCase', () => {
    it('should apply unlocked upgrades to a new unit', () => {
      townData.upgrades.maxHp = 20;
      townData.upgrades.maxBelly = 40;
      townData.upgrades.attack = 2;

      const unit = new Unit('hero', 'Hero', 30, 10, 5, WeaponType.SWORD);
      unit.belly = 100;
      unit.maxBelly = 100;

      ApplyProgressionUseCase.execute(unit, townData);

      expect(unit.maxHp).toBe(50);
      expect(unit.currentHp).toBe(50);
      expect(unit.maxBelly).toBe(140);
      expect(unit.belly).toBe(140);
      expect(unit.attack).toBe(12);
    });
  });
});
