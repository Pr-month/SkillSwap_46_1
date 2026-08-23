"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_entity_1 = require("../categories/entities/category.entity");
const subcategory_entity_1 = require("../categories/entities/subcategory.entity");
const data_source_1 = require("./data-source");
const categories_data_1 = require("./data/categories.data");
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        const AppDataSource = yield (0, data_source_1.getAppDataSource)();
        yield AppDataSource.initialize();
        const categoryRepo = AppDataSource.getRepository(category_entity_1.Category);
        const subcategoryRepo = AppDataSource.getRepository(subcategory_entity_1.Subcategory);
        const existing = yield categoryRepo.count();
        if (existing > 0) {
            console.log('Категории уже есть в БД, сидинг пропущен');
            yield AppDataSource.destroy();
            return;
        }
        for (const { name, subcategories } of categories_data_1.categoriesSeedData) {
            const category = yield categoryRepo.save(categoryRepo.create({ name }));
            const subcategoryEntities = subcategories.map((subName) => subcategoryRepo.create({ name: subName, categoryId: category.id }));
            yield subcategoryRepo.save(subcategoryEntities);
        }
        console.log(`Сид категорий успешно выполнен: создано ${categories_data_1.categoriesSeedData.length} категорий`);
        yield AppDataSource.destroy();
    });
}
seed().catch((e) => {
    console.error('Ошибка при сидировании категорий:', e);
    process.exit(1);
});
//# sourceMappingURL=seed-categories.js.map