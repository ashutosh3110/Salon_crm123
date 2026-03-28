import serviceRepository from './service.repository.js';
import Category from './category.model.js';
import Outlet from '../outlet/outlet.model.js';
import cacheService from '../../utils/cache.service.js';
import pkg from 'xlsx';
const { readFile, utils } = pkg;
import fs from 'fs';

import Service from './service.model.js';

class ServiceCatalogService {
    constructor() {
        this.model = Service;
    }
    async createService(tenantId, serviceData) {
        const service = await serviceRepository.create({ ...serviceData, tenantId });
        // Invalidate cache on change
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    async queryServices(tenantId, filter, options) {
        const cacheKey = cacheService.generateKey(tenantId, 'services', 'list');

        // Only cache if it's a default list query (page 1, no filters)
        const isDefaultQuery = Object.keys(filter).length === 0 && options.page === 1;

        if (isDefaultQuery) {
            const cachedData = await cacheService.get(cacheKey);
            if (cachedData) return cachedData;
        }

        const result = await serviceRepository.find({ ...filter, tenantId }, options);

        if (isDefaultQuery) {
            await cacheService.set(cacheKey, result, 300); // Cache for 5 mins
        }

        return result;
    }

    async getServiceById(tenantId, serviceId) {
        const service = await serviceRepository.findOne({ _id: serviceId, tenantId });
        if (!service) throw new Error('Service not found');
        return service;
    }

    async updateServiceById(tenantId, serviceId, updateBody) {
        const service = await this.getServiceById(tenantId, serviceId);
        Object.assign(service, updateBody);
        await service.save();
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    async deleteServiceById(tenantId, serviceId) {
        const service = await this.getServiceById(tenantId, serviceId);
        await (service.remove ? service.remove() : service.deleteOne());
        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));
        return service;
    }

    // Category Methods
    async queryCategories(tenantId) {
        return Category.find({ tenantId });
    }

    async createCategory(tenantId, categoryData) {
        const category = await Category.create({ ...categoryData, tenantId });
        return category;
    }

    async updateCategoryById(tenantId, categoryId, updateBody) {
        const category = await Category.findOne({ _id: categoryId, tenantId });
        if (!category) throw new Error('Category not found');
        Object.assign(category, updateBody);
        await category.save();
        return category;
    }

    async deleteCategoryById(tenantId, categoryId) {
        const category = await Category.findOne({ _id: categoryId, tenantId });
        if (!category) throw new Error('Category not found');
        await (category.remove ? category.remove() : category.deleteOne());
        return category;
    }

    async bulkImportServices(tenantId, filePath) {
        console.log('[DEBUG] Importing services from:', filePath);
        if (!fs.existsSync(filePath)) {
            console.error('[IMPORT ERROR] File not found at path:', filePath);
            throw new Error(`File not found at path: ${filePath}`);
        }
        let workbook;
        try {
            workbook = readFile(filePath);
        } catch (error) {
            console.error('[IMPORT ERROR] readFile failed:', error);
            throw new Error(`Failed to read Excel file: ${error.message}`);
        }

        const sheetName = workbook.SheetNames[0];
        const data = utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (!data || data.length === 0) {
            throw new Error('The uploaded file is empty.');
        }

        // 1. Fetch all existing categories and outlets for the tenant to minimize DB calls
        const [existingCategories, allOutlets] = await Promise.all([
            Category.find({ tenantId }),
            Outlet.find({ tenantId, status: 'active' })
        ]);

        const categoryMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c]));
        const outletMap = new Map(allOutlets.map(o => [o.name.toLowerCase(), o._id]));

        const newCategoriesToCreate = new Set();
        const servicesToInsert = [];
        const errors = [];

        // 2. Identify missing categories
        data.forEach((row, index) => {
            const catName = String(row['Category'] || row['category'] || '').trim();
            if (catName && !categoryMap.has(catName.toLowerCase())) {
                newCategoriesToCreate.add(catName);
            }
        });

        // 3. Create missing categories
        if (newCategoriesToCreate.size > 0) {
            const createdCats = await Promise.all(
                Array.from(newCategoriesToCreate).map(name => 
                    Category.create({ name, tenantId, gender: 'both', status: 'active' })
                )
            );
            createdCats.forEach(c => categoryMap.set(c.name.toLowerCase(), c));
        }

        // 4. Process services
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const name = String(row['Name'] || row['name'] || '').trim();
            const category = String(row['Category'] || row['category'] || '').trim();
            const price = parseFloat(row['Price'] || row['price']);
            const duration = parseInt(row['Duration'] || row['Duration (mins)'] || row['duration']);

            // Basic validation
            if (!name || isNaN(price) || isNaN(duration)) {
                errors.push(`Row ${i + 2}: Missing required fields (Name, Price, or Duration).`);
                continue;
            }

            // Resolve Outlets
            let outletIds = [];
            const outletStr = String(row['Outlets'] || row['Outlets (Comma Separated)'] || row['outlets'] || '').trim();
            if (outletStr) {
                const names = outletStr.split(',').map(n => n.trim().toLowerCase()).filter(Boolean);
                outletIds = names.map(n => outletMap.get(n)).filter(Boolean);
            } else {
                // Default to all active outlets if nothing specified
                outletIds = allOutlets.map(o => o._id);
            }

            servicesToInsert.push({
                tenantId,
                name,
                category, // Stores as string
                price,
                duration,
                description: String(row['Description'] || row['description'] || '').trim(),
                gst: parseFloat(row['GST %'] || row['gst']) || 18,
                commissionApplicable: row['Commission Applicable'] !== 'No' && row['commissionApplicable'] !== false,
                commissionType: ['percent', 'fixed'].includes(row['Commission Type']) ? row['Commission Type'] : 'percent',
                commissionValue: parseFloat(row['Commission Value']) || 0,
                outletIds,
                status: 'active'
            });
        }

        // 5. Bulk insert (and handle duplicates via name + tenantId unique index gracefully)
        let importedCount = 0;
        if (servicesToInsert.length > 0) {
            try {
                // insertMany with ordered: false to skip duplicates and continue
                const result = await this.model.insertMany(servicesToInsert, { ordered: false });
                importedCount = result.length;
            } catch (error) {
                // If it's a bulk write error, some might have succeeded
                if (error.name === 'MongoBulkWriteError' || error.writeErrors) {
                    importedCount = error.result?.nInserted || 0;
                    const duplicates = (error.writeErrors || []).filter(e => e.code === 11000).length;
                    if (duplicates > 0) {
                        errors.push(`${duplicates} services were skipped because they already exist.`);
                    }
                } else {
                    throw error;
                }
            }
        }

        // Clean up
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }

        await cacheService.del(cacheService.generateKey(tenantId, 'services', 'list'));

        return {
            success: true,
            importedCount,
            totalRows: data.length,
            errors: errors.length > 0 ? errors : null
        };
    }
}

export default new ServiceCatalogService();
